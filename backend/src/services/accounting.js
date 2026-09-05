import { Prisma } from '@prisma/client';

import { prisma } from '../lib/prisma.js';

const BALANCE_TOLERANCE = 0.01;

const ACCOUNT_TYPE_CODE_PREFIX = {
  asset: '1',
  liability: '2',
  equity: '3',
  income: '4',
  expense: '5',
};

const toAmount = (value) => Number(value ?? 0);

function isUniqueCodeConflict(error) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    error.meta?.target?.includes('account_code')
  );
}

/**
 * Looks up a chart_of_accounts row by (organization_id, name); creates it if missing.
 * NOTE: organizationId is not part of the task's requested (name, type) signature, but
 * chart_of_accounts.organization_id is NOT NULL in the schema, so it has to be supplied.
 * account_code is generated rather than fixed per standard name: this app's seed data
 * already uses codes like 1000/1100/2000/4000/5000 for its own differently-named accounts
 * (e.g. "Accounts Receivable" instead of "Debtors"), so a hardcoded code for "Debtors"
 * would collide with the seeded "Accounts Receivable" row on (organization_id, account_code).
 */
export async function getOrCreateAccount(organizationId, name, type, client = prisma) {
  const existing = await client.chart_of_accounts.findFirst({
    where: { organization_id: organizationId, name },
  });
  if (existing) return existing;

  if (!type) {
    throw new Error(`getOrCreateAccount: no account_type given for new account "${name}"`);
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const accountCode = await generateAccountCode(organizationId, type, client, attempt);
    try {
      return await client.chart_of_accounts.create({
        data: { organization_id: organizationId, account_code: accountCode, name, account_type: type },
      });
    } catch (error) {
      if (!isUniqueCodeConflict(error) || attempt === 4) throw error;
    }
  }
}

async function generateAccountCode(organizationId, accountType, client, attempt = 0) {
  const prefix = ACCOUNT_TYPE_CODE_PREFIX[accountType] ?? '9';
  const count = await client.chart_of_accounts.count({
    where: { organization_id: organizationId, account_type: accountType },
  });
  return `${prefix}${String(count + 1 + attempt).padStart(3, '0')}`;
}

/**
 * Looks up a journals row by (organization_id, name); creates it if missing.
 * NOTE: same organizationId caveat as getOrCreateAccount - journals.organization_id is NOT NULL.
 */
export async function getOrCreateJournal(organizationId, name, type, client = prisma) {
  const existing = await client.journals.findFirst({
    where: { organization_id: organizationId, name },
  });
  if (existing) return existing;

  return client.journals.create({
    data: { organization_id: organizationId, name, journal_type: type },
  });
}

/**
 * Validates that a set of { accountId, debit, credit } items each have exactly one of
 * debit/credit greater than zero (matching journal_entry_lines' own CHECK constraint) and that
 * the whole set balances within tolerance. Shared by createJournalEntry and by manual entries'
 * PATCH /:id/post re-validation, so both paths enforce identical double-entry rules.
 */
export function validateJournalItems(items) {
  if (!Array.isArray(items) || items.length < 2) {
    throw new Error('items must contain at least two lines');
  }

  let totalDebit = 0;
  let totalCredit = 0;

  items.forEach((item, index) => {
    if (!item.accountId) {
      throw new Error(`items[${index}].accountId is required`);
    }
    const debit = toAmount(item.debit);
    const credit = toAmount(item.credit);
    if (debit < 0 || credit < 0) {
      throw new Error(`items[${index}] amounts must not be negative`);
    }
    if ((debit > 0) === (credit > 0)) {
      throw new Error(`items[${index}] must have exactly one of debit or credit greater than zero`);
    }
    totalDebit += debit;
    totalCredit += credit;
  });

  if (Math.abs(totalDebit - totalCredit) > BALANCE_TOLERANCE) {
    throw new Error(
      `entry is not balanced (total debit ${totalDebit.toFixed(2)} vs total credit ${totalCredit.toFixed(2)})`,
    );
  }

  return { totalDebit, totalCredit };
}

/**
 * Central double-entry primitive: validates that items balance, then writes the
 * JournalEntry (journal_entries) + its JournalItems (journal_entry_lines) as one posted entry.
 * Pass `client` as a `tx` from prisma.$transaction to compose this with other writes atomically.
 */
export async function createJournalEntry(
  { organizationId, journalId, reference, description, items, date, commercialDocumentId, paymentId, reversalOfEntryId, createdByUserId },
  client = prisma,
) {
  if (!organizationId) throw new Error('createJournalEntry: organizationId is required');
  if (!journalId) throw new Error('createJournalEntry: journalId is required');
  if (!date) throw new Error('createJournalEntry: date is required');
  if (commercialDocumentId && paymentId) {
    throw new Error('createJournalEntry: a journal entry cannot link both a commercial document and a payment');
  }

  validateJournalItems(items);

  const entryNumber = await generateEntryNumber(organizationId, client);

  return client.journal_entries.create({
    data: {
      organization_id: organizationId,
      journal_id: journalId,
      entry_number: entryNumber,
      entry_date: new Date(date),
      status: 'posted',
      posted_at: new Date(),
      reference: reference ?? null,
      description: description ?? null,
      commercial_document_id: commercialDocumentId ?? null,
      payment_id: paymentId ?? null,
      reversal_of_entry_id: reversalOfEntryId ?? null,
      created_by_user_id: createdByUserId ?? null,
      journal_entry_lines: {
        create: items.map((item, index) => ({
          line_number: index + 1,
          account_id: item.accountId,
          partner_contact_id: item.partnerContactId ?? null,
          analytic_account_id: item.analyticAccountId ?? null,
          debit_amount: toAmount(item.debit),
          credit_amount: toAmount(item.credit),
          description: item.description ?? null,
          created_by_user_id: createdByUserId ?? null,
        })),
      },
    },
    include: { journal_entry_lines: true },
  });
}

// MAX-based rather than COUNT-based: after a draft entry is deleted (see journals.js /cancel),
// a COUNT-based scheme reuses a number that already exists on a later entry, hitting the
// (organization_id, entry_number) unique constraint on every subsequent create with no way to
// recover. Reading the highest existing number instead self-heals across gaps from deletions.
// Parses every existing number's numeric suffix and takes the true max, rather than sorting the
// raw strings and taking the first one - a mix of padding widths (e.g. seeded "PO-001" alongside
// generated "PO-000002") sorts inconsistently with numeric order as plain strings.
export async function generateEntryNumber(organizationId, client = prisma) {
  const rows = await client.journal_entries.findMany({
    where: { organization_id: organizationId },
    select: { entry_number: true },
  });
  const lastNumber = rows.reduce((highest, row) => {
    const parsed = parseInt(row.entry_number.split('-').pop(), 10);
    return Number.isFinite(parsed) && parsed > highest ? parsed : highest;
  }, 0);
  return `JE-${String(lastNumber + 1).padStart(6, '0')}`;
}

// journal_entries.commercial_document_id / .payment_id only allow one *posted* entry each
// (see uq_posted_entry_document / uq_posted_entry_payment). commercial_documents and payments
// have no journal_entry_id column of their own - the link lives on journal_entries, so "updating
// the related record with the resulting journal entry id" means setting that FK when the entry
// is created, then reflecting the outcome on the source record's own status/posted_at fields.
async function assertNotAlreadyPosted(client, field, id) {
  const existing = await client.journal_entries.findFirst({
    where: { [field]: id, status: 'posted' },
    select: { id: true },
  });
  if (existing) {
    throw new Error(`A posted journal entry already exists for this record (journal_entries.id=${existing.id})`);
  }
}

// Runs `run` against `externalClient` if the caller supplied one (composing into a larger
// transaction it already owns - e.g. purchases.js wraps bill-creation + posting + PO status
// update in one transaction), otherwise opens its own transaction. Without this, a failure
// partway through posting could leave a document created but never posted, with no way to retry.
async function withClient(externalClient, run) {
  if (externalClient) return run(externalClient);
  return prisma.$transaction(run, { timeout: 15000 });
}

// Sums each line's line_subtotal_amount (pre-tax) by analytic_account_id (null grouped
// together) and drops zero-value groups, since a journal_entry_lines row can't have both
// debit_amount and credit_amount at 0. This is what makes checkBudgetLimit's pre-check at
// confirm time consistent with what actually lands in journal_entry_lines.analytic_account_id.
function groupLineSubtotalsByAnalyticAccount(lines) {
  const totals = new Map();
  for (const line of lines) {
    const key = line.analytic_account_id ?? null;
    totals.set(key, (totals.get(key) ?? 0) + toAmount(line.line_subtotal_amount));
  }
  return [...totals.entries()].filter(([, subtotal]) => subtotal > 0);
}

export async function postSalesInvoiceEntry({ commercialDocumentId, createdByUserId }, externalClient) {
  return withClient(externalClient, async (tx) => {
    const document = await tx.commercial_documents.findUnique({
      where: { id: commercialDocumentId },
      include: { commercial_document_lines: true },
    });
    if (!document) throw new Error('postSalesInvoiceEntry: commercial document not found');
    if (document.document_type !== 'customer_invoice') {
      throw new Error('postSalesInvoiceEntry: document_type must be customer_invoice');
    }
    await assertNotAlreadyPosted(tx, 'commercial_document_id', document.id);

    const debtors = await getOrCreateAccount(document.organization_id, 'Debtors', 'asset', tx);
    const salesIncome = await getOrCreateAccount(document.organization_id, 'Sales Income', 'income', tx);
    const journal = document.journal_id
      ? { id: document.journal_id }
      : await getOrCreateJournal(document.organization_id, 'Sales', 'sales', tx);

    const totalAmount = toAmount(document.total_amount);
    const taxAmount = toAmount(document.tax_amount);

    // Debit Debtors for the tax-inclusive total; credit Sales Income for only the pre-tax
    // subtotal (split by analytic account) and Tax Payable for the tax - booking the full
    // tax-inclusive total to Sales Income would overstate revenue by the tax collected.
    const items = [
      { accountId: debtors.id, debit: totalAmount, credit: 0, partnerContactId: document.contact_id },
      ...groupLineSubtotalsByAnalyticAccount(document.commercial_document_lines).map(([analyticAccountId, subtotal]) => ({
        accountId: salesIncome.id,
        debit: 0,
        credit: subtotal,
        analyticAccountId,
      })),
    ];
    if (taxAmount > 0) {
      const taxPayable = await getOrCreateAccount(document.organization_id, 'Tax Payable', 'liability', tx);
      items.push({ accountId: taxPayable.id, debit: 0, credit: taxAmount });
    }

    const journalEntry = await createJournalEntry(
      {
        organizationId: document.organization_id,
        journalId: journal.id,
        reference: document.document_number,
        description: `Sales invoice ${document.document_number}`,
        date: document.document_date,
        commercialDocumentId: document.id,
        createdByUserId,
        items,
      },
      tx,
    );

    const updatedDocument = await tx.commercial_documents.update({
      where: { id: document.id },
      data: {
        status: 'posted',
        posted_at: new Date(),
        journal_id: journal.id,
        updated_by_user_id: createdByUserId ?? null,
      },
    });

    return { journalEntry, commercialDocument: updatedDocument };
  });
}

export async function postVendorBillEntry({ commercialDocumentId, createdByUserId }, externalClient) {
  return withClient(externalClient, async (tx) => {
    const document = await tx.commercial_documents.findUnique({
      where: { id: commercialDocumentId },
      include: { commercial_document_lines: true },
    });
    if (!document) throw new Error('postVendorBillEntry: commercial document not found');
    if (document.document_type !== 'vendor_bill') {
      throw new Error('postVendorBillEntry: document_type must be vendor_bill');
    }
    await assertNotAlreadyPosted(tx, 'commercial_document_id', document.id);

    const purchaseExpense = await getOrCreateAccount(document.organization_id, 'Purchase Expense', 'expense', tx);
    const creditors = await getOrCreateAccount(document.organization_id, 'Creditors', 'liability', tx);
    const journal = document.journal_id
      ? { id: document.journal_id }
      : await getOrCreateJournal(document.organization_id, 'Purchases', 'purchase', tx);

    const totalAmount = toAmount(document.total_amount);
    const taxAmount = toAmount(document.tax_amount);

    // Debit Purchase Expense for only the pre-tax subtotal (split by analytic account) and Tax
    // Receivable for the tax; credit Creditors for the tax-inclusive total - booking the full
    // tax-inclusive total to Purchase Expense would overstate expense by the input tax credit.
    const items = groupLineSubtotalsByAnalyticAccount(document.commercial_document_lines).map(([analyticAccountId, subtotal]) => ({
      accountId: purchaseExpense.id,
      debit: subtotal,
      credit: 0,
      analyticAccountId,
    }));
    if (taxAmount > 0) {
      const taxReceivable = await getOrCreateAccount(document.organization_id, 'Tax Receivable', 'asset', tx);
      items.push({ accountId: taxReceivable.id, debit: taxAmount, credit: 0 });
    }
    items.push({ accountId: creditors.id, debit: 0, credit: totalAmount, partnerContactId: document.contact_id });

    const journalEntry = await createJournalEntry(
      {
        organizationId: document.organization_id,
        journalId: journal.id,
        reference: document.document_number,
        description: `Vendor bill ${document.document_number}`,
        date: document.document_date,
        commercialDocumentId: document.id,
        createdByUserId,
        items,
      },
      tx,
    );

    const updatedDocument = await tx.commercial_documents.update({
      where: { id: document.id },
      data: {
        status: 'posted',
        posted_at: new Date(),
        journal_id: journal.id,
        updated_by_user_id: createdByUserId ?? null,
      },
    });

    return { journalEntry, commercialDocument: updatedDocument };
  });
}

export async function postCustomerPaymentEntry({ paymentId, createdByUserId }, externalClient) {
  return withClient(externalClient, async (tx) => {
    const payment = await tx.payments.findUnique({ where: { id: paymentId } });
    if (!payment) throw new Error('postCustomerPaymentEntry: payment not found');
    if (payment.payment_direction !== 'inbound') {
      throw new Error('postCustomerPaymentEntry: payment_direction must be inbound');
    }
    await assertNotAlreadyPosted(tx, 'payment_id', payment.id);

    const debtors = await getOrCreateAccount(payment.organization_id, 'Debtors', 'asset', tx);
    const amount = toAmount(payment.amount);

    const journalEntry = await createJournalEntry(
      {
        organizationId: payment.organization_id,
        journalId: payment.journal_id,
        reference: payment.payment_number,
        description: `Customer payment ${payment.payment_number}`,
        date: payment.payment_date,
        paymentId: payment.id,
        createdByUserId,
        items: [
          { accountId: payment.payment_account_id, debit: amount, credit: 0 },
          { accountId: debtors.id, debit: 0, credit: amount, partnerContactId: payment.contact_id },
        ],
      },
      tx,
    );

    const updatedPayment = await tx.payments.update({
      where: { id: payment.id },
      data: {
        status: 'posted',
        posted_at: new Date(),
        updated_by_user_id: createdByUserId ?? null,
      },
    });

    return { journalEntry, payment: updatedPayment };
  });
}

export async function postVendorPaymentEntry({ paymentId, createdByUserId }, externalClient) {
  return withClient(externalClient, async (tx) => {
    const payment = await tx.payments.findUnique({ where: { id: paymentId } });
    if (!payment) throw new Error('postVendorPaymentEntry: payment not found');
    if (payment.payment_direction !== 'outbound') {
      throw new Error('postVendorPaymentEntry: payment_direction must be outbound');
    }
    await assertNotAlreadyPosted(tx, 'payment_id', payment.id);

    const creditors = await getOrCreateAccount(payment.organization_id, 'Creditors', 'liability', tx);
    const amount = toAmount(payment.amount);

    const journalEntry = await createJournalEntry(
      {
        organizationId: payment.organization_id,
        journalId: payment.journal_id,
        reference: payment.payment_number,
        description: `Vendor payment ${payment.payment_number}`,
        date: payment.payment_date,
        paymentId: payment.id,
        createdByUserId,
        items: [
          { accountId: creditors.id, debit: amount, credit: 0, partnerContactId: payment.contact_id },
          { accountId: payment.payment_account_id, debit: 0, credit: amount },
        ],
      },
      tx,
    );

    const updatedPayment = await tx.payments.update({
      where: { id: payment.id },
      data: {
        status: 'posted',
        posted_at: new Date(),
        updated_by_user_id: createdByUserId ?? null,
      },
    });

    return { journalEntry, payment: updatedPayment };
  });
}
