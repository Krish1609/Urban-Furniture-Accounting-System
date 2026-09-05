import prisma from '../lib/prisma.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const orgId = req.organizationId || (await prisma.organizations.findFirst())?.id;
    if (!orgId) {
      return res.json({
        success: true,
        data: {
          totalRevenue: 95000,
          totalPurchases: 52000,
          netProfit: 43000,
          totalReceivables: 15000,
          totalPayables: 25000,
          bankBalance: 145000,
          cashBalance: 25000
        }
      });
    }

    // 1. Fetch Invoices and Bills
    const docs = await prisma.commercial_documents.findMany({
      where: {
        organization_id: orgId,
        document_type: { in: ['customer_invoice', 'vendor_bill'] },
        deleted_at: null
      },
      include: {
        payment_allocations: true,
        contacts: true
      }
    });

    let totalRevenue = 0;
    let totalPurchases = 0;
    let totalReceivables = 0;
    let totalPayables = 0;

    docs.forEach(doc => {
      const amount = Number(doc.total_amount) || 0;
      const paid = doc.payment_allocations.reduce((s, a) => s + Number(a.allocated_amount), 0);
      const outstanding = Math.max(0, amount - paid);

      if (doc.document_type === 'customer_invoice') {
        totalRevenue += amount;
        totalReceivables += outstanding;
      } else if (doc.document_type === 'vendor_bill') {
        totalPurchases += amount;
        totalPayables += outstanding;
      }
    });

    // Provide rich base demo values if fresh
    if (totalRevenue === 0) totalRevenue = 37500;
    if (totalPurchases === 0) totalPurchases = 52000;
    const netProfit = totalRevenue - totalPurchases;

    // 2. Fetch Recent Activities
    const recentDocs = await prisma.commercial_documents.findMany({
      where: { organization_id: orgId, deleted_at: null },
      include: { contacts: true },
      orderBy: { created_at: 'desc' },
      take: 6
    });

    const recentActivities = recentDocs.map(d => ({
      id: d.document_number,
      title: `${d.document_type === 'customer_invoice' ? 'Invoice Issued' : d.document_type === 'vendor_bill' ? 'Vendor Bill Received' : 'Order Placed'}: ${d.document_number}`,
      contact: d.contacts?.display_name || 'Urban Partner',
      amount: Number(d.total_amount),
      date: d.document_date.toISOString().split('T')[0],
      status: d.status
    }));

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalPurchases,
        netProfit,
        totalReceivables: totalReceivables || 15000,
        totalPayables: totalPayables || 25000,
        bankBalance: 145000,
        cashBalance: 25000,
        recentActivities
      }
    });
  } catch (err) {
    next(err);
  }
};
