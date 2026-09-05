import prisma from '../lib/prisma.js';

export const getOrders = async (req, res, next) => {
  try {
    const orgId = req.organizationId || (await prisma.organizations.findFirst())?.id;
    if (!orgId) return res.json({ success: true, data: [] });

    const docs = await prisma.commercial_documents.findMany({
      where: {
        organization_id: orgId,
        document_type: { in: ['sales_order', 'purchase_order'] },
        deleted_at: null
      },
      include: {
        contacts: true,
        commercial_document_lines: {
          include: { products: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const formatted = docs.map(doc => ({
      id: doc.document_number,
      docId: doc.id,
      type: doc.document_type === 'sales_order' ? 'Sale' : 'Purchase',
      contactId: doc.contact_id,
      contactName: doc.contacts?.display_name || 'General Contact',
      date: doc.document_date.toISOString().split('T')[0],
      status: doc.status === 'confirmed' ? (doc.document_type === 'sales_order' ? 'Invoiced' : 'Billed') : 'Draft',
      items: doc.commercial_document_lines.map(line => ({
        id: line.id,
        productId: line.product_id,
        productName: line.products?.name || line.description,
        qty: Number(line.quantity),
        unitPrice: Number(line.unit_price),
        total: Number(line.line_total_amount)
      })),
      totalAmount: Number(doc.total_amount)
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const orgId = req.organizationId || (await prisma.organizations.findFirst())?.id;
    const { type = 'Sale', contactId, contactName, items = [], totalAmount, date } = req.body;

    const docType = type === 'Purchase' ? 'purchase_order' : 'sales_order';
    
    // Find or create contact if not provided
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
            contact_type: type === 'Purchase' ? 'vendor' : 'customer',
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

    const prefix = type === 'Purchase' ? 'PO-2026' : 'SO-2026';
    const documentNumber = `${prefix}-${String(count + 1).padStart(3, '0')}`;

    const calculatedTotal = items.reduce((sum, it) => sum + (Number(it.qty || 1) * Number(it.unitPrice || 0)), 0) || Number(totalAmount) || 0;

    const newDoc = await prisma.commercial_documents.create({
      data: {
        organization_id: orgId,
        document_type: docType,
        document_number: documentNumber,
        status: 'draft',
        contact_id: actualContactId,
        document_date: date ? new Date(date) : new Date(),
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        currency_code: 'INR',
        subtotal_amount: calculatedTotal,
        tax_amount: 0,
        total_amount: calculatedTotal,
        commercial_document_lines: {
          create: items.map((item, index) => ({
            line_number: index + 1,
            product_id: item.productId?.startsWith('prod-') ? null : item.productId || null,
            description: item.productName || 'Order Item',
            quantity: Number(item.qty) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            line_subtotal_amount: Number(item.total) || (Number(item.qty || 1) * Number(item.unitPrice || 0)),
            line_tax_amount: 0,
            line_total_amount: Number(item.total) || (Number(item.qty || 1) * Number(item.unitPrice || 0))
          }))
        }
      },
      include: {
        contacts: true,
        commercial_document_lines: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        id: newDoc.document_number,
        docId: newDoc.id,
        type,
        contactId: newDoc.contact_id,
        contactName: newDoc.contacts?.display_name || contactName,
        date: newDoc.document_date.toISOString().split('T')[0],
        status: 'Draft',
        items,
        totalAmount: Number(newDoc.total_amount)
      }
    });
  } catch (err) {
    next(err);
  }
};

export const convertToBill = async (req, res, next) => {
  try {
    const orgId = req.organizationId || (await prisma.organizations.findFirst())?.id;
    const { id } = req.params; // document_number or UUID

    const order = await prisma.commercial_documents.findFirst({
      where: {
        organization_id: orgId,
        OR: [{ id }, { document_number: id }]
      },
      include: { contacts: true, commercial_document_lines: true }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // 1. Mark order as confirmed
    await prisma.commercial_documents.update({
      where: { id: order.id },
      data: { status: 'confirmed' }
    });

    // 2. Create Vendor Bill
    const billCount = await prisma.commercial_documents.count({
      where: { organization_id: orgId, document_type: 'vendor_bill' }
    });
    const billNumber = `BILL-${String(billCount + 1).padStart(3, '0')}`;

    const newBill = await prisma.commercial_documents.create({
      data: {
        organization_id: orgId,
        document_type: 'vendor_bill',
        document_number: billNumber,
        status: 'posted',
        contact_id: order.contact_id,
        origin_document_id: order.id,
        document_date: new Date(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        currency_code: 'INR',
        subtotal_amount: order.subtotal_amount,
        tax_amount: order.tax_amount,
        total_amount: order.total_amount,
        commercial_document_lines: {
          create: order.commercial_document_lines.map(l => ({
            line_number: l.line_number,
            product_id: l.product_id,
            description: l.description,
            quantity: l.quantity,
            unit_price: l.unit_price,
            line_subtotal_amount: l.line_subtotal_amount,
            line_tax_amount: l.line_tax_amount,
            line_total_amount: l.line_total_amount
          }))
        }
      }
    });

    // 3. Create Automatic Double-Entry in Purchase Journal
    const purchJournal = await prisma.journals.findFirst({
      where: { organization_id: orgId, journal_type: 'purchase' }
    });
    const expenseAcc = await prisma.chart_of_accounts.findFirst({
      where: { organization_id: orgId, account_code: '5010' }
    });
    const payableAcc = await prisma.chart_of_accounts.findFirst({
      where: { organization_id: orgId, account_code: '2010' }
    });

    if (purchJournal && expenseAcc && payableAcc) {
      const jeCount = await prisma.journal_entries.count({ where: { organization_id: orgId } });
      await prisma.journal_entries.create({
        data: {
          organization_id: orgId,
          journal_id: purchJournal.id,
          entry_number: `JE-${String(jeCount + 1).padStart(3, '0')}`,
          entry_date: new Date(),
          reference: `${newBill.document_number} (${order.contacts?.display_name})`,
          status: 'posted',
          posted_at: new Date(),
          commercial_document_id: newBill.id,
          journal_entry_lines: {
            create: [
              {
                line_number: 1,
                account_id: expenseAcc.id,
                description: 'Raw Materials & Purchase Expense',
                debit_amount: order.total_amount,
                credit_amount: 0
              },
              {
                line_number: 2,
                account_id: payableAcc.id,
                description: 'Accounts Payable (Creditors)',
                debit_amount: 0,
                credit_amount: order.total_amount
              }
            ]
          }
        }
      });
    }

    res.json({
      success: true,
      message: 'Purchase Order successfully converted to Vendor Bill with double-entry journal created',
      billId: newBill.document_number
    });
  } catch (err) {
    next(err);
  }
};

export const convertToInvoice = async (req, res, next) => {
  try {
    const orgId = req.organizationId || (await prisma.organizations.findFirst())?.id;
    const { id } = req.params;

    const order = await prisma.commercial_documents.findFirst({
      where: {
        organization_id: orgId,
        OR: [{ id }, { document_number: id }]
      },
      include: { contacts: true, commercial_document_lines: true }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // 1. Mark order as confirmed
    await prisma.commercial_documents.update({
      where: { id: order.id },
      data: { status: 'confirmed' }
    });

    // 2. Create Customer Invoice
    const invCount = await prisma.commercial_documents.count({
      where: { organization_id: orgId, document_type: 'customer_invoice' }
    });
    const invNumber = `INV-${String(invCount + 1).padStart(3, '0')}`;

    const newInv = await prisma.commercial_documents.create({
      data: {
        organization_id: orgId,
        document_type: 'customer_invoice',
        document_number: invNumber,
        status: 'posted',
        contact_id: order.contact_id,
        origin_document_id: order.id,
        document_date: new Date(),
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        currency_code: 'INR',
        subtotal_amount: order.subtotal_amount,
        tax_amount: order.tax_amount,
        total_amount: order.total_amount,
        commercial_document_lines: {
          create: order.commercial_document_lines.map(l => ({
            line_number: l.line_number,
            product_id: l.product_id,
            description: l.description,
            quantity: l.quantity,
            unit_price: l.unit_price,
            line_subtotal_amount: l.line_subtotal_amount,
            line_tax_amount: l.line_tax_amount,
            line_total_amount: l.line_total_amount
          }))
        }
      }
    });

    // 3. Create Automatic Double-Entry in Sales Journal
    const salesJournal = await prisma.journals.findFirst({
      where: { organization_id: orgId, journal_type: 'sales' }
    });
    const receivableAcc = await prisma.chart_of_accounts.findFirst({
      where: { organization_id: orgId, account_code: '1100' }
    });
    const salesAcc = await prisma.chart_of_accounts.findFirst({
      where: { organization_id: orgId, account_code: '4010' }
    });

    if (salesJournal && receivableAcc && salesAcc) {
      const jeCount = await prisma.journal_entries.count({ where: { organization_id: orgId } });
      await prisma.journal_entries.create({
        data: {
          organization_id: orgId,
          journal_id: salesJournal.id,
          entry_number: `JE-${String(jeCount + 1).padStart(3, '0')}`,
          entry_date: new Date(),
          reference: `${newInv.document_number} (${order.contacts?.display_name})`,
          status: 'posted',
          posted_at: new Date(),
          commercial_document_id: newInv.id,
          journal_entry_lines: {
            create: [
              {
                line_number: 1,
                account_id: receivableAcc.id,
                description: 'Accounts Receivable (Debtors)',
                debit_amount: order.total_amount,
                credit_amount: 0
              },
              {
                line_number: 2,
                account_id: salesAcc.id,
                description: 'Furniture Sales Income',
                debit_amount: 0,
                credit_amount: order.total_amount
              }
            ]
          }
        }
      });
    }

    res.json({
      success: true,
      message: 'Sales Order successfully converted to Customer Invoice with double-entry journal created',
      invoiceId: newInv.document_number
    });
  } catch (err) {
    next(err);
  }
};
