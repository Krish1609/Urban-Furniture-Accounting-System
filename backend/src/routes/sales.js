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
import { requireAuth, requireRole, scopeToOwnContact } from '../middleware/auth.js';
import { getOrCreateAccount, getOrCreateJournal, postSalesInvoiceEntry, postCustomerPaymentEntry } from '../services/accounting.js';

const router = Router();

// ---------------------------------------------------------------------------
// Sales Orders
// ---------------------------------------------------------------------------

router.post('/sales-orders', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
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

    const customer = await prisma.contacts.findFirst({
      where: { id: contactId, organization_id: resolvedOrganizationId },
    });
    if (!customer) return res.status(400).json({ error: 'contact_id does not belong to organization_id' });
    if (!['customer', 'both'].includes(customer.contact_type)) {
      return res.status(400).json({ error: 'contact_id must be a customer contact' });
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

    const documentNumber = await generateDocumentNumber(resolvedOrganizationId, 'sales_order', 'SO');

    const salesOrder = await prisma.commercial_documents.create({
      data: {
        organization_id: resolvedOrganizationId,
        document_type: 'sales_order',
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

    res.status(201).json(salesOrder);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

router.patch('/sales-orders/:id/confirm', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const salesOrder = await prisma.commercial_documents.findUnique({
      where: { id: req.params.id },
      include: { commercial_document_lines: true },
    });
    if (!salesOrder || salesOrder.document_type !== 'sales_order') {
      return res.status(404).json({ error: 'Sales order not found' });
    }
    if (salesOrder.status !== 'draft') {
      return res.status(400).json({ error: `Cannot confirm a sales order with status ${salesOrder.status}` });
    }

    try {
      await checkBudgetForLines(salesOrder.commercial_document_lines, salesOrder.document_date);
    } catch (budgetError) {
      return res.status(400).json({ error: budgetError.message });
    }

    const confirmed = await prisma.commercial_documents.update({
      where: { id: salesOrder.id },
      data: { status: 'confirmed', confirmed_at: new Date(), updated_by_user_id: req.user.id },
    });
    res.json(confirmed);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

router.post('/sales-orders/:id/invoice', requireAuth, requireRole('admin', 'accountant'), async (req, res, next) => {
  try {
    const salesOrder = await prisma.commercial_documents.findUnique({
      where: { id: req.params.id },
      include: { commercial_document_lines: true },
    });
    if (!salesOrder || salesOrder.document_type !== 'sales_order') {
      return res.status(404).json({ error: 'Sales order not found' });
    }
    if (salesOrder.status !== 'confirmed') {
      return res.status(400).json({ error: `Cannot invoice a sales order with status ${salesOrder.status}` });
    }

    const existingInvoice = await prisma.commercial_documents.findFirst({
      where: { origin_document_id: salesOrder.id, document_type: 'customer_invoice' },
      select: { id: true },
    });
    if (existingInvoice) {
      return res.status(400).json({ error: `Sales order already invoiced (customer invoice ${existingInvoice.id})` });
    }

    const { document_date: documentDate, due_date: dueDate } = req.body ?? {};
    const invoiceDate = documentDate ? new Date(documentDate) : new Date();
    if (Number.isNaN(invoiceDate.getTime())) {
      return res.status(400).json({ error: 'document_date must be a valid date' });
    }

    try {
      await checkBudgetForLines(salesOrder.commercial_document_lines, invoiceDate);
    } catch (budgetError) {
      return res.status(400).json({ error: budgetError.message });
    }

    // subtotal/tax/total are recomputed from the sales order's own lines here rather than trusted
    // from the request body - the client never gets to supply totals for the invoice it produces.
    const subtotalAmount = salesOrder.commercial_document_lines.reduce((sum, line) => sum + toAmount(line.line_subtotal_amount), 0);
    const taxAmount = salesOrder.commercial_document_lines.reduce((sum, line) => sum + toAmount(line.line_tax_amount), 0);
    const totalAmount = salesOrder.commercial_document_lines.reduce((sum, line) => sum + toAmount(line.line_total_amount), 0);

    // Invoice creation, posting, and the SO's own status update all happen in one transaction:
    // if postSalesInvoiceEntry throws partway through, nothing is left behind - previously a
    // failure here could leave an orphaned draft invoice that the (status-blind) existingInvoice
    // check above would then treat as "already invoiced" forever, with no way to retry.
    const result = await prisma.$transaction(async (tx) => {
      const documentNumber = await generateDocumentNumber(salesOrder.organization_id, 'customer_invoice', 'INV', tx);

      const invoice = await tx.commercial_documents.create({
        data: {
          organization_id: salesOrder.organization_id,
          document_type: 'customer_invoice',
          document_number: documentNumber,
          contact_id: salesOrder.contact_id,
          origin_document_id: salesOrder.id,
          document_date: invoiceDate,
          due_date: dueDate ? new Date(dueDate) : null,
          currency_code: salesOrder.currency_code,
          notes: salesOrder.notes,
          subtotal_amount: subtotalAmount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          created_by_user_id: req.user.id,
          commercial_document_lines: {
            create: salesOrder.commercial_document_lines.map((line) => ({
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

      const { journalEntry, commercialDocument } = await postSalesInvoiceEntry(
        { commercialDocumentId: invoice.id, createdByUserId: req.user.id },
        tx,
      );

      // commercial_document_status has no "invoiced" state for the SO side of an SO->Invoice
      // conversion; "posted" is the closest existing value meaning "this document's lifecycle is complete."
      const postedSalesOrder = await tx.commercial_documents.update({
        where: { id: salesOrder.id },
        data: { status: 'posted', posted_at: new Date(), updated_by_user_id: req.user.id },
      });

      return { salesOrder: postedSalesOrder, customerInvoice: commercialDocument, journalEntry };
    }, { timeout: 15000 });

    res.status(201).json(result);
  } catch (error) {
    if (handleKnownPrismaErrors(error, res)) return;
    next(error);
  }
});

// ---------------------------------------------------------------------------
// Customer Invoices
// ---------------------------------------------------------------------------

router.get('/my-invoices', requireAuth, requireRole('contact_portal'), async (req, res, next) => {
  try {
    if (!req.user.contact_id) {
      return res.status(403).json({ error: 'Account has no linked contact' });
    }
    const invoices = await prisma.commercial_documents.findMany({
      where: { document_type: 'customer_invoice', contact_id: req.user.contact_id },
      include: { commercial_document_lines: true },
      orderBy: { document_date: 'desc' },
    });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
});

router.post(
  '/invoices/:id/pay',
  requireAuth,
  requireRole('admin', 'accountant', 'contact_portal'),
  scopeToOwnContact,
  async (req, res, next) => {
    try {
      const invoice = await prisma.commercial_documents.findUnique({ where: { id: req.params.id } });
      if (!invoice || invoice.document_type !== 'customer_invoice') {
        return res.status(404).json({ error: 'Customer invoice not found' });
      }
      // scopeToOwnContact only rewrites contact_id fields it finds in params/query/body; this
      // route identifies the invoice by :id, not by a contact_id the client supplies, so ownership
      // has to be checked explicitly against the invoice's own contact_id here.
      if (req.user.role === 'contact_portal' && invoice.contact_id !== req.contactId) {
        return res.status(403).json({ error: 'Cannot pay an invoice belonging to another contact' });
      }
      if (!['posted', 'partially_paid'].includes(invoice.status)) {
        return res.status(400).json({ error: `Cannot pay a customer invoice with status ${invoice.status}` });
      }

      const {
        amount,
        payment_date: paymentDate,
        payment_account_id: requestedPaymentAccountId,
        journal_id: requestedJournalId,
        external_reference: externalReference,
      } = req.body ?? {};

      if (!isNonNegativeNumber(amount) || amount <= 0) {
        return res.status(400).json({ error: 'amount must be greater than 0' });
      }
      if (!paymentDate || Number.isNaN(new Date(paymentDate).getTime())) {
        return res.status(400).json({ error: 'payment_date must be a valid date' });
      }

      // A contact_portal caller shouldn't get to name an arbitrary internal chart-of-accounts /
      // journal id, so a self-service payment always lands in a default Bank account/journal;
      // staff recording a payment on a customer's behalf choose the account explicitly (and it
      // must belong to the same organization as the invoice).
      let paymentAccountId = requestedPaymentAccountId;
      let journalId = requestedJournalId;
      if (req.user.role === 'contact_portal') {
        const bankAccount = await getOrCreateAccount(invoice.organization_id, 'Bank', 'asset');
        const bankJournal = await getOrCreateJournal(invoice.organization_id, 'Bank', 'bank');
        paymentAccountId = bankAccount.id;
        journalId = bankJournal.id;
      } else {
        if (!paymentAccountId) return res.status(400).json({ error: 'payment_account_id is required' });
        if (!journalId) return res.status(400).json({ error: 'journal_id is required' });

        const paymentAccount = await prisma.chart_of_accounts.findFirst({
          where: { id: paymentAccountId, organization_id: invoice.organization_id },
          select: { id: true },
        });
        if (!paymentAccount) return res.status(400).json({ error: 'payment_account_id does not belong to organization_id' });

        const journal = await prisma.journals.findFirst({
          where: { id: journalId, organization_id: invoice.organization_id },
          select: { id: true },
        });
        if (!journal) return res.status(400).json({ error: 'journal_id does not belong to organization_id' });
      }

      // See purchases.js's /vendor-bills/:id/pay for why the whole read-check/create/post/
      // allocate/status-update flow is one transaction (atomicity, not full concurrency safety).
      const result = await prisma.$transaction(async (tx) => {
        const allocations = await tx.payment_allocations.findMany({ where: { document_id: invoice.id } });
        const alreadyPaid = allocations.reduce((sum, allocation) => sum + toAmount(allocation.allocated_amount), 0);
        if (alreadyPaid + toAmount(amount) > toAmount(invoice.total_amount) + AMOUNT_TOLERANCE) {
          throw Object.assign(new Error(`Payment exceeds remaining balance: remaining is ${(toAmount(invoice.total_amount) - alreadyPaid).toFixed(2)}`), {
            isValidation: true,
          });
        }

        const payment = await tx.payments.create({
          data: {
            organization_id: invoice.organization_id,
            payment_number: await generatePaymentNumber(invoice.organization_id, 'RCPT', tx),
            payment_direction: 'inbound',
            contact_id: invoice.contact_id,
            journal_id: journalId,
            payment_account_id: paymentAccountId,
            payment_date: new Date(paymentDate),
            amount,
            currency_code: invoice.currency_code,
            external_reference: externalReference ?? null,
            created_by_user_id: req.user.id,
          },
        });

        const { journalEntry, payment: postedPayment } = await postCustomerPaymentEntry(
          { paymentId: payment.id, createdByUserId: req.user.id },
          tx,
        );

        const totalPaid = alreadyPaid + toAmount(amount);
        const newStatus = totalPaid >= toAmount(invoice.total_amount) - AMOUNT_TOLERANCE ? 'paid' : 'partially_paid';

        await tx.payment_allocations.create({
          data: {
            payment_id: payment.id,
            document_id: invoice.id,
            allocated_amount: amount,
            created_by_user_id: req.user.id,
          },
        });
        const updatedInvoice = await tx.commercial_documents.update({
          where: { id: invoice.id },
          data: { status: newStatus, updated_by_user_id: req.user.id },
        });

        return { payment: postedPayment, journalEntry, customerInvoice: updatedInvoice };
      }, { timeout: 15000 });

      res.status(201).json(result);
    } catch (error) {
      if (error.isValidation) return res.status(400).json({ error: error.message });
      if (handleKnownPrismaErrors(error, res)) return;
      next(error);
    }
  },
);

export default router;
