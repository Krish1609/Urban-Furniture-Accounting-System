import { Router } from 'express';

import { prisma } from '../lib/prisma.js';
import { resolveOrganizationId } from '../lib/organization.js';
import { handleKnownPrismaErrors } from '../lib/prismaErrors.js';
import { isNonEmptyString } from '../lib/validators.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

const ANALYTIC_TYPES = ['income', 'expense', 'mixed'];

router.get('/analytic-accounts', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const { organization_id: organizationId } = req.query;
    const analyticAccounts = await prisma.analytic_accounts.findMany({
      where: {
        is_active: true,
        ...(organizationId ? { organization_id: organizationId } : {}),
      },
      orderBy: { name: 'asc' },
    });
    res.json(analyticAccounts);
  } catch (error) {
    next(error);
  }
});

router.post('/analytic-accounts', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const { name, analytic_type: analyticType, organization_id: organizationId } = req.body ?? {};

    if (!isNonEmptyString(name)) {
      return res.status(400).json({ error: 'name is required' });
    }
    if (!ANALYTIC_TYPES.includes(analyticType)) {
      return res.status(400).json({ error: `analytic_type must be one of: ${ANALYTIC_TYPES.join(', ')}` });
    }

    const resolvedOrganizationId = await resolveOrganizationId(organizationId);
    if (!resolvedOrganizationId) {
      return res.status(400).json({ error: 'organization_id is required' });
    }

    const analyticAccount = await prisma.analytic_accounts.create({
      data: {
        organization_id: resolvedOrganizationId,
        name,
        analytic_type: analyticType,
        created_by_user_id: req.user.id,
      },
    });
    res.status(201).json(analyticAccount);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

router.patch('/analytic-accounts/:id', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const { name, analytic_type: analyticType } = req.body ?? {};

    if (name !== undefined && !isNonEmptyString(name)) {
      return res.status(400).json({ error: 'name must be a non-empty string' });
    }
    if (analyticType !== undefined && !ANALYTIC_TYPES.includes(analyticType)) {
      return res.status(400).json({ error: `analytic_type must be one of: ${ANALYTIC_TYPES.join(', ')}` });
    }

    const analyticAccount = await prisma.analytic_accounts.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(analyticType !== undefined ? { analytic_type: analyticType } : {}),
        updated_by_user_id: req.user.id,
      },
    });
    res.json(analyticAccount);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

router.patch('/analytic-accounts/:id/archive', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const analyticAccount = await prisma.analytic_accounts.update({
      where: { id: req.params.id },
      data: { is_active: false, updated_by_user_id: req.user.id },
    });
    res.json(analyticAccount);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

export default router;
