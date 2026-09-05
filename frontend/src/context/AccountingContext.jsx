import { createContext, useContext, useState, useMemo } from 'react';
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
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [chartOfAccounts, setChartOfAccounts] = useState(INITIAL_CHART_OF_ACCOUNTS);
  const [journals, setJournals] = useState(INITIAL_JOURNALS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [journalEntries, setJournalEntries] = useState(INITIAL_JOURNAL_ENTRIES);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [analyticAccounts, setAnalyticAccounts] = useState(INITIAL_ANALYTIC_ACCOUNTS);

  // Financial Metrics
  const totalRevenue = useMemo(() => {
    return invoices
      .filter((inv) => inv.type === 'Customer Invoice')
      .reduce((sum, inv) => sum + inv.amount, 0);
  }, [invoices]);

  const totalPurchases = useMemo(() => {
    return invoices
      .filter((inv) => inv.type === 'Vendor Bill')
      .reduce((sum, inv) => sum + inv.amount, 0);
  }, [invoices]);

  const netProfit = totalRevenue - totalPurchases;

  const totalReceivables = useMemo(() => {
    return invoices
      .filter((inv) => inv.type === 'Customer Invoice' && inv.status !== 'Paid')
      .reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);
  }, [invoices]);

  const totalPayables = useMemo(() => {
    return invoices
      .filter((inv) => inv.type === 'Vendor Bill' && inv.status !== 'Paid')
      .reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);
  }, [invoices]);

  const totalBankBalance = useMemo(() => {
    const bankAcc = chartOfAccounts.find((acc) => acc.id === '1020');
    return bankAcc ? bankAcc.balance : 145000;
  }, [chartOfAccounts]);

  const totalCashBalance = useMemo(() => {
    const cashAcc = chartOfAccounts.find((acc) => acc.id === '1010');
    return cashAcc ? cashAcc.balance : 25000;
  }, [chartOfAccounts]);

  // Master Data CRUD Actions
  const addContact = (newContact) => {
    const contactObj = {
      id: `cnt-${contacts.length + 1}`,
      status: 'Active',
      totalBilled: 0,
      totalPaid: 0,
      dueAmount: 0,
      ...newContact,
    };
    setContacts((prev) => [contactObj, ...prev]);
  };

  const addProduct = (newProduct) => {
    const productObj = {
      id: `prod-${products.length + 1}`,
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      ...newProduct,
    };
    setProducts((prev) => [productObj, ...prev]);
  };

  const addOrder = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  // Convert Purchase Order to Vendor Bill + Auto Double-Entry
  const convertPOToBill = (order) => {
    const newBill = {
      id: `BILL-00${invoices.length + 1}`,
      type: 'Vendor Bill',
      orderId: order.id,
      contactId: order.contactId,
      contactName: order.contactName,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Unpaid',
      amount: order.totalAmount,
      paidAmount: 0,
      paymentMethod: '',
    };

    const newJE = {
      id: `JE-00${journalEntries.length + 1}`,
      date: newBill.date,
      journal: 'Purchase Journal',
      ref: `${newBill.id} (${order.contactName})`,
      status: 'Posted',
      lines: [
        { accountCode: '5010', accountName: 'Raw Materials & Purchase Expense', debit: order.totalAmount, credit: 0 },
        { accountCode: '2010', accountName: 'Accounts Payable (Creditors)', debit: 0, credit: order.totalAmount },
      ]
    };

    setInvoices((prev) => [newBill, ...prev]);
    setJournalEntries((prev) => [newJE, ...prev]);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: 'Billed' } : o)));
  };

  // Convert Sales Order to Customer Invoice + Auto Double-Entry
  const convertSOToInvoice = (order) => {
    const newInv = {
      id: `INV-00${invoices.length + 1}`,
      type: 'Customer Invoice',
      orderId: order.id,
      contactId: order.contactId,
      contactName: order.contactName,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Unpaid',
      amount: order.totalAmount,
      paidAmount: 0,
      paymentMethod: '',
    };

    const newJE = {
      id: `JE-00${journalEntries.length + 1}`,
      date: newInv.date,
      journal: 'Sales Journal',
      ref: `${newInv.id} (${order.contactName})`,
      status: 'Posted',
      lines: [
        { accountCode: '1100', accountName: 'Accounts Receivable (Debtors)', debit: order.totalAmount, credit: 0 },
        { accountCode: '4010', accountName: 'Furniture Sales Income', debit: 0, credit: order.totalAmount },
      ]
    };

    setInvoices((prev) => [newInv, ...prev]);
    setJournalEntries((prev) => [newJE, ...prev]);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: 'Invoiced' } : o)));
  };

  // Pay Invoice / Bill + Auto Double-Entry
  const payInvoice = (invoiceId, paymentMethod = 'HDFC Bank') => {
    const target = invoices.find((i) => i.id === invoiceId);
    if (!target) return;

    const isCustomer = target.type === 'Customer Invoice';

    const newJE = {
      id: `JE-00${journalEntries.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      journal: paymentMethod.includes('Cash') ? 'Cash Journal' : 'Bank Journal',
      ref: `Payment for ${target.id} (${target.contactName})`,
      status: 'Posted',
      lines: isCustomer
        ? [
            { accountCode: paymentMethod.includes('Cash') ? '1010' : '1020', accountName: paymentMethod, debit: target.amount, credit: 0 },
            { accountCode: '1100', accountName: 'Accounts Receivable (Debtors)', debit: 0, credit: target.amount },
          ]
        : [
            { accountCode: '2010', accountName: 'Accounts Payable (Creditors)', debit: target.amount, credit: 0 },
            { accountCode: paymentMethod.includes('Cash') ? '1010' : '1020', accountName: paymentMethod, debit: 0, credit: target.amount },
          ]
    };

    setInvoices((prev) =>
      prev.map((i) =>
        i.id === invoiceId ? { ...i, status: 'Paid', paidAmount: i.amount, paymentMethod } : i
      )
    );
    setJournalEntries((prev) => [newJE, ...prev]);
  };

  return (
    <AccountingContext.Provider
      value={{
        contacts,
        products,
        chartOfAccounts,
        journals,
        orders,
        invoices,
        journalEntries,
        budgets,
        analyticAccounts,
        totalRevenue,
        totalPurchases,
        netProfit,
        totalReceivables,
        totalPayables,
        totalBankBalance,
        totalCashBalance,
        addContact,
        addProduct,
        addOrder,
        convertPOToBill,
        convertSOToInvoice,
        payInvoice,
      }}
    >
      {children}
    </AccountingContext.Provider>
  );
}

export const useAccounting = () => useContext(AccountingContext);
