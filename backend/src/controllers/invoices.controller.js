import prisma from '../lib/prisma.js';

export const getInvoices = async (req, res, next) => {
  try {
    const orgId = req.organizationId || (await prisma.organizations.findFirst())?.id;
    if (!orgId) return res.json({ success: true, data: [] });

    const invoices = await prisma.commercial_documents.findMany({
      where: {
        organization_id: orgId,
        document_type: { in: ['customer_invoice', 'vendor_bill'] },
        deleted_at: null
      },
      include: {
        contacts: true,
        origin_document: true, // origin order
        payment_allocations: {
          include: { payments: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const formatted = invoices.map(inv => {
      const isCustomer = inv.document_type === 'customer_invoice';
      const paidAmount = inv.payment_allocations.reduce((sum, a) => sum + Number(a.allocated_amount), 0);
      const totalAmount = Number(inv.total_amount) || 0;
      const isPaid = paidAmount >= totalAmount && totalAmount > 0;
      const status = isPaid ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Unpaid');
      const latestPayment = inv.payment_allocations[0]?.payments;

      return {
        id: inv.document_number,
        docId: inv.id,
        type: isCustomer ? 'Customer Invoice' : 'Vendor Bill',
        orderId: inv.origin_document?.document_number || '',
        contactId: inv.contact_id,
        contactName: inv.contacts?.display_name || 'Contact',
        date: inv.document_date.toISOString().split('T')[0],
        dueDate: inv.due_date ? inv.due_date.toISOString().split('T')[0] : '',
        status: status,
        amount: totalAmount,
        paidAmount,
        paymentMethod: latestPayment ? (latestPayment.payment_direction === 'inbound' ? 'Bank Transfer' : 'HDFC Bank') : '',
        createdAt: inv.created_at
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
};

export const createInvoice = async (req, res, next) => {
  try {
    const orgId = req.organizationId || (await prisma.organizations.findFirst())?.id;
    const { type = 'Customer Invoice', contactId, contactName, date, dueDate, amount = 0, items = [] } = req.body;

    const isCustomer = type === 'Customer Invoice';
    const docType = isCustomer ? 'customer_invoice' : 'vendor_bill';

    let actualContactId = contactId;
    if (!actualContactId && contactName) {
      let contact = await prisma.contacts.findFirst({
        where: { organization_id: orgId, display_name: contactName }
      });
      if (!contact) {
        contact = await prisma.contacts.create({
          data: {
            organization_id: orgId,
            display_name: contactName,
            contact_type: isCustomer ? 'customer' : 'vendor',
            is_active: true
          }
        });
      }
      actualContactId = contact.id;
    }

    if (!actualContactId) {
      const firstContact = await prisma.contacts.findFirst({ where: { organization_id: orgId } });
      actualContactId = firstContact?.id;
    }

    const count = await prisma.commercial_documents.count({
      where: { organization_id: orgId, document_type: docType }
    });

    const prefix = isCustomer ? 'INV' : 'BILL';
    const docNumber = `${prefix}-${String(count + 1).padStart(3, '0')}`;
    const totalAmount = Number(amount) || 0;

    const newDoc = await prisma.commercial_documents.create({
      data: {
        organization_id: orgId,
        document_type: docType,
        document_number: docNumber,
        status: 'posted',
        contact_id: actualContactId,
        document_date: date ? new Date(date) : new Date(),
        due_date: dueDate ? new Date(dueDate) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        currency_code: 'INR',
        subtotal_amount: totalAmount,
        tax_amount: 0,
        total_amount: totalAmount
      },
      include: { contacts: true }
    });

    // Auto double entry
    const journalType = isCustomer ? 'sales' : 'purchase';
    const journal = await prisma.journals.findFirst({ where: { organization_id: orgId, journal_type: journalType } });
    const acc1Code = isCustomer ? '1100' : '5010';
    const acc2Code = isCustomer ? '4010' : '2010';
    const acc1 = await prisma.chart_of_accounts.findFirst({ where: { organization_id: orgId, account_code: acc1Code } });
    const acc2 = await prisma.chart_of_accounts.findFirst({ where: { organization_id: orgId, account_code: acc2Code } });

    if (journal && acc1 && acc2 && totalAmount > 0) {
      const jeCount = await prisma.journal_entries.count({ where: { organization_id: orgId } });
      await prisma.journal_entries.create({
        data: {
          organization_id: orgId,
          journal_id: journal.id,
          entry_number: `JE-${String(jeCount + 1).padStart(3, '0')}`,
          entry_date: newDoc.document_date,
          reference: `${newDoc.document_number} (${newDoc.contacts?.display_name})`,
          status: 'posted',
          posted_at: new Date(),
          commercial_document_id: newDoc.id,
          journal_entry_lines: {
            create: [
              {
                line_number: 1,
                account_id: acc1.id,
                description: acc1.name,
                debit_amount: totalAmount,
                credit_amount: 0
              },
              {
                line_number: 2,
                account_id: acc2.id,
                description: acc2.name,
                debit_amount: 0,
                credit_amount: totalAmount
              }
            ]
          }
        }
      });
    }

    res.status(201).json({
      success: true,
      message: `${type} created successfully with journal entry`,
      data: {
        id: newDoc.document_number,
        docId: newDoc.id,
        type,
        orderId: '',
        contactId: newDoc.contact_id,
        contactName: newDoc.contacts?.display_name || contactName,
        date: newDoc.document_date.toISOString().split('T')[0],
        dueDate: newDoc.due_date ? newDoc.due_date.toISOString().split('T')[0] : '',
        status: 'Unpaid',
        amount: totalAmount,
        paidAmount: 0,
        paymentMethod: ''
      }
    });
  } catch (err) {
    next(err);
  }
};

export const payInvoice = async (req, res, next) => {
  try {
    const orgId = req.organizationId || (await prisma.organizations.findFirst())?.id;
    const { id } = req.params; // document_number or UUID
    const { paymentMethod = 'HDFC Bank', amount } = req.body;

    const doc = await prisma.commercial_documents.findFirst({
      where: {
        organization_id: orgId,
        OR: [{ id }, { document_number: id }]
      },
      include: {
        contacts: true,
        payment_allocations: true
      }
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const isCustomer = doc.document_type === 'customer_invoice';
    const totalDocAmount = Number(doc.total_amount);
    const existingPaid = doc.payment_allocations.reduce((s, a) => s + Number(a.allocated_amount), 0);
    const payAmount = amount !== undefined ? Number(amount) : (totalDocAmount - existingPaid);

    if (payAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Document is already fully paid' });
    }

    // 1. Create Payment Record
    const payCount = await prisma.payments.count({ where: { organization_id: orgId } });
    const paymentNumber = `PAY-${String(payCount + 1).padStart(3, '0')}`;
    const direction = isCustomer ? 'inbound' : 'outbound';

    const payment = await prisma.payments.create({
      data: {
        organization_id: orgId,
        contact_id: doc.contact_id,
        payment_number: paymentNumber,
        payment_direction: direction,
        amount: payAmount,
        currency_code: 'INR',
        payment_date: new Date(),
        status: 'posted'
      }
    });

    // 2. Allocate payment to document
    await prisma.payment_allocations.create({
      data: {
        payment_id: payment.id,
        document_id: doc.id,
        allocated_amount: payAmount
      }
    });

    // 3. Update document status
    const newPaidTotal = existingPaid + payAmount;
    const newStatus = newPaidTotal >= totalDocAmount ? 'paid' : 'partially_paid';
    await prisma.commercial_documents.update({
      where: { id: doc.id },
      data: { status: newStatus }
    });

    // 4. Create Double-Entry in Bank/Cash Journal
    const isCash = paymentMethod.toLowerCase().includes('cash');
    const journalType = isCash ? 'cash' : 'bank';
    const journal = await prisma.journals.findFirst({ where: { organization_id: orgId, journal_type: journalType } });
    const bankOrCashAccCode = isCash ? '1010' : '1020';
    const bankOrCashAcc = await prisma.chart_of_accounts.findFirst({ where: { organization_id: orgId, account_code: bankOrCashAccCode } });
    const offsetAccCode = isCustomer ? '1100' : '2010'; // AR for customer, AP for vendor
    const offsetAcc = await prisma.chart_of_accounts.findFirst({ where: { organization_id: orgId, account_code: offsetAccCode } });

    if (journal && bankOrCashAcc && offsetAcc) {
      const jeCount = await prisma.journal_entries.count({ where: { organization_id: orgId } });
      await prisma.journal_entries.create({
        data: {
          organization_id: orgId,
          journal_id: journal.id,
          entry_number: `JE-${String(jeCount + 1).padStart(3, '0')}`,
          entry_date: new Date(),
          reference: `Payment for ${doc.document_number} (${doc.contacts?.display_name})`,
          status: 'posted',
          posted_at: new Date(),
          commercial_document_id: doc.id,
          journal_entry_lines: {
            create: isCustomer
              ? [
                  {
                    line_number: 1,
                    account_id: bankOrCashAcc.id,
                    description: bankOrCashAcc.name,
                    debit_amount: payAmount,
                    credit_amount: 0
                  },
                  {
                    line_number: 2,
                    account_id: offsetAcc.id,
                    description: offsetAcc.name,
                    debit_amount: 0,
                    credit_amount: payAmount
                  }
                ]
              : [
                  {
                    line_number: 1,
                    account_id: offsetAcc.id,
                    description: offsetAcc.name,
                    debit_amount: payAmount,
                    credit_amount: 0
                  },
                  {
                    line_number: 2,
                    account_id: bankOrCashAcc.id,
                    description: bankOrCashAcc.name,
                    debit_amount: 0,
                    credit_amount: payAmount
                  }
                ]
          }
        }
      });
    }

    res.json({
      success: true,
      message: 'Payment recorded and balanced in general ledger',
      paidAmount: newPaidTotal,
      status: newStatus === 'paid' ? 'Paid' : 'Partial'
    });
  } catch (err) {
    next(err);
  }
};
