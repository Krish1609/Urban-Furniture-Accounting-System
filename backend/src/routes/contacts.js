import { Router } from 'express';

import { prisma } from '../lib/prisma.js';
import { resolveOrganizationId } from '../lib/organization.js';
import { handleKnownPrismaErrors } from '../lib/prismaErrors.js';
import { isNonEmptyString, isValidEmail } from '../lib/validators.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

const CONTACT_TYPES = ['customer', 'vendor', 'both'];

router.get('/contacts', requireAuth, async (req, res, next) => {
  try {
    const { organization_id: organizationId } = req.query;
    const contacts = await prisma.contacts.findMany({
      where: {
        is_active: true,
        ...(organizationId ? { organization_id: organizationId } : {}),
      },
      orderBy: { display_name: 'asc' },
    });
    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

router.post('/contacts', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const {
      display_name: displayName,
      contact_type: contactType,
      email,
      phone,
      profile_media_url: profileMediaUrl,
      organization_id: organizationId,
    } = req.body ?? {};

    if (!isNonEmptyString(displayName)) {
      return res.status(400).json({ error: 'display_name is required' });
    }
    if (!CONTACT_TYPES.includes(contactType)) {
      return res.status(400).json({ error: `contact_type must be one of: ${CONTACT_TYPES.join(', ')}` });
    }
    if (email !== undefined && email !== null && !isValidEmail(email)) {
      return res.status(400).json({ error: 'email must be a valid email address' });
    }

    const resolvedOrganizationId = await resolveOrganizationId(organizationId);
    if (!resolvedOrganizationId) {
      return res.status(400).json({ error: 'organization_id is required' });
    }

    const contact = await prisma.contacts.create({
      data: {
        organization_id: resolvedOrganizationId,
        display_name: displayName,
        contact_type: contactType,
        email: email ?? null,
        phone: phone ?? null,
        profile_media_url: profileMediaUrl ?? null,
        created_by_user_id: req.user.id,
      },
    });
    res.status(201).json(contact);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

router.patch('/contacts/:id/archive', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const contact = await prisma.contacts.update({
      where: { id: req.params.id },
      data: { is_active: false, updated_by_user_id: req.user.id },
    });
    res.json(contact);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

export default router;
