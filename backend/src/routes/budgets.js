import { Router } from 'express';

import { prisma } from '../lib/prisma.js';
import { resolveOrganizationId } from '../lib/organization.js';
import { handleKnownPrismaErrors } from '../lib/prismaErrors.js';
import { isNonEmptyString, isNonNegativeNumber } from '../lib/validators.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getBudgetAchieved } from '../services/budget.js';

const router = Router();

const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;
const BUDGET_STATUSES = ['draft', 'active', 'closed', 'cancelled'];
const REVISION_SUFFIX_PATTERN = / \(Rev \d+\)$/;

function validateBudgetCore({ name, periodStart, periodEnd, currencyCode }) {
  if (!isNonEmptyString(name)) return 'name is required';
  if (!periodStart || Number.isNaN(new Date(periodStart).getTime())) return 'period_start must be a valid date';
  if (!periodEnd || Number.isNaN(new Date(periodEnd).getTime())) return 'period_end must be a valid date';
  if (new Date(periodEnd) < new Date(periodStart)) return 'period_end must not be before period_start';
  if (!isNonEmptyString(currencyCode) || !CURRENCY_CODE_PATTERN.test(currencyCode)) {
    return 'currency_code must be a 3-letter uppercase code (e.g. INR)';
  }
  return null;
}

function validateBudgetLines(lines) {
  if (!Array.isArray(lines) || lines.length === 0) return 'lines must be a non-empty array';
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line?.analytic_account_id) return `lines[${i}].analytic_account_id is required`;
    if (!line?.account_id) return `lines[${i}].account_id is required`;
    if (!isNonNegativeNumber(line?.planned_amount)) return `lines[${i}].planned_amount must be a non-negative number`;
  }
  return null;
}

// analytic_account_id/account_id are unchecked otherwise, which would let a budget line
// reference another organization's analytic account or chart of accounts.
async function validateBudgetLineReferences(lines, organizationId) {
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const analyticAccount = await prisma.analytic_accounts.findFirst({
      where: { id: line.analytic_account_id, organization_id: organizationId },
      select: { id: true },
    });
    if (!analyticAccount) return `lines[${i}].analytic_account_id does not belong to organization_id`;

    const account = await prisma.chart_of_accounts.findFirst({
      where: { id: line.account_id, organization_id: organizationId },
      select: { id: true },
    });
    if (!account) return `lines[${i}].account_id does not belong to organization_id`;
  }
  return null;
}

router.get('/budgets', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const { organization_id: organizationId, status } = req.query;
    if (status !== undefined && !BUDGET_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${BUDGET_STATUSES.join(', ')}` });
    }
    const budgets = await prisma.budgets.findMany({
      where: {
        ...(organizationId ? { organization_id: organizationId } : {}),
        ...(status ? { status } : {}),
      },
      include: { budget_lines: true },
      orderBy: { period_start: 'desc' },
    });
    res.json(budgets);
  } catch (error) {
    next(error);
  }
});

router.get('/budgets/:id', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const budget = await prisma.budgets.findUnique({
      where: { id: req.params.id },
      include: { budget_lines: true },
    });
    if (!budget) return res.status(404).json({ error: 'Not found' });
    res.json(budget);
  } catch (error) {
    next(error);
  }
});

router.get('/budgets/:id/achieved', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const result = await getBudgetAchieved(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message?.includes('not found')) return res.status(404).json({ error: 'Not found' });
    next(error);
  }
});

router.post('/budgets', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const {
      name,
      period_start: periodStart,
      period_end: periodEnd,
      currency_code: currencyCode,
      responsible_membership_id: responsibleMembershipId,
      organization_id: organizationId,
      lines,
    } = req.body ?? {};

    const coreError = validateBudgetCore({ name, periodStart, periodEnd, currencyCode });
    if (coreError) return res.status(400).json({ error: coreError });

    const linesError = validateBudgetLines(lines);
    if (linesError) return res.status(400).json({ error: linesError });

    const resolvedOrganizationId = await resolveOrganizationId(organizationId);
    if (!resolvedOrganizationId) {
      return res.status(400).json({ error: 'organization_id is required' });
    }

    const referenceError = await validateBudgetLineReferences(lines, resolvedOrganizationId);
    if (referenceError) return res.status(400).json({ error: referenceError });

    const budget = await prisma.budgets.create({
      data: {
        organization_id: resolvedOrganizationId,
        name,
        period_start: new Date(periodStart),
        period_end: new Date(periodEnd),
        currency_code: currencyCode,
        responsible_membership_id: responsibleMembershipId ?? null,
        created_by_user_id: req.user.id,
        budget_lines: {
          create: lines.map((line) => ({
            analytic_account_id: line.analytic_account_id,
            account_id: line.account_id,
            planned_amount: line.planned_amount,
            created_by_user_id: req.user.id,
          })),
        },
      },
      include: { budget_lines: true },
    });
    res.status(201).json(budget);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

router.patch('/budgets/:id', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const existing = await prisma.budgets.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (existing.status !== 'draft') {
      return res.status(400).json({ error: 'Only a draft budget can be edited directly; use revise for an active budget' });
    }

    const {
      name,
      period_start: periodStart,
      period_end: periodEnd,
      currency_code: currencyCode,
      responsible_membership_id: responsibleMembershipId,
      lines,
    } = req.body ?? {};

    const coreError = validateBudgetCore({
      name: name ?? existing.name,
      periodStart: periodStart ?? existing.period_start,
      periodEnd: periodEnd ?? existing.period_end,
      currencyCode: currencyCode ?? existing.currency_code,
    });
    if (coreError) return res.status(400).json({ error: coreError });

    if (lines !== undefined) {
      const linesError = validateBudgetLines(lines);
      if (linesError) return res.status(400).json({ error: linesError });
      const referenceError = await validateBudgetLineReferences(lines, existing.organization_id);
      if (referenceError) return res.status(400).json({ error: referenceError });
    }

    const budget = await prisma.$transaction(async (tx) => {
      if (lines !== undefined) {
        await tx.budget_lines.deleteMany({ where: { budget_id: existing.id } });
      }
      return tx.budgets.update({
        where: { id: existing.id },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(periodStart !== undefined ? { period_start: new Date(periodStart) } : {}),
          ...(periodEnd !== undefined ? { period_end: new Date(periodEnd) } : {}),
          ...(currencyCode !== undefined ? { currency_code: currencyCode } : {}),
          ...(responsibleMembershipId !== undefined ? { responsible_membership_id: responsibleMembershipId } : {}),
          updated_by_user_id: req.user.id,
          ...(lines !== undefined
            ? {
                budget_lines: {
                  create: lines.map((line) => ({
                    analytic_account_id: line.analytic_account_id,
                    account_id: line.account_id,
                    planned_amount: line.planned_amount,
                    created_by_user_id: req.user.id,
                  })),
                },
              }
            : {}),
        },
        include: { budget_lines: true },
      });
    }, { timeout: 15000 });
    res.json(budget);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

router.post('/budgets/:id/confirm', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const existing = await prisma.budgets.findUnique({
      where: { id: req.params.id },
      include: { budget_lines: true },
    });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (existing.status !== 'draft') {
      return res.status(400).json({ error: `Cannot confirm a budget with status ${existing.status}` });
    }

    // Without this, nothing stops activating a second budget whose period overlaps an existing
    // active one for the same analytic account - checkBudgetLimit would then find two active
    // budgets covering the same account/date and refuse to check anything at all (see budget.js).
    for (const line of existing.budget_lines) {
      const overlapping = await prisma.budget_lines.findFirst({
        where: {
          analytic_account_id: line.analytic_account_id,
          budget_id: { not: existing.id },
          budgets: {
            status: 'active',
            period_start: { lte: existing.period_end },
            period_end: { gte: existing.period_start },
          },
        },
        include: { budgets: { select: { name: true } } },
      });
      if (overlapping) {
        return res.status(400).json({
          error: `Another active budget ("${overlapping.budgets.name}") already covers this analytic account for an overlapping period`,
        });
      }
    }

    const budget = await prisma.budgets.update({
      where: { id: existing.id },
      data: { status: 'active', updated_by_user_id: req.user.id },
    });
    res.json(budget);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

router.post('/budgets/:id/cancel', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const existing = await prisma.budgets.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (!['draft', 'active'].includes(existing.status)) {
      return res.status(400).json({ error: `Cannot cancel a budget with status ${existing.status}` });
    }

    const budget = await prisma.budgets.update({
      where: { id: existing.id },
      data: { status: 'cancelled', updated_by_user_id: req.user.id },
    });
    res.json(budget);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

// NOTE: budget_status has no "revised" value (only draft/active/closed/cancelled) and budgets has
// no field linking a revision to its predecessor. This closes the old budget (closest available
// status to "no longer in force") and creates a fresh draft budget, returning both ids so the
// caller can track the relationship; there's no DB-level link without a schema migration.
router.post('/budgets/:id/revise', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const existing = await prisma.budgets.findUnique({
      where: { id: req.params.id },
      include: { budget_lines: true },
    });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (existing.status !== 'active') {
      return res.status(400).json({ error: `Cannot revise a budget with status ${existing.status}` });
    }

    const {
      name,
      period_start: periodStart,
      period_end: periodEnd,
      currency_code: currencyCode,
      responsible_membership_id: responsibleMembershipId,
      lines,
    } = req.body ?? {};

    const nextLines = lines ?? existing.budget_lines.map((line) => ({
      analytic_account_id: line.analytic_account_id,
      account_id: line.account_id,
      planned_amount: Number(line.planned_amount),
    }));

    // budgets has a unique (organization_id, name, period_start, period_end) constraint, and the
    // predecessor row still exists (closed, not deleted), so reusing its name+period verbatim would
    // collide. Auto-suffix the name only when the caller didn't already pick a name that differs -
    // stripping any existing " (Rev N)" suffix first, so revising an already-revised budget
    // produces "X (Rev 2)" rather than stacking into "X (Rev 1) (Rev 1)".
    let revisedName = name ?? existing.name;
    if (name === undefined) {
      const baseName = existing.name.replace(REVISION_SUFFIX_PATTERN, '');
      const revisionCount = await prisma.budgets.count({
        where: { organization_id: existing.organization_id, name: { startsWith: baseName } },
      });
      revisedName = `${baseName} (Rev ${revisionCount})`;
    }

    const coreError = validateBudgetCore({
      name: revisedName,
      periodStart: periodStart ?? existing.period_start,
      periodEnd: periodEnd ?? existing.period_end,
      currencyCode: currencyCode ?? existing.currency_code,
    });
    if (coreError) return res.status(400).json({ error: coreError });

    const linesError = validateBudgetLines(nextLines);
    if (linesError) return res.status(400).json({ error: linesError });

    const referenceError = await validateBudgetLineReferences(nextLines, existing.organization_id);
    if (referenceError) return res.status(400).json({ error: referenceError });

    const result = await prisma.$transaction(async (tx) => {
      const revisedBudget = await tx.budgets.create({
        data: {
          organization_id: existing.organization_id,
          name: revisedName,
          period_start: new Date(periodStart ?? existing.period_start),
          period_end: new Date(periodEnd ?? existing.period_end),
          currency_code: currencyCode ?? existing.currency_code,
          responsible_membership_id: responsibleMembershipId ?? existing.responsible_membership_id,
          created_by_user_id: req.user.id,
          budget_lines: {
            create: nextLines.map((line) => ({
              analytic_account_id: line.analytic_account_id,
              account_id: line.account_id,
              planned_amount: line.planned_amount,
              created_by_user_id: req.user.id,
            })),
          },
        },
        include: { budget_lines: true },
      });

      const closedBudget = await tx.budgets.update({
        where: { id: existing.id },
        data: { status: 'closed', updated_by_user_id: req.user.id },
      });

      return { previousBudget: closedBudget, revisedBudget };
    }, { timeout: 15000 });

    res.status(201).json(result);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

export default router;
