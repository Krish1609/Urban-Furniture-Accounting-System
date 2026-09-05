import { Router } from 'express';

import { prisma } from '../lib/prisma.js';
import { resolveOrganizationId } from '../lib/organization.js';
import { handleKnownPrismaErrors } from '../lib/prismaErrors.js';
import { isNonEmptyString } from '../lib/validators.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateJournalItems, generateEntryNumber, createJournalEntry } from '../services/accounting.js';

const router = Router();

const JOURNAL_TYPES = ['sales', 'purchase', 'cash', 'bank', 'general'];
const toAmount = (value) => Number(value ?? 0);

const LINE_INCLUDE = {
  chart_of_accounts: true,
  contacts: true,
};

const ENTRY_STATUSES = ['draft', 'posted', 'reversed'];

// Checks account_id/partner_contact_id/analytic_account_id on manual entry lines belong to
// organizationId (unchecked, this would let a manual entry post to another organization's chart
// of accounts) and that each account actually allows manual posting.
async function validateLineReferences(items, organizationId, client) {
  for (let i = 0; i < items.length; i += 1) {
    const line = items[i];
    const account = await client.chart_of_accounts.findFirst({
      where: { id: line.account_id, organization_id: organizationId },
      select: { id: true, allow_manual_posting: true, name: true },
    });
    if (!account) return `items[${i}].account_id does not belong to organization_id`;
    if (!account.allow_manual_posting) return `items[${i}].account_id ("${account.name}") does not allow manual posting`;

    if (line.partner_contact_id) {
      const contact = await client.contacts.findFirst({
        where: { id: line.partner_contact_id, organization_id: organizationId },
        select: { id: true },
      });
      if (!contact) return `items[${i}].partner_contact_id does not belong to organization_id`;
    }

    if (line.analytic_account_id) {
      const analyticAccount = await client.analytic_accounts.findFirst({
        where: { id: line.analytic_account_id, organization_id: organizationId },
        select: { id: true },
      });
      if (!analyticAccount) return `items[${i}].analytic_account_id does not belong to organization_id`;
    }
  }
  return null;
}

// Re-checked at /post time too: an account could have had allow_manual_posting turned off
// after a draft referencing it was created but before it was posted.
async function assertPostedAccountsAllowManualPosting(accountIds, client) {
  const accounts = await client.chart_of_accounts.findMany({
    where: { id: { in: [...new Set(accountIds)] } },
    select: { allow_manual_posting: true, name: true },
  });
  const disallowed = accounts.filter((account) => !account.allow_manual_posting);
  if (disallowed.length > 0) {
    throw new Error(`Account(s) do not allow manual posting: ${disallowed.map((account) => account.name).join(', ')}`);
  }
}

// ---------------------------------------------------------------------------
// Journals
// ---------------------------------------------------------------------------

router.get('/journals', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const { organization_id: organizationId } = req.query;
    const journals = await prisma.journals.findMany({
      where: {
        is_active: true,
        ...(organizationId ? { organization_id: organizationId } : {}),
      },
      orderBy: { name: 'asc' },
    });
    res.json(journals);
  } catch (error) {
    next(error);
  }
});

router.post('/journals', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const { name, journal_type: journalType, default_account_id: defaultAccountId, organization_id: organizationId } = req.body ?? {};

    if (!isNonEmptyString(name)) return res.status(400).json({ error: 'name is required' });
    if (!JOURNAL_TYPES.includes(journalType)) {
      return res.status(400).json({ error: `journal_type must be one of: ${JOURNAL_TYPES.join(', ')}` });
    }

    const resolvedOrganizationId = await resolveOrganizationId(organizationId);
    if (!resolvedOrganizationId) return res.status(400).json({ error: 'organization_id is required' });

    if (defaultAccountId) {
      const account = await prisma.chart_of_accounts.findFirst({
        where: { id: defaultAccountId, organization_id: resolvedOrganizationId },
        select: { id: true },
      });
      if (!account) return res.status(400).json({ error: 'default_account_id does not belong to organization_id' });
    }

    const journal = await prisma.journals.create({
      data: {
        organization_id: resolvedOrganizationId,
        name,
        journal_type: journalType,
        default_account_id: defaultAccountId ?? null,
        created_by_user_id: req.user.id,
      },
    });
    res.status(201).json(journal);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

router.patch('/journals/:id', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const { name, journal_type: journalType, default_account_id: defaultAccountId } = req.body ?? {};

    if (name !== undefined && !isNonEmptyString(name)) {
      return res.status(400).json({ error: 'name must be a non-empty string' });
    }
    if (journalType !== undefined && !JOURNAL_TYPES.includes(journalType)) {
      return res.status(400).json({ error: `journal_type must be one of: ${JOURNAL_TYPES.join(', ')}` });
    }

    const journal = await prisma.journals.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(journalType !== undefined ? { journal_type: journalType } : {}),
        ...(defaultAccountId !== undefined ? { default_account_id: defaultAccountId } : {}),
        updated_by_user_id: req.user.id,
      },
    });
    res.json(journal);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

router.patch('/journals/:id/archive', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const journal = await prisma.journals.update({
      where: { id: req.params.id },
      data: { is_active: false, updated_by_user_id: req.user.id },
    });
    res.json(journal);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

// ---------------------------------------------------------------------------
// Journal Entries (+ nested Journal Items / journal_entry_lines)
// ---------------------------------------------------------------------------

router.get('/journal-entries', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const { organization_id: organizationId, journal_id: journalId, status } = req.query;
    if (status !== undefined && !ENTRY_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${ENTRY_STATUSES.join(', ')}` });
    }
    const entries = await prisma.journal_entries.findMany({
      where: {
        ...(organizationId ? { organization_id: organizationId } : {}),
        ...(journalId ? { journal_id: journalId } : {}),
        ...(status ? { status } : {}),
      },
      include: { journal_entry_lines: { include: LINE_INCLUDE, orderBy: { line_number: 'asc' } } },
      orderBy: { entry_date: 'desc' },
    });
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

router.get('/journal-entries/:id', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const entry = await prisma.journal_entries.findUnique({
      where: { id: req.params.id },
      include: { journal_entry_lines: { include: LINE_INCLUDE, orderBy: { line_number: 'asc' } } },
    });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

function validateLineShape(lines) {
  if (!Array.isArray(lines) || lines.length === 0) return 'items must be a non-empty array';
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line?.account_id) return `items[${i}].account_id is required`;
    const debit = toAmount(line.debit_amount);
    const credit = toAmount(line.credit_amount);
    if (debit < 0 || credit < 0) return `items[${i}] amounts must not be negative`;
    if ((debit > 0) === (credit > 0)) return `items[${i}] must have exactly one of debit_amount or credit_amount greater than zero`;
  }
  return null;
}

// Draft creation only enforces each line's own shape (debit XOR credit > 0 - a hard DB CHECK
// constraint regardless of status anyway); the overall debit==credit balance is a business rule
// re-validated at /post time, not required while a manual entry is still being drafted.
router.post('/journal-entries', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const {
      journal_id: journalId,
      entry_date: entryDate,
      reference,
      description,
      organization_id: organizationId,
      items,
    } = req.body ?? {};

    if (!journalId) return res.status(400).json({ error: 'journal_id is required' });
    if (!entryDate || Number.isNaN(new Date(entryDate).getTime())) {
      return res.status(400).json({ error: 'entry_date must be a valid date' });
    }
    const lineError = validateLineShape(items);
    if (lineError) return res.status(400).json({ error: lineError });

    const resolvedOrganizationId = await resolveOrganizationId(organizationId);
    if (!resolvedOrganizationId) return res.status(400).json({ error: 'organization_id is required' });

    const journal = await prisma.journals.findFirst({
      where: { id: journalId, organization_id: resolvedOrganizationId },
    });
    if (!journal) return res.status(400).json({ error: 'journal_id does not belong to organization_id' });

    const referenceError = await validateLineReferences(items, resolvedOrganizationId, prisma);
    if (referenceError) return res.status(400).json({ error: referenceError });

    const entryNumber = await generateEntryNumber(resolvedOrganizationId);

    const entry = await prisma.journal_entries.create({
      data: {
        organization_id: resolvedOrganizationId,
        journal_id: journalId,
        entry_number: entryNumber,
        entry_date: new Date(entryDate),
        status: 'draft',
        reference: reference ?? null,
        description: description ?? null,
        created_by_user_id: req.user.id,
        journal_entry_lines: {
          create: items.map((line, index) => ({
            line_number: index + 1,
            account_id: line.account_id,
            partner_contact_id: line.partner_contact_id ?? null,
            analytic_account_id: line.analytic_account_id ?? null,
            debit_amount: toAmount(line.debit_amount),
            credit_amount: toAmount(line.credit_amount),
            description: line.description ?? null,
            created_by_user_id: req.user.id,
          })),
        },
      },
      include: { journal_entry_lines: { include: LINE_INCLUDE, orderBy: { line_number: 'asc' } } },
    });
    res.status(201).json(entry);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

router.patch('/journal-entries/:id', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const existing = await prisma.journal_entries.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (existing.status !== 'draft') {
      return res.status(400).json({ error: `Only a draft journal entry can be edited; this one is ${existing.status}` });
    }

    const { journal_id: journalId, entry_date: entryDate, reference, description, items } = req.body ?? {};

    if (journalId !== undefined) {
      const journal = await prisma.journals.findFirst({
        where: { id: journalId, organization_id: existing.organization_id },
      });
      if (!journal) return res.status(400).json({ error: 'journal_id does not belong to this entry\'s organization' });
    }
    if (entryDate !== undefined && Number.isNaN(new Date(entryDate).getTime())) {
      return res.status(400).json({ error: 'entry_date must be a valid date' });
    }
    if (items !== undefined) {
      const lineError = validateLineShape(items);
      if (lineError) return res.status(400).json({ error: lineError });
      const referenceError = await validateLineReferences(items, existing.organization_id, prisma);
      if (referenceError) return res.status(400).json({ error: referenceError });
    }

    const entry = await prisma.$transaction(async (tx) => {
      if (items !== undefined) {
        await tx.journal_entry_lines.deleteMany({ where: { journal_entry_id: existing.id } });
      }
      return tx.journal_entries.update({
        where: { id: existing.id },
        data: {
          ...(journalId !== undefined ? { journal_id: journalId } : {}),
          ...(entryDate !== undefined ? { entry_date: new Date(entryDate) } : {}),
          ...(reference !== undefined ? { reference } : {}),
          ...(description !== undefined ? { description } : {}),
          updated_by_user_id: req.user.id,
          ...(items !== undefined
            ? {
                journal_entry_lines: {
                  create: items.map((line, index) => ({
                    line_number: index + 1,
                    account_id: line.account_id,
                    partner_contact_id: line.partner_contact_id ?? null,
                    analytic_account_id: line.analytic_account_id ?? null,
                    debit_amount: toAmount(line.debit_amount),
                    credit_amount: toAmount(line.credit_amount),
                    description: line.description ?? null,
                    created_by_user_id: req.user.id,
                  })),
                },
              }
            : {}),
        },
        include: { journal_entry_lines: { include: LINE_INCLUDE, orderBy: { line_number: 'asc' } } },
      });
    }, { timeout: 15000 });
    res.json(entry);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

router.patch('/journal-entries/:id/post', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const entry = await prisma.journal_entries.findUnique({
      where: { id: req.params.id },
      include: { journal_entry_lines: true },
    });
    if (!entry) return res.status(404).json({ error: 'Not found' });
    if (entry.status !== 'draft') {
      return res.status(400).json({ error: `Cannot post a journal entry with status ${entry.status}` });
    }

    try {
      validateJournalItems(
        entry.journal_entry_lines.map((line) => ({
          accountId: line.account_id,
          debit: line.debit_amount,
          credit: line.credit_amount,
        })),
      );
      await assertPostedAccountsAllowManualPosting(
        entry.journal_entry_lines.map((line) => line.account_id),
        prisma,
      );
    } catch (balanceError) {
      return res.status(400).json({ error: balanceError.message });
    }

    const posted = await prisma.journal_entries.update({
      where: { id: entry.id },
      data: { status: 'posted', posted_at: new Date(), updated_by_user_id: req.user.id },
      include: { journal_entry_lines: { include: LINE_INCLUDE, orderBy: { line_number: 'asc' } } },
    });
    res.json(posted);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

// journal_entry_status has no "cancelled" value (only draft/posted/reversed). A still-draft entry
// has no accounting effect yet, so cancelling it means discarding it outright. A posted entry is
// an immutable financial record - the correct way to void it is the schema's own reversal
// mechanism (reversal_of_entry_id/reversed_at), so this creates an offsetting entry via the same
// createJournalEntry engine and marks the original 'reversed'.
router.patch('/journal-entries/:id/cancel', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const entry = await prisma.journal_entries.findUnique({
      where: { id: req.params.id },
      include: { journal_entry_lines: true },
    });
    if (!entry) return res.status(404).json({ error: 'Not found' });

    if (entry.status === 'draft') {
      await prisma.journal_entries.delete({ where: { id: entry.id } });
      return res.json({ deleted: true, id: entry.id });
    }

    if (entry.status !== 'posted') {
      return res.status(400).json({ error: `Cannot cancel a journal entry with status ${entry.status}` });
    }

    // Reversal creation and the original's status update are one transaction: if they were
    // separate calls and the status update failed, both entries would stand posted and the
    // ledger would double-count the transaction.
    const { reversedEntry, reversalEntry } = await prisma.$transaction(async (tx) => {
      const newReversalEntry = await createJournalEntry(
        {
          organizationId: entry.organization_id,
          journalId: entry.journal_id,
          reference: entry.entry_number,
          description: `Reversal of ${entry.entry_number}`,
          date: new Date(),
          reversalOfEntryId: entry.id,
          createdByUserId: req.user.id,
          items: entry.journal_entry_lines.map((line) => ({
            accountId: line.account_id,
            debit: line.credit_amount,
            credit: line.debit_amount,
            partnerContactId: line.partner_contact_id,
            analyticAccountId: line.analytic_account_id,
          })),
        },
        tx,
      );

      const newReversedEntry = await tx.journal_entries.update({
        where: { id: entry.id },
        data: { status: 'reversed', reversed_at: new Date(), updated_by_user_id: req.user.id },
      });

      return { reversedEntry: newReversedEntry, reversalEntry: newReversalEntry };
    }, { timeout: 15000 });

    res.json({ reversedEntry, reversalEntry });
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

export default router;
