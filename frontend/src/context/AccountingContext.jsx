import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { createContact, createProduct, loadAccountingData } from '../services/accounting';
import {
  INITIAL_CHART_OF_ACCOUNTS,
  INITIAL_JOURNALS,
  INITIAL_CONTACTS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_INVOICES,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_ANALYTIC_ACCOUNTS,
  INITIAL_BUDGETS
} from '../data/initialData';

const AccountingContext = createContext();

export function AccountingProvider({ children }) {
  const { currentUser, isAuthenticated } = useAuth();
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [chartOfAccounts, setChartOfAccounts] = useState(INITIAL_CHART_OF_ACCOUNTS);
  const [journals, setJournals] = useState(INITIAL_JOURNALS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [journalEntries, setJournalEntries] = useState(INITIAL_JOURNAL_ENTRIES);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [analyticAccounts, setAnalyticAccounts] = useState(INITIAL_ANALYTIC_ACCOUNTS);
  const [loading, setLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !isAuthenticated || !currentUser?.id) return undefined;
    let mounted = true;
    loadAccountingData(currentUser.id).then((data) => {
      if (!mounted) return;
      setContacts(data.contacts);
      setProducts(data.products);
      setChartOfAccounts(data.chartOfAccounts);
      setJournals(data.journals);
      setAnalyticAccounts(data.analyticAccounts);
      setBudgets(data.budgets);
    }).catch((error) => console.error('Supabase accounting load failed:', error));
    return () => { mounted = false; };
  }, [currentUser?.id, isAuthenticated]);

  // Fetch all data from live backend on load
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        backendContacts,
        backendProducts,
        backendCoa,
        backendJournals,
        backendOrders,
        backendInvoices,
        backendJe,
        backendBudgets,
        backendAnalytics
      ] = await Promise.all([
        api.getContacts(),
        api.getProducts(),
        api.getChartOfAccounts(),
        api.getJournals(),
        api.getOrders(),
        api.getInvoices(),
        api.getJournalEntries(),
        api.getBudgets(),
        api.getAnalyticAccounts()
      ]);

      if (Array.isArray(backendContacts) && backendContacts.length > 0) setContacts(backendContacts);
      if (Array.isArray(backendProducts) && backendProducts.length > 0) setProducts(backendProducts);
      if (Array.isArray(backendCoa) && backendCoa.length > 0) setChartOfAccounts(backendCoa);
      if (Array.isArray(backendJournals) && backendJournals.length > 0) setJournals(backendJournals);
      if (Array.isArray(backendOrders) && backendOrders.length > 0) setOrders(backendOrders);
      if (Array.isArray(backendInvoices) && backendInvoices.length > 0) setInvoices(backendInvoices);
      if (Array.isArray(backendJe) && backendJe.length > 0) setJournalEntries(backendJe);
      if (Array.isArray(backendBudgets) && backendBudgets.length > 0) setBudgets(backendBudgets);
      if (Array.isArray(backendAnalytics) && backendAnalytics.length > 0) setAnalyticAccounts(backendAnalytics);

      setIsBackendConnected(true);
    } catch (err) {
      console.warn('Backend unavailable, running in optimistic mode:', err);
      setIsBackendConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Financial Metrics dynamically computed
  const totalRevenue = useMemo(() => {
    return (invoices || [])
      .filter((inv) => inv && inv.type === 'Customer Invoice')
      .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  }, [invoices]);

  const totalPurchases = useMemo(() => {
    return (invoices || [])
      .filter((inv) => inv && inv.type === 'Vendor Bill')
      .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  }, [invoices]);

  const netProfit = totalRevenue - totalPurchases;

  const totalReceivables = useMemo(() => {
    return (invoices || [])
      .filter((inv) => inv && inv.type === 'Customer Invoice' && inv.status !== 'Paid')
      .reduce((sum, inv) => sum + ((Number(inv.amount) || 0) - (Number(inv.paidAmount) || 0)), 0);
  }, [invoices]);

  const totalPayables = useMemo(() => {
    return (invoices || [])
      .filter((inv) => inv && inv.type === 'Vendor Bill' && inv.status !== 'Paid')
      .reduce((sum, inv) => sum + ((Number(inv.amount) || 0) - (Number(inv.paidAmount) || 0)), 0);
  }, [invoices]);

  const totalBankBalance = useMemo(() => {
    const bankAcc = (chartOfAccounts || []).find((acc) => acc && (acc.id === '1020' || acc.code === '1020'));
    return bankAcc ? Number(bankAcc.balance) || 0 : 145000;
  }, [chartOfAccounts]);

  const totalCashBalance = useMemo(() => {
    const cashAcc = (chartOfAccounts || []).find((acc) => acc && (acc.id === '1010' || acc.code === '1010'));
    return cashAcc ? Number(cashAcc.balance) || 0 : 25000;
  }, [chartOfAccounts]);

  // Actions connected to Backend with optimistic updates
  const addContact = async (newContact) => {
    if (isSupabaseConfigured && currentUser?.id) {
      const savedContact = await createContact(currentUser.id, newContact);
      setContacts((prev) => [{ ...newContact, id: savedContact.id, status: 'Active', totalBilled: 0, totalPaid: 0, dueAmount: 0 }, ...(prev || [])]);
      return;
    }

    const optimisticObj = {
      id: `cnt-${Date.now()}`,
      status: 'Active',
      totalBilled: 0,
      totalPaid: 0,
      dueAmount: 0,
      ...newContact,
    };
    setContacts((prev) => [optimisticObj, ...(prev || [])]);

    try {
      const res = await api.createContact(newContact);
      if (res && res.data) {
        setContacts((prev) => (prev || []).map((c) => (c.id === optimisticObj.id ? res.data : c)));
      }
    } catch (e) {
      console.error('Error adding contact to backend:', e);
    }
  };

  const updateContact = async (id, updatedData) => {
    setContacts((prev) =>
      (prev || []).map((c) => (c.id === id ? { ...c, ...updatedData } : c))
    );
    try {
      const res = await api.updateContact(id, updatedData);
      if (res && res.data) {
        setContacts((prev) => (prev || []).map((c) => (c.id === id ? { ...c, ...res.data } : c)));
      }
    } catch (e) {
      console.error('Error updating contact:', e);
    }
  };

  const deleteContact = async (id) => {
    setContacts((prev) => (prev || []).filter((c) => c.id !== id));
    try {
      await api.deleteContact(id);
    } catch (e) {
      console.error('Error deleting contact:', e);
    }
  };

  const addProduct = async (newProduct) => {
    if (isSupabaseConfigured && currentUser?.id) {
      const product = { ...newProduct, sku: newProduct.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}` };
      const savedProduct = await createProduct(currentUser.id, product);
      setProducts((prev) => [{ ...product, id: savedProduct.id }, ...(prev || [])]);
      return;
    }

    const optimisticObj = {
      id: `prod-${Date.now()}`,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      ...newProduct,
    };
    setProducts((prev) => [optimisticObj, ...(prev || [])]);

    try {
      const res = await api.createProduct(newProduct);
      if (res && res.data) {
        setProducts((prev) => (prev || []).map((p) => (p.id === optimisticObj.id ? res.data : p)));
      }
    } catch (e) {
      console.error('Error adding product to backend:', e);
    }
  };

  const updateProduct = async (id, updatedData) => {
    setProducts((prev) =>
      (prev || []).map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );
    try {
      const res = await api.updateProduct(id, updatedData);
      if (res && res.data) {
        setProducts((prev) => (prev || []).map((p) => (p.id === id ? { ...p, ...res.data } : p)));
      }
    } catch (e) {
      console.error('Error updating product:', e);
    }
  };

  const deleteProduct = async (id) => {
    setProducts((prev) => (prev || []).filter((p) => p.id !== id));
    try {
      await api.deleteProduct(id);
    } catch (e) {
      console.error('Error deleting product:', e);
    }
  };

  const addOrder = async (newOrder) => {
    setOrders((prev) => [newOrder, ...(prev || [])]);
    try {
      const res = await api.createOrder(newOrder);
      if (res && res.data) {
        setOrders((prev) => (prev || []).map((o) => (o.id === newOrder.id ? res.data : o)));
      }
    } catch (e) {
      console.error('Error adding order to backend:', e);
    }
  };

  const createPurchaseOrder = async (poData) => {
    const poCount = (orders || []).filter(o => o.type === 'Purchase' || o.type === 'PO').length;
    const poNumber = poData.id || `PO${String(poCount + 1).padStart(4, '0')}`;
    const newPO = {
      type: 'Purchase',
      contactId: poData.contactId || 'cnt-1',
      contactName: poData.contactName || 'Mr. Rahul',
      date: poData.date || new Date().toISOString().split('T')[0],
      status: poData.status || 'Draft',
      items: poData.items || [],
      totalAmount: Number(poData.totalAmount) || 0,
      ...poData,
      id: poNumber,
    };

    setOrders((prev) => [newPO, ...(prev || [])]);
    try {
      await api.createOrder({ ...newPO, type: 'Purchase' });
    } catch (e) {
      console.error('Error creating Purchase Order:', e);
    }
    return newPO;
  };

  const convertPOToBill = async (order) => {
    if (!order) return null;
    const billCount = (invoices || []).filter(i => i.type === 'Vendor Bill').length;
    const billNum = `DB/2026/${String(billCount + 1).padStart(4, '0')}`;
    const totalNum = Number(order.totalAmount) || 0;

    const newBill = {
      id: billNum,
      type: 'Vendor Bill',
      orderId: order.id, // e.g. PO0001
      contactId: order.contactId,
      contactName: order.contactName || 'Mr. Rahul',
      reference: `ARC-26-${String(billCount + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Not Paid', // 'Paid' | 'Partial' | 'Not Paid'
      amount: totalNum,
      paidViaCash: 0,
      paidViaBank: 0,
      amountDue: totalNum,
      items: (order.items || []).map((item, idx) => ({
        srNo: idx + 1,
        product: item.productName || item.product || 'Table',
        chartOfAccount: 'Purchase', // Default Chart of Account
        budgetAnalytics: item.budgetAnalytics || 'Project 1',
        qty: Number(item.qty) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        total: Number(item.total) || (Number(item.qty || 1) * Number(item.unitPrice || 0))
      }))
    };

    // Auto-generate balanced double-entry in Journal Entries
    const newJE = {
      id: `JE-00${(journalEntries || []).length + 1}`,
      date: newBill.date,
      journal: 'Purchase',
      ref: `${newBill.id} (${order.contactName})`,
      status: 'Posted',
      lines: [
        { accountCode: '5010', accountName: 'Purchase A/c', partner: order.contactName, debit: totalNum, credit: 0 },
        { accountCode: '2010', accountName: 'Creditor A/c', partner: order.contactName, debit: 0, credit: totalNum },
      ]
    };

    setInvoices((prev) => [newBill, ...(prev || [])]);
    setJournalEntries((prev) => [newJE, ...(prev || [])]);
    setOrders((prev) => (prev || []).map((o) => (o.id === order.id ? { ...o, status: 'Billed' } : o)));

    try {
      await api.convertOrderToBill(order.id);
    } catch (e) {
      console.error('Error converting PO to bill:', e);
    }
    return newBill;
  };

  const createVendorBill = async (billData) => {
    const billCount = (invoices || []).filter(i => i.type === 'Vendor Bill').length;
    const billNum = billData.id || `DB/2026/${String(billCount + 1).padStart(4, '0')}`;
    const totalNum = Number(billData.amount || billData.totalAmount) || 0;

    const newBill = {
      type: 'Vendor Bill',
      orderId: billData.orderId || null,
      contactId: billData.contactId || 'cnt-1',
      contactName: billData.contactName || 'Mr. Rahul',
      reference: billData.reference || `ARC-26-${String(billCount + 1).padStart(3, '0')}`,
      date: billData.date || new Date().toISOString().split('T')[0],
      dueDate: billData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: billData.amountDue === 0 ? 'Paid' : (billData.paidViaCash > 0 || billData.paidViaBank > 0 ? 'Partial' : 'Not Paid'),
      amount: totalNum,
      paidViaCash: Number(billData.paidViaCash) || 0,
      paidViaBank: Number(billData.paidViaBank) || 0,
      amountDue: billData.amountDue !== undefined ? Number(billData.amountDue) : totalNum,
      items: billData.items || [],
      ...billData,
      id: billNum
    };

    // Auto-generate balanced double-entry in Journal Entries
    const newJE = {
      id: `JE-00${(journalEntries || []).length + 1}`,
      date: newBill.date,
      journal: 'Purchase',
      ref: `${newBill.id} (${newBill.contactName})`,
      status: 'Posted',
      lines: [
        { accountCode: '5010', accountName: 'Purchase A/c', partner: newBill.contactName, debit: totalNum, credit: 0 },
        { accountCode: '2010', accountName: 'Creditor A/c', partner: newBill.contactName, debit: 0, credit: totalNum },
      ]
    };

    setInvoices((prev) => [newBill, ...(prev || [])]);
    setJournalEntries((prev) => [newJE, ...(prev || [])]);
    return newBill;
  };

  const registerBillPayment = async (billId, paymentData) => {
    const { amount, paymentVia = 'Cash', partner, date, memo } = paymentData;
    const payNum = Number(amount) || 0;

    setInvoices((prev) =>
      (prev || []).map((bill) => {
        if (bill.id === billId) {
          const isCash = paymentVia.toLowerCase().includes('cash');
          const newPaidCash = isCash ? (Number(bill.paidViaCash || 0) + payNum) : Number(bill.paidViaCash || 0);
          const newPaidBank = !isCash ? (Number(bill.paidViaBank || 0) + payNum) : Number(bill.paidViaBank || 0);
          const totalPaid = newPaidCash + newPaidBank;
          const newDue = Math.max(0, Number(bill.amount) - totalPaid);
          const newStatus = newDue === 0 ? 'Paid' : (totalPaid > 0 ? 'Partial' : 'Not Paid');

          return {
            ...bill,
            paidViaCash: newPaidCash,
            paidViaBank: newPaidBank,
            paidAmount: totalPaid,
            amountDue: newDue,
            status: newStatus
          };
        }
        return bill;
      })
    );

    // Create Payment Journal Entry
    const isCash = paymentVia.toLowerCase().includes('cash');
    const paymentJE = {
      id: `JE-00${(journalEntries || []).length + 1}`,
      date: date || new Date().toISOString().split('T')[0],
      journal: isCash ? 'Cash Receipts & Payments' : 'Bank Operations Journal',
      ref: memo || `Payment for ${billId} (${partner || 'Vendor'})`,
      status: 'Posted',
      lines: [
        { accountCode: '2010', accountName: 'Creditor A/c', partner: partner || 'Vendor', debit: payNum, credit: 0 },
        { accountCode: isCash ? '1010' : '1020', accountName: isCash ? 'Cash A/c' : 'Bank A/c', partner: partner || 'Vendor', debit: 0, credit: payNum },
      ]
    };

    setJournalEntries((prev) => [paymentJE, ...(prev || [])]);

    try {
      await api.payInvoice(billId, { paymentMethod: paymentVia, amount: payNum });
    } catch (e) {
      console.error('Error registering bill payment:', e);
    }
  };

  const createSalesOrder = async (soData) => {
    const soCount = (orders || []).filter(o => o.type === 'Sale' || o.type === 'Sales' || o.type === 'SO').length;
    const soNumber = soData.id || `SO${String(soCount + 1).padStart(4, '0')}`;
    const newSO = {
      type: 'Sale',
      contactId: soData.contactId || 'cnt-2',
      contactName: soData.contactName || 'Mr. Rahul',
      date: soData.date || new Date().toISOString().split('T')[0],
      status: soData.status || 'Draft',
      items: soData.items || [],
      totalAmount: Number(soData.totalAmount) || 0,
      ...soData,
      id: soNumber,
    };

    setOrders((prev) => [newSO, ...(prev || [])]);
    try {
      await api.createOrder({ ...newSO, type: 'Sale' });
    } catch (e) {
      console.error('Error creating Sales Order:', e);
    }
    return newSO;
  };

  const convertSOToInvoice = async (order) => {
    if (!order) return null;
    const invCount = (invoices || []).filter(i => i.type === 'Customer Invoice' || i.id?.startsWith('INV/')).length;
    const invNum = `INV/2026/${String(invCount + 1).padStart(4, '0')}`;
    const totalNum = Number(order.totalAmount) || 0;

    const newInv = {
      id: invNum,
      type: 'Customer Invoice',
      orderId: order.id, // e.g. SO0001 (origin SO)
      contactId: order.contactId || 'cnt-2',
      contactName: order.contactName || 'Mr. Rahul',
      reference: `ARC-26-${String(invCount + 1).padStart(3, '0')}`,
      date: order.date || new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Not Paid', // 'Paid' | 'Partial' | 'Not Paid'
      amount: totalNum,
      paidViaCash: 0,
      paidViaBank: 0,
      amountDue: totalNum,
      items: (order.items || []).map((item, idx) => ({
        srNo: idx + 1,
        product: item.productName || item.product || 'Table',
        chartOfAccount: 'Sales', // Default Chart of Account for Customer Invoices
        budgetAnalytics: item.budgetAnalytics || 'Project 1',
        qty: Number(item.qty) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        total: Number(item.total) || (Number(item.qty || 1) * Number(item.unitPrice || 0))
      }))
    };

    // Auto-generate balanced double-entry in Journal Entries:
    // Debit: Debtor A/c (Accounts Receivable) = Total
    // Credit: Sales A/c (Sales Income) = Total
    const newJE = {
      id: `JE-00${(journalEntries || []).length + 1}`,
      date: newInv.date,
      journal: 'Customer Sales Journal',
      ref: `${newInv.id} (${order.contactName || 'Customer'})`,
      status: 'Posted',
      lines: [
        { accountCode: '1100', accountName: 'Debtor A/c', partner: order.contactName || 'Customer', debit: totalNum, credit: 0 },
        { accountCode: '4010', accountName: 'Sales A/c', partner: order.contactName || 'Customer', debit: 0, credit: totalNum },
      ]
    };

    setInvoices((prev) => [newInv, ...(prev || [])]);
    setJournalEntries((prev) => [newJE, ...(prev || [])]);
    setOrders((prev) => (prev || []).map((o) => (o.id === order.id ? { ...o, status: 'Invoiced' } : o)));

    try {
      await api.convertOrderToInvoice(order.id);
    } catch (e) {
      console.error('Error converting SO to invoice:', e);
    }
    return newInv;
  };

  const createCustomerInvoice = async (invData) => {
    const invCount = (invoices || []).filter(i => i.type === 'Customer Invoice' || i.id?.startsWith('INV/')).length;
    const invNum = invData.id || `INV/2026/${String(invCount + 1).padStart(4, '0')}`;
    const totalNum = Number(invData.amount || invData.totalAmount) || 0;

    const newInv = {
      type: 'Customer Invoice',
      orderId: invData.orderId || null,
      contactId: invData.contactId || 'cnt-2',
      contactName: invData.contactName || 'Mr. Rahul',
      reference: invData.reference || `ARC-26-${String(invCount + 1).padStart(3, '0')}`,
      date: invData.date || new Date().toISOString().split('T')[0],
      dueDate: invData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: invData.amountDue === 0 ? 'Paid' : (invData.paidViaCash > 0 || invData.paidViaBank > 0 ? 'Partial' : 'Not Paid'),
      amount: totalNum,
      paidViaCash: Number(invData.paidViaCash) || 0,
      paidViaBank: Number(invData.paidViaBank) || 0,
      amountDue: invData.amountDue !== undefined ? Number(invData.amountDue) : totalNum,
      items: invData.items || [],
      ...invData,
      id: invNum
    };

    // Auto-generate balanced double-entry in Journal Entries
    const newJE = {
      id: `JE-00${(journalEntries || []).length + 1}`,
      date: newInv.date,
      journal: 'Customer Sales Journal',
      ref: `${newInv.id} (${newInv.contactName})`,
      status: 'Posted',
      lines: [
        { accountCode: '1100', accountName: 'Debtor A/c', partner: newInv.contactName, debit: totalNum, credit: 0 },
        { accountCode: '4010', accountName: 'Sales A/c', partner: newInv.contactName, debit: 0, credit: totalNum },
      ]
    };

    setInvoices((prev) => [newInv, ...(prev || [])]);
    setJournalEntries((prev) => [newJE, ...(prev || [])]);
    return newInv;
  };

  const registerInvoicePayment = async (invId, paymentData) => {
    const { amount, paymentVia = 'Cash', partner, date, memo } = paymentData;
    const payNum = Number(amount) || 0;

    setInvoices((prev) =>
      (prev || []).map((inv) => {
        if (inv.id === invId) {
          const isCash = paymentVia.toLowerCase().includes('cash');
          const newPaidCash = isCash ? (Number(inv.paidViaCash || 0) + payNum) : Number(inv.paidViaCash || 0);
          const newPaidBank = !isCash ? (Number(inv.paidViaBank || 0) + payNum) : Number(inv.paidViaBank || 0);
          const totalPaid = newPaidCash + newPaidBank;
          const newDue = Math.max(0, Number(inv.amount) - totalPaid);
          const newStatus = newDue === 0 ? 'Paid' : (totalPaid > 0 ? 'Partial' : 'Not Paid');

          return {
            ...inv,
            paidViaCash: newPaidCash,
            paidViaBank: newPaidBank,
            paidAmount: totalPaid,
            amountDue: newDue,
            status: newStatus
          };
        }
        return inv;
      })
    );

    // Create Payment Journal Entry:
    // Debit: Cash A/c (1010) or Bank A/c (1020) = Paid Amount
    // Credit: Debtor A/c (1100) = Paid Amount
    const isCash = paymentVia.toLowerCase().includes('cash');
    const paymentJE = {
      id: `JE-00${(journalEntries || []).length + 1}`,
      date: date || new Date().toISOString().split('T')[0],
      journal: isCash ? 'Cash Receipts & Payments' : 'Bank Operations Journal',
      ref: memo || `Receipt for ${invId} (${partner || 'Customer'})`,
      status: 'Posted',
      lines: [
        { accountCode: isCash ? '1010' : '1020', accountName: isCash ? 'Cash A/c' : 'Bank A/c', partner: partner || 'Customer', debit: payNum, credit: 0 },
        { accountCode: '1100', accountName: 'Debtor A/c', partner: partner || 'Customer', debit: 0, credit: payNum },
      ]
    };

    setJournalEntries((prev) => [paymentJE, ...(prev || [])]);

    try {
      await api.payInvoice(invId, { paymentMethod: paymentVia, amount: payNum });
    } catch (e) {
      console.error('Error registering invoice payment:', e);
    }
  };

  const payInvoice = async (invoiceId, paymentMethod = 'HDFC Bank') => {
    const target = (invoices || []).find((i) => i.id === invoiceId);
    if (!target) return;

    const isCustomer = target.type === 'Customer Invoice';
    const amountNum = Number(target.amount) || 0;

    const newJE = {
      id: `JE-00${(journalEntries || []).length + 1}`,
      date: new Date().toISOString().split('T')[0],
      journal: paymentMethod.includes('Cash') ? 'Cash Receipts & Payments' : 'Bank Operations Journal',
      ref: `Payment for ${target.id} (${target.contactName})`,
      status: 'Posted',
      lines: isCustomer
        ? [
            { accountCode: paymentMethod.includes('Cash') ? '1010' : '1020', accountName: paymentMethod, debit: amountNum, credit: 0 },
            { accountCode: '1100', accountName: 'Accounts Receivable (Debtors)', debit: 0, credit: amountNum },
          ]
        : [
            { accountCode: '2010', accountName: 'Accounts Payable (Creditors)', debit: amountNum, credit: 0 },
            { accountCode: paymentMethod.includes('Cash') ? '1010' : '1020', accountName: paymentMethod, debit: 0, credit: amountNum },
          ]
    };

    setInvoices((prev) =>
      (prev || []).map((i) =>
        i.id === invoiceId ? { ...i, status: 'Paid', paidAmount: i.amount, paymentMethod } : i
      )
    );
    setJournalEntries((prev) => [newJE, ...(prev || [])]);

    try {
      await api.payInvoice(invoiceId, { paymentMethod, amount: target.amount });
    } catch (e) {
      console.error('Error paying invoice on backend:', e);
    }
  };

  const createAccount = async (accData) => {
    const optimisticObj = {
      id: accData.code || `acc-${Date.now()}`,
      balance: 0,
      ...accData,
    };
    setChartOfAccounts((prev) => [...(prev || []), optimisticObj]);
    try {
      const res = await api.createAccount(accData);
      if (res && res.data) {
        setChartOfAccounts((prev) => (prev || []).map((a) => (a.id === optimisticObj.id ? res.data : a)));
      }
    } catch (e) {
      console.error('Error creating account:', e);
    }
  };

  const toggleArchiveAccount = async (id, isArchived) => {
    setChartOfAccounts((prev) =>
      (prev || []).map((acc) =>
        acc.id === id || acc.code === id
          ? { ...acc, isActive: isArchived, isArchived: !isArchived }
          : acc
      )
    );
    try {
      await api.toggleArchiveAccount(id, isArchived);
    } catch (e) {
      console.error('Error toggling account archive status:', e);
    }
  };

  const createJournal = async (journalData) => {
    const optimisticObj = {
      id: `jrn-${Date.now()}`,
      isActive: true,
      ...journalData,
    };
    setJournals((prev) => [...(prev || []), optimisticObj]);
    try {
      const res = await api.createJournal(journalData);
      if (res && res.data) {
        setJournals((prev) => (prev || []).map((j) => (j.id === optimisticObj.id ? res.data : j)));
      }
    } catch (e) {
      console.error('Error creating journal:', e);
    }
  };

  const updateJournal = async (id, journalData) => {
    setJournals((prev) =>
      (prev || []).map((j) => (j.id === id ? { ...j, ...journalData } : j))
    );
    try {
      await api.updateJournal(id, journalData);
    } catch (e) {
      console.error('Error updating journal:', e);
    }
  };

  const createJournalEntry = async (entryData) => {
    const optimisticObj = {
      id: entryData.entryNumber || `JE-${Date.now()}`,
      number: entryData.entryNumber || `JE-${Date.now()}`,
      date: entryData.date || new Date().toISOString().split('T')[0],
      displayDate: new Date(entryData.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      journal: entryData.journal || 'General Journal',
      partner: entryData.partner || '-',
      total: (entryData.lines || []).reduce((s, l) => s + (Number(l.debit) || 0), 0),
      status: entryData.status === 'draft' ? 'Draft' : 'Posted',
      lines: entryData.lines || [],
    };
    setJournalEntries((prev) => [optimisticObj, ...(prev || [])]);
    try {
      const res = await api.createJournalEntry(entryData);
      if (res && res.data) {
        setJournalEntries((prev) => (prev || []).map((je) => (je.id === optimisticObj.id ? res.data : je)));
      }
    } catch (e) {
      console.error('Error creating journal entry:', e);
    }
  };

  const createBudget = async (bgtData) => {
    const optimisticObj = {
      id: `BUD-00${(budgets || []).length + 1}`,
      committedAmount: 0,
      achievedAmount: 0,
      amountToAchieve: 0,
      ...bgtData,
    };
    setBudgets((prev) => [optimisticObj, ...(prev || [])]);
    try {
      const res = await api.createBudget(bgtData);
      if (res && res.data) {
        setBudgets((prev) => (prev || []).map((b) => (b.id === optimisticObj.id ? res.data : b)));
      }
    } catch (e) {
      console.error('Error creating budget:', e);
    }
  };

  const updateBudget = async (id, bgtData) => {
    setBudgets((prev) =>
      (prev || []).map((b) => (b.id === id ? { ...b, ...bgtData } : b))
    );
    try {
      await api.updateBudget(id, bgtData);
    } catch (e) {
      console.error('Error updating budget:', e);
    }
  };

  const reviseBudget = async (id, revisionData = {}) => {
    try {
      const res = await api.reviseBudget(id, revisionData);
      if (res && res.data) {
        // Refresh all budgets to get updated links
        const updatedList = await api.getBudgets();
        if (Array.isArray(updatedList)) setBudgets(updatedList);
        return res.data;
      }
    } catch (e) {
      console.error('Error revising budget:', e);
    }
    return null;
  };

  const createAnalyticAccount = async (anData) => {
    const optimisticObj = {
      id: `ana-${Date.now()}`,
      budgets: [],
      ...anData,
    };
    setAnalyticAccounts((prev) => [...(prev || []), optimisticObj]);
    try {
      const res = await api.createAnalyticAccount(anData);
      if (res && res.data) {
        setAnalyticAccounts((prev) => (prev || []).map((a) => (a.id === optimisticObj.id ? res.data : a)));
      }
    } catch (e) {
      console.error('Error creating analytic account:', e);
    }
  };

  return (
    <AccountingContext.Provider
      value={{
        contacts: contacts || [],
        products: products || [],
        chartOfAccounts: chartOfAccounts || [],
        journals: journals || [],
        orders: orders || [],
        invoices: invoices || [],
        journalEntries: journalEntries || [],
        budgets: budgets || [],
        analyticAccounts: analyticAccounts || [],
        totalRevenue: totalRevenue || 0,
        totalPurchases: totalPurchases || 0,
        netProfit: netProfit || 0,
        totalReceivables: totalReceivables || 0,
        totalPayables: totalPayables || 0,
        totalBankBalance: totalBankBalance || 0,
        totalCashBalance: totalCashBalance || 0,
        loading,
        isBackendConnected,
        refreshData: loadData,
        addContact,
        updateContact,
        deleteContact,
        addProduct,
        updateProduct,
        deleteProduct,
        addOrder,
        convertPOToBill,
        convertSOToInvoice,
        createPurchaseOrder,
        createSalesOrder,
        createVendorBill,
        createCustomerInvoice,
        registerBillPayment,
        registerInvoicePayment,
        payInvoice,
        createAccount,
        toggleArchiveAccount,
        createJournal,
        updateJournal,
        createJournalEntry,
        createBudget,
        updateBudget,
        reviseBudget,
        createAnalyticAccount,
      }}
    >
      {children}
    </AccountingContext.Provider>
  );
}

export const useAccounting = () => useContext(AccountingContext);
