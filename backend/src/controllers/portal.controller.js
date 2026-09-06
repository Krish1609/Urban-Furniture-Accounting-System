import prisma from '../lib/prisma.js';

export const getPortalData = async (req, res, next) => {
  try {
    const orgId = req.organizationId || (await prisma.organizations.findFirst())?.id;
    const { contactId, email } = req.query;

    // Find contact
    let contact = null;
    if (contactId) {
      contact = await prisma.contacts.findUnique({ where: { id: contactId } });
    } else if (email) {
      contact = await prisma.contacts.findFirst({ where: { organization_id: orgId, email } });
    } else {
      // Default to Nimesh Pathak for portal demo
      contact = await prisma.contacts.findFirst({
        where: { organization_id: orgId, email: 'nimesh.pathak@client.com' }
      });
      if (!contact) {
        contact = await prisma.contacts.findFirst({ where: { organization_id: orgId } });
      }
    }

    if (!contact) {
      return res.json({
        success: true,
        data: { contact: null, invoices: [], payments: [] }
      });
    }

    // Fetch invoices for this contact
    const documents = await prisma.commercial_documents.findMany({
      where: {
        organization_id: orgId,
        contact_id: contact.id,
        deleted_at: null
      },
      include: {
        payment_allocations: { include: { payments: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    const invoices = documents.map(doc => {
      const paid = doc.payment_allocations.reduce((s, a) => s + Number(a.allocated_amount), 0);
      const total = Number(doc.total_amount);
      return {
        id: doc.document_number,
        date: doc.document_date.toISOString().split('T')[0],
        dueDate: doc.due_date ? doc.due_date.toISOString().split('T')[0] : '',
        amount: total,
        paidAmount: paid,
        status: paid >= total && total > 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Unpaid'),
        type: doc.document_type === 'customer_invoice' ? 'Invoice' : 'Bill'
      };
    });

    // Fetch payments
    const payments = await prisma.payments.findMany({
      where: { organization_id: orgId, contact_id: contact.id },
      orderBy: { payment_date: 'desc' }
    });

    const formattedPayments = payments.map(p => ({
      id: p.payment_number,
      date: p.payment_date.toISOString().split('T')[0],
      method: p.payment_method === 'razorpay' 
        ? 'Razorpay (UPI / Cards)' 
        : (p.payment_method === 'cash' ? 'Cash Receipt' : (p.payment_direction === 'inbound' ? 'Bank Transfer' : 'HDFC Bank Direct')),
      status: 'Completed'
    }));

    res.json({
      success: true,
      data: {
        contact: {
          id: contact.id,
          name: contact.display_name,
          email: contact.email,
          phone: contact.phone
        },
        invoices,
        payments: formattedPayments
      }
    });
  } catch (err) {
    next(err);
  }
};
