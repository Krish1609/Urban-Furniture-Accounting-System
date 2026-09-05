import { prisma } from './prisma.js';
import { isNonNegativeNumber } from './validators.js';
import { checkBudgetLimit } from '../services/budget.js';

export const AMOUNT_TOLERANCE = 0.01;
export const toAmount = (value) => Number(value ?? 0);

// Parses the numeric suffix out of every matching number and takes the true numeric max, rather
// than sorting the strings and taking the first one: this app's seed data uses 3-digit padding
// ("PO-001") while these generate 6-digit padding ("PO-000002"), and "PO-001" sorts *after*
// "PO-000002" as a plain string even though 1 < 2 numerically - an ORDER BY ... DESC LIMIT 1 on
// the raw string would then pick the seed row, recompute "PO-000002" again, and collide.
function nextNumber(existingNumbers) {
  const max = existingNumbers.reduce((highest, value) => {
    const parsed = parseInt(value.split('-').pop(), 10);
    return Number.isFinite(parsed) && parsed > highest ? parsed : highest;
  }, 0);
  return max + 1;
}

// MAX-based rather than COUNT-based: a COUNT-based scheme reuses a number that already exists
// once any row for this org+type is ever deleted, hitting the document_number unique constraint
// on every subsequent create with no way to recover. See accounting.js's generateEntryNumber.
export async function generateDocumentNumber(organizationId, documentType, prefix, client = prisma) {
  const rows = await client.commercial_documents.findMany({
    where: { organization_id: organizationId, document_type: documentType },
    select: { document_number: true },
  });
  return `${prefix}-${String(nextNumber(rows.map((row) => row.document_number))).padStart(6, '0')}`;
}

export async function generatePaymentNumber(organizationId, prefix, client = prisma) {
  // Scoped by prefix (VPAY- vs RCPT-), not just organization_id: mixing prefixes together would
  // let one prefix's numbering influence the other's.
  const rows = await client.payments.findMany({
    where: { organization_id: organizationId, payment_number: { startsWith: `${prefix}-` } },
    select: { payment_number: true },
  });
  return `${prefix}-${String(nextNumber(rows.map((row) => row.payment_number))).padStart(6, '0')}`;
}

export function validateLines(lines) {
  if (!Array.isArray(lines) || lines.length === 0) return 'lines must be a non-empty array';
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!isNonNegativeNumber(line?.quantity) || line.quantity <= 0) return `lines[${i}].quantity must be greater than 0`;
    if (!isNonNegativeNumber(line?.unitPrice)) return `lines[${i}].unitPrice must be a non-negative number`;
    if (line?.discountPercent !== undefined && (!isNonNegativeNumber(line.discountPercent) || line.discountPercent > 100)) {
      return `lines[${i}].discountPercent must be between 0 and 100`;
    }
    if (line?.taxRatePercent !== undefined && (!isNonNegativeNumber(line.taxRatePercent) || line.taxRatePercent > 100)) {
      return `lines[${i}].taxRatePercent must be between 0 and 100`;
    }
  }
  return null;
}

// quantity * unitPrice, less discount, plus tax - computed server-side so clients can't submit
// arbitrary totals. Returns per-line amounts (rounded to 2dp) alongside the raw fields to persist.
export function computeLineAmounts(line) {
  const quantity = toAmount(line.quantity);
  const unitPrice = toAmount(line.unitPrice);
  const discountPercent = toAmount(line.discountPercent);
  const taxRatePercent = toAmount(line.taxRatePercent);

  const gross = quantity * unitPrice;
  const subtotal = gross * (1 - discountPercent / 100);
  const tax = subtotal * (taxRatePercent / 100);
  const total = subtotal + tax;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

// Aggregates each line's pre-tax subtotal by analytic_account_id (lines with no analytic account
// are skipped) so a budget covering that account is checked once against the *combined* amount -
// checking each line separately would let two lines each under the remaining budget individually
// slip past a limit they'd jointly exceed. Uses line_subtotal_amount (not line_total_amount)
// because that's what actually lands against the analytic account in the ledger once posted -
// accounting.js's postSalesInvoiceEntry/postVendorBillEntry book the tax portion to a separate
// tax account, untagged by analytic account.
export async function checkBudgetForLines(lines, date) {
  const totalsByAnalyticAccount = new Map();
  for (const line of lines) {
    if (!line.analytic_account_id) continue;
    const current = totalsByAnalyticAccount.get(line.analytic_account_id) ?? 0;
    totalsByAnalyticAccount.set(line.analytic_account_id, current + toAmount(line.line_subtotal_amount));
  }

  for (const [analyticAccountId, amount] of totalsByAnalyticAccount.entries()) {
    await checkBudgetLimit(analyticAccountId, amount, date);
  }
}

// Looks up the actual rate_percent from tax_rates when a tax_rate_id is given, rather than
// trusting a client-supplied taxRatePercent that could disagree with the referenced rate.
export async function resolveTaxRatePercent(taxRateId, organizationId, documentDate, client = prisma) {
  if (!taxRateId) return null;

  const taxRate = await client.tax_rates.findFirst({
    where: { id: taxRateId, organization_id: organizationId },
  });
  if (!taxRate) {
    throw new Error('tax_rate_id does not belong to organization_id');
  }

  const date = new Date(documentDate);
  if (date < taxRate.effective_from || (taxRate.effective_to && date > taxRate.effective_to)) {
    throw new Error('tax_rate_id is not effective on document_date');
  }

  return Number(taxRate.rate_percent);
}

// Builds the commercial_document_lines create payload from client-supplied lines: checks
// productId/analyticAccountId belong to organizationId (an unchecked FK here would let a line
// reference another organization's product or analytic account), resolves taxRatePercent from
// tax_rates when taxRateId is given (overriding any client-supplied percent), then computes
// amounts server-side. Throws a plain Error with a client-facing message on any validation failure.
export async function buildDocumentLines({ lines, organizationId, documentDate, userId }, client = prisma) {
  const computedLines = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (line.productId) {
      const product = await client.products.findFirst({
        where: { id: line.productId, organization_id: organizationId },
        select: { id: true },
      });
      if (!product) throw new Error(`lines[${i}].productId does not belong to organization_id`);
    }

    if (line.analyticAccountId) {
      const analyticAccount = await client.analytic_accounts.findFirst({
        where: { id: line.analyticAccountId, organization_id: organizationId },
        select: { id: true },
      });
      if (!analyticAccount) throw new Error(`lines[${i}].analyticAccountId does not belong to organization_id`);
    }

    let taxRatePercent = toAmount(line.taxRatePercent);
    if (line.taxRateId) {
      try {
        taxRatePercent = await resolveTaxRatePercent(line.taxRateId, organizationId, documentDate, client);
      } catch (error) {
        throw new Error(`lines[${i}]: ${error.message}`);
      }
    }

    const amounts = computeLineAmounts({ ...line, taxRatePercent });
    computedLines.push({
      line_number: i + 1,
      product_id: line.productId ?? null,
      description: line.description ?? '',
      quantity: line.quantity,
      unit_price: line.unitPrice,
      discount_percent: line.discountPercent ?? 0,
      tax_rate_id: line.taxRateId ?? null,
      tax_rate_percent: taxRatePercent,
      line_subtotal_amount: amounts.subtotal,
      line_tax_amount: amounts.tax,
      line_total_amount: amounts.total,
      analytic_account_id: line.analyticAccountId ?? null,
      created_by_user_id: userId,
    });
  }

  return computedLines;
}
