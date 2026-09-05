import { Router } from 'express';

import { prisma } from '../lib/prisma.js';
import { resolveOrganizationId } from '../lib/organization.js';
import { handleKnownPrismaErrors } from '../lib/prismaErrors.js';
import { isNonEmptyString } from '../lib/validators.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

const ACCOUNT_TYPES = ['asset', 'liability', 'equity', 'income', 'expense'];

router.get('/chart-of-accounts', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const { organization_id: organizationId } = req.query;
    const accounts = await prisma.chart_of_accounts.findMany({
      where: {
        is_active: true,
        ...(organizationId ? { organization_id: organizationId } : {}),
      },
      orderBy: { account_code: 'asc' },
    });
    res.json(accounts);
  } catch (error) {
    next(error);
  }
});

router.post('/chart-of-accounts', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const {
      account_code: accountCode,
      name,
      account_type: accountType,
      allow_manual_posting: allowManualPosting,
      organization_id: organizationId,
    } = req.body ?? {};

    if (!isNonEmptyString(accountCode)) {
      return res.status(400).json({ error: 'account_code is required' });
    }
    if (!isNonEmptyString(name)) {
      return res.status(400).json({ error: 'name is required' });
    }
    if (!ACCOUNT_TYPES.includes(accountType)) {
      return res.status(400).json({ error: `account_type must be one of: ${ACCOUNT_TYPES.join(', ')}` });
    }
    if (allowManualPosting !== undefined && typeof allowManualPosting !== 'boolean') {
      return res.status(400).json({ error: 'allow_manual_posting must be a boolean' });
    }

    const resolvedOrganizationId = await resolveOrganizationId(organizationId);
    if (!resolvedOrganizationId) {
      return res.status(400).json({ error: 'organization_id is required' });
    }

    const account = await prisma.chart_of_accounts.create({
      data: {
        organization_id: resolvedOrganizationId,
        account_code: accountCode,
        name,
        account_type: accountType,
        allow_manual_posting: allowManualPosting ?? true,
        created_by_user_id: req.user.id,
      },
    });
    res.status(201).json(account);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

router.patch('/chart-of-accounts/:id/archive', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const account = await prisma.chart_of_accounts.update({
      where: { id: req.params.id },
      data: { is_active: false, updated_by_user_id: req.user.id },
    });
    res.json(account);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

export default router;
