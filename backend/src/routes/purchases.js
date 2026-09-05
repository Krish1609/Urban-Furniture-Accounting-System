import { Router } from 'express';

import { prisma } from '../lib/prisma.js';
import { resolveOrganizationId } from '../lib/organization.js';
import { handleKnownPrismaErrors } from '../lib/prismaErrors.js';
import { isNonNegativeNumber } from '../lib/validators.js';
import {
  AMOUNT_TOLERANCE,
  toAmount,
  generateDocumentNumber,
  generatePaymentNumber,
  validateLines,
  buildDocumentLines,
  checkBudgetForLines,
} from '../lib/commercialDocuments.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getOrCreateAccount, getOrCreateJournal, postVendorBillEntry, postVendorPaymentEntry } from '../services/accounting.js';

const router = Router();

// ---------------------------------------------------------------------------
// Purchase Orders
// ---------------------------------------------------------------------------

router.post('/purchase-orders', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const {
      contact_id: contactId,
      document_date: documentDate,
      due_date: dueDate,
      currency_code: currencyCode,
      notes,
      organization_id: organizationId,
      lines,
    } = req.body ?? {};

    if (!contactId) return res.status(400).json({ error: 'contact_id is required' });
    if (!documentDate || Number.isNaN(new Date(documentDate).getTime())) {
      return res.status(400).json({ error: 'document_date must be a valid date' });
    }
    if (!currencyCode || !/^[A-Z]{3}$/.test(currencyCode)) {
      return res.status(400).json({ error: 'currency_code must be a 3-letter uppercase code' });
    }
    const linesError = validateLines(lines);
    if (linesError) return res.status(400).json({ error: linesError });

    const resolvedOrganizationId = await resolveOrganizationId(organizationId);
    if (!resolvedOrganizationId) return res.status(400).json({ error: 'organization_id is required' });

    const vendor = await prisma.contacts.findFirst({
      where: { id: contactId, organization_id: resolvedOrganizationId },
    });
    if (!vendor) return res.status(400).json({ error: 'contact_id does not belong to organization_id' });
    if (!['vendor', 'both'].includes(vendor.contact_type)) {
      return res.status(400).json({ error: 'contact_id must be a vendor contact' });
    }

    let computedLines;
    try {
      computedLines = await buildDocumentLines({
        lines,
        organizationId: resolvedOrganizationId,
        documentDate,
        userId: req.user.id,
      });
    } catch (lineError) {
      return res.status(400).json({ error: lineError.message });
    }

    const subtotalAmount = computedLines.reduce((sum, line) => sum + toAmount(line.line_subtotal_amount), 0);
    const taxAmount = computedLines.reduce((sum, line) => sum + toAmount(line.line_tax_amount), 0);
    const totalAmount = computedLines.reduce((sum, line) => sum + toAmount(line.line_total_amount), 0);

    const documentNumber = await generateDocumentNumber(resolvedOrganizationId, 'purchase_order', 'PO');

    const purchaseOrder = await prisma.commercial_documents.create({
      data: {
        organization_id: resolvedOrganizationId,
        document_type: 'purchase_order',
        document_number: documentNumber,
        contact_id: contactId,
        document_date: new Date(documentDate),
        due_date: dueDate ? new Date(dueDate) : null,
        currency_code: currencyCode,
        notes: notes ?? null,
        subtotal_amount: subtotalAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        created_by_user_id: req.user.id,
        commercial_document_lines: { create: computedLines },
      },
      include: { commercial_document_lines: true },
    });

    res.status(201).json(purchaseOrder);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

router.patch('/purchase-orders/:id/confirm', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const purchaseOrder = await prisma.commercial_documents.findUnique({
      where: { id: req.params.id },
      include: { commercial_document_lines: true },
    });
    if (!purchaseOrder || purchaseOrder.document_type !== 'purchase_order') {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    if (purchaseOrder.status !== 'draft') {
      return res.status(400).json({ error: `Cannot confirm a purchase order with status ${purchaseOrder.status}` });
    }

    try {
      await checkBudgetForLines(purchaseOrder.commercial_document_lines, purchaseOrder.document_date);
    } catch (budgetError) {
      return res.status(400).json({ error: budgetError.message });
    }

    const confirmed = await prisma.commercial_documents.update({
      where: { id: purchaseOrder.id },
      data: { status: 'confirmed', confirmed_at: new Date(), updated_by_user_id: req.user.id },
    });
    res.json(confirmed);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

router.post('/purchase-orders/:id/bill', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const purchaseOrder = await prisma.commercial_documents.findUnique({
      where: { id: req.params.id },
      include: { commercial_document_lines: true },
    });
    if (!purchaseOrder || purchaseOrder.document_type !== 'purchase_order') {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    if (purchaseOrder.status !== 'confirmed') {
      return res.status(400).json({ error: `Cannot bill a purchase order with status ${purchaseOrder.status}` });
    }

    const existingBill = await prisma.commercial_documents.findFirst({
      where: { origin_document_id: purchaseOrder.id, document_type: 'vendor_bill' },
      select: { id: true },
    });
    if (existingBill) {
      return res.status(400).json({ error: `Purchase order already billed (vendor bill ${existingBill.id})` });
    }

    const { document_date: documentDate, due_date: dueDate } = req.body ?? {};
    const billDate = documentDate ? new Date(documentDate) : new Date();
    if (Number.isNaN(billDate.getTime())) {
      return res.status(400).json({ error: 'document_date must be a valid date' });
    }

    try {
      await checkBudgetForLines(purchaseOrder.commercial_document_lines, billDate);
    } catch (budgetError) {
      return res.status(400).json({ error: budgetError.message });
    }

    // Bill creation, posting, and the PO's own status update all happen in one transaction:
    // if postVendorBillEntry throws partway through, nothing is left behind - previously a
    // failure here could leave an orphaned draft bill that the (status-blind) existingBill
    // check above would then treat as "already billed" forever, with no way to retry.
    const result = await prisma.$transaction(async (tx) => {
      const documentNumber = await generateDocumentNumber(purchaseOrder.organization_id, 'vendor_bill', 'BILL', tx);

      const bill = await tx.commercial_documents.create({
        data: {
          organization_id: purchaseOrder.organization_id,
          document_type: 'vendor_bill',
          document_number: documentNumber,
          contact_id: purchaseOrder.contact_id,
          origin_document_id: purchaseOrder.id,
          document_date: billDate,
          due_date: dueDate ? new Date(dueDate) : null,
          currency_code: purchaseOrder.currency_code,
          notes: purchaseOrder.notes,
          subtotal_amount: purchaseOrder.subtotal_amount,
          tax_amount: purchaseOrder.tax_amount,
          total_amount: purchaseOrder.total_amount,
          created_by_user_id: req.user.id,
          commercial_document_lines: {
            create: purchaseOrder.commercial_document_lines.map((line) => ({
              line_number: line.line_number,
              product_id: line.product_id,
              description: line.description,
              quantity: line.quantity,
              unit_price: line.unit_price,
              discount_percent: line.discount_percent,
              tax_rate_id: line.tax_rate_id,
              tax_rate_percent: line.tax_rate_percent,
              line_subtotal_amount: line.line_subtotal_amount,
              line_tax_amount: line.line_tax_amount,
              line_total_amount: line.line_total_amount,
              analytic_account_id: line.analytic_account_id,
              created_by_user_id: req.user.id,
            })),
          },
        },
      });

      const { journalEntry, commercialDocument } = await postVendorBillEntry(
        { commercialDocumentId: bill.id, createdByUserId: req.user.id },
        tx,
      );

      // commercial_document_status has no "billed" state for the PO side of a PO->Bill
      // conversion; "posted" is the closest existing value meaning "this document's lifecycle is complete."
      const postedPurchaseOrder = await tx.commercial_documents.update({
        where: { id: purchaseOrder.id },
        data: { status: 'posted', posted_at: new Date(), updated_by_user_id: req.user.id },
      });

      return { purchaseOrder: postedPurchaseOrder, vendorBill: commercialDocument, journalEntry };
    }, { timeout: 15000 });

    res.status(201).json(result);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

// ---------------------------------------------------------------------------
// Vendor Bills
// ---------------------------------------------------------------------------

router.get('/my-bills', requireAuth, requireRole('contact_portal'), async (req, res, next) => {
  try {
    if (!req.user.contact_id) {
      return res.status(403).json({ error: 'Account has no linked contact' });
    }
    const bills = await prisma.commercial_documents.findMany({
      where: { document_type: 'vendor_bill', contact_id: req.user.contact_id },
      include: { commercial_document_lines: true },
      orderBy: { document_date: 'desc' },
    });
    res.json(bills);
  } catch (error) {
    next(error);
  }
});

router.post('/vendor-bills/:id/pay', requireAuth, requireRole('admin', 'accountant', 'contact_portal'), async (req, res, next) => {
  try {
    const bill = await prisma.commercial_documents.findUnique({ where: { id: req.params.id } });
    if (!bill || bill.document_type !== 'vendor_bill') {
      return res.status(404).json({ error: 'Vendor bill not found' });
    }
    if (req.user.role === 'USER' && bill.contact_id !== req.user.contact_id) {
      return res.status(403).json({ error: 'Cannot pay a vendor bill belonging to another contact' });
    }
    if (!['posted', 'partially_paid'].includes(bill.status)) {
      return res.status(400).json({ error: `Cannot pay a vendor bill with status ${bill.status}` });
    }

    const {
      amount,
      payment_date: paymentDate,
      payment_account_id: paymentAccountId,
      journal_id: journalId,
      external_reference: externalReference,
    } = req.body ?? {};

    if (!isNonNegativeNumber(amount) || amount <= 0) {
      return res.status(400).json({ error: 'amount must be greater than 0' });
    }
    if (!paymentDate || Number.isNaN(new Date(paymentDate).getTime())) {
      return res.status(400).json({ error: 'payment_date must be a valid date' });
    }
    let resolvedPaymentAccountId = paymentAccountId;
    let resolvedJournalId = journalId;
    if (req.user.role === 'USER') {
      const bankAccount = await getOrCreateAccount(bill.organization_id, 'Bank', 'asset');
      const bankJournal = await getOrCreateJournal(bill.organization_id, 'Bank', 'bank');
      resolvedPaymentAccountId = bankAccount.id;
      resolvedJournalId = bankJournal.id;
    } else {
      if (!resolvedPaymentAccountId) return res.status(400).json({ error: 'payment_account_id is required' });
      if (!resolvedJournalId) return res.status(400).json({ error: 'journal_id is required' });
    }

    const paymentAccount = await prisma.chart_of_accounts.findFirst({
      where: { id: resolvedPaymentAccountId, organization_id: bill.organization_id },
      select: { id: true },
    });
    if (!paymentAccount) return res.status(400).json({ error: 'payment_account_id does not belong to organization_id' });

    const journal = await prisma.journals.findFirst({
      where: { id: resolvedJournalId, organization_id: bill.organization_id },
      select: { id: true },
    });
    if (!journal) return res.status(400).json({ error: 'journal_id does not belong to organization_id' });

    // The remaining-balance check, payment creation, posting, allocation, and status update all
    // happen in one transaction: previously the payment was created and posted (committed) before
    // a *separate* transaction wrote the allocation and status, so a failure in that second step
    // left a posted payment with no allocation row - the derived paid amount would then silently
    // disagree with the ledger. This doesn't fully close the race between two concurrent /pay
    // calls (that would need a DB-level check constraint this schema doesn't have), but it does
    // guarantee the payment/allocation/status write is now all-or-nothing.
    const result = await prisma.$transaction(async (tx) => {
      const allocations = await tx.payment_allocations.findMany({ where: { document_id: bill.id } });
      const alreadyPaid = allocations.reduce((sum, allocation) => sum + toAmount(allocation.allocated_amount), 0);
      if (alreadyPaid + toAmount(amount) > toAmount(bill.total_amount) + AMOUNT_TOLERANCE) {
        throw Object.assign(new Error(`Payment exceeds remaining balance: remaining is ${(toAmount(bill.total_amount) - alreadyPaid).toFixed(2)}`), {
          isValidation: true,
        });
      }

      const payment = await tx.payments.create({
        data: {
          organization_id: bill.organization_id,
          payment_number: await generatePaymentNumber(bill.organization_id, 'VPAY', tx),
          payment_direction: 'outbound',
          contact_id: bill.contact_id,
          journal_id: resolvedJournalId,
          payment_account_id: resolvedPaymentAccountId,
          payment_date: new Date(paymentDate),
          amount,
          currency_code: bill.currency_code,
          external_reference: externalReference ?? null,
          created_by_user_id: req.user.id,
        },
      });

      const { journalEntry, payment: postedPayment } = await postVendorPaymentEntry(
        { paymentId: payment.id, createdByUserId: req.user.id },
        tx,
      );

      const totalPaid = alreadyPaid + toAmount(amount);
      const newStatus = totalPaid >= toAmount(bill.total_amount) - AMOUNT_TOLERANCE ? 'paid' : 'partially_paid';

      await tx.payment_allocations.create({
        data: {
          payment_id: payment.id,
          document_id: bill.id,
          allocated_amount: amount,
          created_by_user_id: req.user.id,
        },
      });
      const updatedBill = await tx.commercial_documents.update({
        where: { id: bill.id },
        data: { status: newStatus, updated_by_user_id: req.user.id },
      });

      return { payment: postedPayment, journalEntry, vendorBill: updatedBill };
    }, { timeout: 15000 });

    res.status(201).json(result);
  } catch (error) {
    if (error.isValidation) return res.status(400).json({ error: error.message });
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

export default router;
