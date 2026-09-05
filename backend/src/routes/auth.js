import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Router } from 'express';
import jwt from 'jsonwebtoken';

import { prisma } from '../lib/prisma.js';
import { resolveOrganizationId } from '../lib/organization.js';
import { normalizeRole, requireAuth, requireRole, ROLES } from '../middleware/auth.js';

const router = Router();

const NIL_INSTANCE_ID = '00000000-0000-0000-0000-000000000000';
const LOGIN_ID_PATTERN = /^[A-Za-z0-9_]{6,12}$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const USER_ROLES = ['ADMIN', 'ACCOUNTANT', 'USER'];

const ROLE_TO_DATABASE = {
  ADMIN: 'admin',
  ACCOUNTANT: 'accountant',
  USER: 'contact_portal',
};

function validateLoginId(loginId) {
  if (typeof loginId !== 'string' || !LOGIN_ID_PATTERN.test(loginId)) {
    return 'login_id must be 6-12 letters, digits, or underscores';
  }
  return null;
}

function validatePassword(password) {
  if (typeof password !== 'string' || !PASSWORD_PATTERN.test(password)) {
    return 'password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character';
  }
  return null;
}

async function ensureEmailAndLoginIdAvailable(email, loginId) {
  const existing = await prisma.app_users.findFirst({
    where: { OR: [{ email }, { login_id: loginId }] },
    select: { email: true, login_id: true },
  });
  if (!existing) return null;
  if (existing.email.toLowerCase() === email.toLowerCase()) return 'email is already in use';
  return 'login_id is already in use';
}

// Inserts into auth.users; the on_auth_user_created DB trigger creates the matching
// public.app_users row (using raw_user_meta_data.login_id/display_name) in the same transaction.
async function createAuthAndAppUser({ email, password, loginId, displayName }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date();

  const authUser = await prisma.users.create({
    data: {
      id: randomUUID(),
      instance_id: NIL_INSTANCE_ID,
      aud: 'authenticated',
      role: 'authenticated',
      email,
      encrypted_password: passwordHash,
      email_confirmed_at: now,
      created_at: now,
      updated_at: now,
      raw_app_meta_data: { provider: 'email', providers: ['email'] },
      raw_user_meta_data: { login_id: loginId, display_name: displayName },
    },
  });

  const appUser = await prisma.app_users.findUniqueOrThrow({ where: { id: authUser.id } });
  return appUser;
}

const handleSignupOrRegister = async (req, res) => {
  const {
    email,
    password,
    login_id,
    loginId = login_id,
    display_name,
    name,
    displayName = display_name || name,
    organization_id,
    organizationId = organization_id,
  } = req.body ?? {};

  if (!email || !password || !loginId || !displayName) {
    return res.status(400).json({ error: 'email, password, login_id, and display_name are required' });
  }

  const loginIdError = validateLoginId(loginId);
  if (loginIdError) return res.status(400).json({ error: loginIdError });

  const passwordError = validatePassword(password);
  if (passwordError) return res.status(400).json({ error: passwordError });

  const conflict = await ensureEmailAndLoginIdAvailable(email, loginId);
  if (conflict) return res.status(409).json({ error: conflict });

  const resolvedOrganizationId = await resolveOrganizationId(organizationId);
  if (!resolvedOrganizationId) {
    return res.status(400).json({ error: 'organization_id is required' });
  }

  const appUser = await createAuthAndAppUser({ email, password, loginId, displayName });

  // Public self-service signup must never accept a caller-supplied role - admin/contact_portal
  // accounts can only be created via the admin-only POST /create-user endpoint below.
  const membership = await prisma.organization_memberships.create({
    data: {
      organization_id: resolvedOrganizationId,
      user_id: appUser.id,
      role: 'accountant',
    },
  });

  return res.status(201).json({
    id: appUser.id,
    email: appUser.email,
    login_id: appUser.login_id,
    display_name: appUser.display_name,
    role: normalizeRole(membership.role),
    organization_id: membership.organization_id,
  });
};

router.post('/signup', handleSignupOrRegister);
router.post('/register', handleSignupOrRegister);

router.post('/create-user', requireAuth, requireRole('admin'), async (req, res) => {
  const {
    email,
    password,
    login_id: loginId,
    display_name: displayName,
    role,
    organization_id: organizationId,
    contact_id: contactId,
  } = req.body ?? {};

  if (!email || !password || !loginId || !displayName || !role) {
    return res.status(400).json({ error: 'email, password, login_id, display_name, and role are required' });
  }

  const canonicalRole = normalizeRole(role);
  if (!canonicalRole || !USER_ROLES.includes(canonicalRole)) {
    return res.status(400).json({ error: `role must be one of: ${USER_ROLES.join(', ')}` });
  }

  if (canonicalRole === ROLES.USER && !contactId) {
    return res.status(400).json({ error: 'contact_id is required when role is USER' });
  }

  const loginIdError = validateLoginId(loginId);
  if (loginIdError) return res.status(400).json({ error: loginIdError });

  const passwordError = validatePassword(password);
  if (passwordError) return res.status(400).json({ error: passwordError });

  const conflict = await ensureEmailAndLoginIdAvailable(email, loginId);
  if (conflict) return res.status(409).json({ error: conflict });

  const resolvedOrganizationId = await resolveOrganizationId(organizationId);
  if (!resolvedOrganizationId) {
    return res.status(400).json({ error: 'organization_id is required' });
  }

  if (contactId) {
    const contact = await prisma.contacts.findFirst({
      where: { id: contactId, organization_id: resolvedOrganizationId },
      select: { id: true },
    });
    if (!contact) return res.status(400).json({ error: 'contact_id does not belong to organization_id' });
  }

  const appUser = await createAuthAndAppUser({ email, password, loginId, displayName });

  const membership = await prisma.organization_memberships.create({
    data: {
      organization_id: resolvedOrganizationId,
      user_id: appUser.id,
      role: ROLE_TO_DATABASE[canonicalRole],
      created_by_user_id: req.user.id,
    },
  });

  if (canonicalRole === ROLES.USER) {
    await prisma.contact_portal_accounts.create({
      data: { contact_id: contactId, membership_id: membership.id },
    });
  }

  return res.status(201).json({
    id: appUser.id,
    email: appUser.email,
    login_id: appUser.login_id,
    display_name: appUser.display_name,
    role: normalizeRole(membership.role),
    organization_id: membership.organization_id,
    contact_id: canonicalRole === ROLES.USER ? contactId : null,
  });
});

router.post('/login', async (req, res) => {
  const { login_id, loginId = login_id, password } = req.body ?? {};

  if (!loginId || !password) {
    return res.status(400).json({ error: 'login_id and password are required' });
  }

  const identifier = String(loginId).trim();
  const appUser = await prisma.app_users.findFirst({
    where: {
      OR: [
        { login_id: identifier },
        { email: identifier },
      ],
    },
  });
  if (!appUser || !appUser.is_active || appUser.deleted_at) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const authUser = await prisma.users.findUnique({ where: { id: appUser.id } });
  const passwordMatches = authUser?.encrypted_password
    ? await bcrypt.compare(password, authUser.encrypted_password)
    : false;
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const membership = await prisma.organization_memberships.findFirst({
    where: { user_id: appUser.id, is_active: true },
    orderBy: { created_at: 'asc' },
  });
  if (!membership) {
    return res.status(403).json({ error: 'No active organization membership' });
  }

  const role = normalizeRole(membership.role);
  let contactId = null;
  if (role === ROLES.USER) {
    const portalAccount = await prisma.contact_portal_accounts.findUnique({
      where: { membership_id: membership.id },
      select: { contact_id: true },
    });
    contactId = portalAccount?.contact_id ?? null;
  }

  const token = jwt.sign(
    { id: appUser.id, role, contact_id: contactId },
    process.env.JWT_SECRET,
    { expiresIn: '12h' },
  );

  return res.json({
    token,
    user: {
      id: appUser.id,
      email: appUser.email,
      login_id: appUser.login_id,
      display_name: appUser.display_name,
      role,
      organization_id: membership.organization_id,
      contact_id: contactId,
    },
  });
});

export default router;
