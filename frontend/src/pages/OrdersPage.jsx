import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAccounting } from '../context/AccountingContext';
import {
  ShoppingCart,
  Plus,
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Receipt,
  ExternalLink,
  Trash2,
  Printer,
  Send,
  Sparkles,
  PieChart,
  Layers,
  ArrowRight,
  BookOpen,
  ChevronRight,
  CreditCard,
  Building2,
  Wallet
} from 'lucide-react';
import Modal from '../components/Modal';
import { openRazorpayCheckout } from '../services/razorpay';

export default function OrdersPage() {
  const { theme } = useTheme();
  const {
    orders,
    invoices,
    products,
    contacts,
    chartOfAccounts,
    analyticAccounts,
    budgets,
    journalEntries,
    createPurchaseOrder,
    createSalesOrder,
    convertPOToBill,
    convertSOToInvoice,
    createVendorBill,
    createCustomerInvoice,
    registerBillPayment,
    registerInvoicePayment,
    payInvoice,
    refreshData
  } = useAccounting();
  const navigate = useNavigate();

  // Active top-level tab: 'po' | 'bills' | 'so' | 'invoices'
  const [activeTab, setActiveTab] = useState('po');
  // Sub-view mode for PO: 'list' | 'form'
  const [poViewMode, setPoViewMode] = useState('list');
  // Sub-view mode for Vendor Bills: 'list' | 'form'
  const [billViewMode, setBillViewMode] = useState('list');
  // Sub-view mode for Sales Orders: 'list' | 'form'
  const [soViewMode, setSoViewMode] = useState('list');
  // Sub-view mode for Customer Invoices: 'list' | 'form'
  const [invoiceViewMode, setInvoiceViewMode] = useState('list');

  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  // ─── Modal States ───
  const [paymentModalData, setPaymentModalData] = useState(null); // Bill Payment Modal
  const [linkedJEModalData, setLinkedJEModalData] = useState(null); // Linked Journal Entry Modal (Bill)
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);

  // Customer Invoice Modals
  const [customerPaymentModalData, setCustomerPaymentModalData] = useState(null); // Customer Invoice Payment Modal
  const [linkedCustomerInvoiceJEModalData, setLinkedCustomerInvoiceJEModalData] = useState(null); // Customer Invoice JE Modal
  const [isCustomerPrintMenuOpen, setIsCustomerPrintMenuOpen] = useState(false);

  // ─── 1. Purchase Order Form State ───
  const [selectedPOId, setSelectedPOId] = useState(null);
  const [poFormData, setPoFormData] = useState({
    id: 'PO0001',
    vendorName: 'Mr. Rahul',
    contactId: 'cnt-1',
    status: 'Draft', // 'Draft' | 'Confirmed' | 'Billed' | 'Cancelled'
    date: new Date().toISOString().split('T')[0],
    items: [
      {
        id: 'po-item-1',
        srNo: 1,
        product: 'Table',
        budgetAnalytics: 'Project 1',
        qty: 3,
        unitPrice: 2000,
        total: 6000
      }
    ]
  });

  // ─── 2. Vendor Bill Form State ───
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [billFormData, setBillFormData] = useState({
    id: 'DB/2026/0001',
    orderId: 'PO0001', // Link to origin PO
    vendorName: 'Mr. Rahul',
    contactId: 'cnt-1',
    reference: 'ARC-26-001',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Not Paid', // 'Paid' | 'Partial' | 'Not Paid'
    amount: 6000,
    paidViaCash: 0,
    paidViaBank: 0,
    amountDue: 6000,
    items: [
      {
        id: 'bill-item-1',
        srNo: 1,
        product: 'Table',
        chartOfAccount: 'Purchase',
        budgetAnalytics: 'Project 1',
        qty: 3,
        unitPrice: 2000,
        total: 6000
      }
    ]
  });

  // ─── 3. Sales Order Form State (Matches Left Screen in Diagram) ───
  const [selectedSOId, setSelectedSOId] = useState(null);
  const [soFormData, setSoFormData] = useState({
    id: 'SO0001',
    customerName: 'Mr. Rahul',
    contactId: 'cnt-2',
    status: 'Draft', // 'Draft' | 'Confirmed' | 'Invoiced' | 'Cancelled'
    date: new Date().toISOString().split('T')[0],
    items: [
      {
        id: 'so-item-1',
        srNo: 1,
        product: 'Table',
        budgetAnalytics: 'Project 1',
        qty: 3,
        unitPrice: 2000,
        total: 6000
      }
    ]
  });

  // ─── 4. Customer Invoice Form State (Matches Middle Screen in Diagram) ───
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [invoiceFormData, setInvoiceFormData] = useState({
    id: 'INV/2026/0001',
    orderId: 'SO0001', // Origin SO number (or null if created fresh)
    customerName: 'Mr. Rahul',
    contactId: 'cnt-2',
    reference: 'ARC-26-001',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Not Paid', // 'Paid' | 'Partial' | 'Not Paid'
    amount: 6000,
    paidViaCash: 0,
    paidViaBank: 0,
    amountDue: 6000,
    items: [
      {
        id: 'inv-item-1',
        srNo: 1,
        product: 'Table',
        chartOfAccount: 'Sales', // Default Chart of Account for Customer Invoices
        budgetAnalytics: 'Project 1',
        qty: 3,
        unitPrice: 2000,
        total: 6000
      }
    ]
  });

  const showToast = (text) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 3500);
  };

  // Compute PO Total Amount
  const poTotalAmount = useMemo(() => {
    return (poFormData.items || []).reduce((sum, it) => sum + (Number(it.total) || 0), 0);
  }, [poFormData.items]);

  // Compute Bill Total Amount
  const billTotalAmount = useMemo(() => {
    return (billFormData.items || []).reduce((sum, it) => sum + (Number(it.total) || 0), 0);
  }, [billFormData.items]);

  // Compute SO Total Amount
  const soTotalAmount = useMemo(() => {
    return (soFormData.items || []).reduce((sum, it) => sum + (Number(it.total) || 0), 0);
  }, [soFormData.items]);

  // Compute Customer Invoice Total Amount
  const invoiceTotalAmount = useMemo(() => {
    return (invoiceFormData.items || []).reduce((sum, it) => sum + (Number(it.total) || 0), 0);
  }, [invoiceFormData.items]);

  // Check Non-Blocking Warning: Exceeds Approved Budget
  const poExceedsBudget = useMemo(() => {
    return poTotalAmount > 150000;
  }, [poTotalAmount]);

  const billExceedsBudget = useMemo(() => {
    return billTotalAmount > 150000;
  }, [billTotalAmount]);

  // ═══════════════════════════════════════════════════════════════════
  // 1. PURCHASE ORDER HANDLERS
  // ═══════════════════════════════════════════════════════════════════
  const handlePOLineChange = (index, field, value) => {
    const updated = [...poFormData.items];
    const current = { ...updated[index], [field]: value };

    if (field === 'qty' || field === 'unitPrice') {
      const q = Number(field === 'qty' ? value : current.qty) || 0;
      const p = Number(field === 'unitPrice' ? value : current.unitPrice) || 0;
      current.total = q * p;
    }

    if (field === 'product') {
      const prod = products.find((p) => p.name === value);
      if (prod) {
        current.unitPrice = prod.costPrice || prod.salesPrice || current.unitPrice;
        current.total = (Number(current.qty) || 1) * current.unitPrice;
      }
    }

    updated[index] = current;
    setPoFormData({ ...poFormData, items: updated });
  };

  const handleAddPOLine = () => {
    const newLine = {
      id: `po-item-${Date.now()}`,
      srNo: poFormData.items.length + 1,
      product: products?.[0]?.name || 'Table',
      budgetAnalytics: analyticAccounts?.[0]?.name || 'Project 1',
      qty: 1,
      unitPrice: 2000,
      total: 2000
    };
    setPoFormData({ ...poFormData, items: [...poFormData.items, newLine] });
  };

  const handleRemovePOLine = (index) => {
    if (poFormData.items.length <= 1) {
      showToast('A Purchase Order must have at least one line item.');
      return;
    }
    const updated = poFormData.items.filter((_, idx) => idx !== index).map((item, i) => ({ ...item, srNo: i + 1 }));
    setPoFormData({ ...poFormData, items: updated });
  };

  const handleOpenPOForm = (po) => {
    if (po) {
      setSelectedPOId(po.id);
      setPoFormData({
        id: po.id,
        vendorName: po.contactName || 'Mr. Rahul',
        contactId: po.contactId || 'cnt-1',
        status: po.status || 'Draft',
        date: po.date || new Date().toISOString().split('T')[0],
        items: (po.items && po.items.length > 0)
          ? po.items.map((it, idx) => ({
              id: it.id || `po-it-${idx}`,
              srNo: idx + 1,
              product: it.productName || it.product || 'Table',
              budgetAnalytics: it.budgetAnalytics || 'Project 1',
              qty: Number(it.qty) || 1,
              unitPrice: Number(it.unitPrice) || 2000,
              total: Number(it.total) || (Number(it.qty || 1) * Number(it.unitPrice || 2000))
            }))
          : [
              {
                id: 'po-item-1',
                srNo: 1,
                product: 'Table',
                budgetAnalytics: 'Project 1',
                qty: 3,
                unitPrice: 2000,
                total: 6000
              }
            ]
      });
    } else {
      const poCount = (orders || []).filter((o) => o.type === 'Purchase' || o.type === 'PO').length;
      const nextPONum = `PO${String(poCount + 1).padStart(4, '0')}`;

      setSelectedPOId(null);
      setPoFormData({
        id: nextPONum,
        vendorName: contacts?.[0]?.name || 'Mr. Rahul',
        contactId: contacts?.[0]?.id || 'cnt-1',
        status: 'Draft',
        date: new Date().toISOString().split('T')[0],
        items: [
          {
            id: 'po-item-1',
            srNo: 1,
            product: 'Table',
            budgetAnalytics: 'Project 1',
            qty: 3,
            unitPrice: 2000,
            total: 6000
          }
        ]
      });
    }
    setPoViewMode('form');
  };

  const handleConfirmPO = async () => {
    const updated = {
      ...poFormData,
      status: 'Confirmed',
      totalAmount: poTotalAmount
    };
    await createPurchaseOrder(updated);
    setPoFormData(updated);
    showToast(`Purchase Order ${poFormData.id} confirmed successfully!`);
    refreshData();
  };

  const handleCreateBillFromPO = async () => {
    const bill = await convertPOToBill({
      ...poFormData,
      totalAmount: poTotalAmount
    });

    if (bill) {
      showToast(`Vendor Bill ${bill.id} created from ${poFormData.id}!`);
      setPoFormData((prev) => ({ ...prev, status: 'Billed' }));
      handleOpenBillForm(bill);
      setActiveTab('bills');
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // 2. VENDOR BILL HANDLERS
  // ═══════════════════════════════════════════════════════════════════
  const handleBillLineChange = (index, field, value) => {
    const updated = [...billFormData.items];
    const current = { ...updated[index], [field]: value };

    if (field === 'qty' || field === 'unitPrice') {
      const q = Number(field === 'qty' ? value : current.qty) || 0;
      const p = Number(field === 'unitPrice' ? value : current.unitPrice) || 0;
      current.total = q * p;
    }

    updated[index] = current;
    const newTotal = updated.reduce((s, it) => s + (Number(it.total) || 0), 0);
    const paid = (Number(billFormData.paidViaCash) || 0) + (Number(billFormData.paidViaBank) || 0);
    const due = Math.max(0, newTotal - paid);

    setBillFormData({
      ...billFormData,
      items: updated,
      amount: newTotal,
      amountDue: due,
      status: due === 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Not Paid')
    });
  };

  const handleAddBillLine = () => {
    const newLine = {
      id: `bill-item-${Date.now()}`,
      srNo: billFormData.items.length + 1,
      product: products?.[0]?.name || 'Table',
      chartOfAccount: 'Purchase',
      budgetAnalytics: analyticAccounts?.[0]?.name || 'Project 1',
      qty: 1,
      unitPrice: 2000,
      total: 2000
    };
    const updated = [...billFormData.items, newLine];
    const newTotal = updated.reduce((s, it) => s + (Number(it.total) || 0), 0);
    const paid = (Number(billFormData.paidViaCash) || 0) + (Number(billFormData.paidViaBank) || 0);
    const due = Math.max(0, newTotal - paid);

    setBillFormData({
      ...billFormData,
      items: updated,
      amount: newTotal,
      amountDue: due
    });
  };

  const handleRemoveBillLine = (index) => {
    if (billFormData.items.length <= 1) {
      showToast('A Vendor Bill must have at least one line item.');
      return;
    }
    const updated = billFormData.items.filter((_, idx) => idx !== index).map((item, i) => ({ ...item, srNo: i + 1 }));
    const newTotal = updated.reduce((s, it) => s + (Number(it.total) || 0), 0);
    const paid = (Number(billFormData.paidViaCash) || 0) + (Number(billFormData.paidViaBank) || 0);
    const due = Math.max(0, newTotal - paid);

    setBillFormData({
      ...billFormData,
      items: updated,
      amount: newTotal,
      amountDue: due
    });
  };

  const handleOpenBillForm = (bill) => {
    if (bill) {
      setSelectedBillId(bill.id);
      const totalNum = Number(bill.amount) || 6000;
      const paidCash = Number(bill.paidViaCash) || (bill.status === 'Paid' ? totalNum : 0);
      const paidBank = Number(bill.paidViaBank) || 0;
      const due = bill.amountDue !== undefined ? Number(bill.amountDue) : Math.max(0, totalNum - (paidCash + paidBank));

      setBillFormData({
        id: bill.id,
        orderId: bill.orderId || null,
        vendorName: bill.contactName || 'Mr. Rahul',
        contactId: bill.contactId || 'cnt-1',
        reference: bill.reference || 'ARC-26-001',
        date: bill.date || new Date().toISOString().split('T')[0],
        dueDate: bill.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: due === 0 ? 'Paid' : (paidCash > 0 || paidBank > 0 ? 'Partial' : 'Not Paid'),
        amount: totalNum,
        paidViaCash: paidCash,
        paidViaBank: paidBank,
        amountDue: due,
        items: (bill.items && bill.items.length > 0)
          ? bill.items.map((it, idx) => ({
              id: it.id || `bill-it-${idx}`,
              srNo: idx + 1,
              product: it.product || it.productName || 'Table',
              chartOfAccount: it.chartOfAccount || 'Purchase',
              budgetAnalytics: it.budgetAnalytics || 'Project 1',
              qty: Number(it.qty) || 1,
              unitPrice: Number(it.unitPrice) || 2000,
              total: Number(it.total) || (Number(it.qty || 1) * Number(it.unitPrice || 2000))
            }))
          : [
              {
                id: 'bill-item-1',
                srNo: 1,
                product: 'Table',
                chartOfAccount: 'Purchase',
                budgetAnalytics: 'Project 1',
                qty: 3,
                unitPrice: 2000,
                total: 6000
              }
            ]
      });
    } else {
      const billCount = (invoices || []).filter((i) => i.type === 'Vendor Bill').length;
      const nextBillNum = `DB/2026/${String(billCount + 1).padStart(4, '0')}`;

      setSelectedBillId(null);
      setBillFormData({
        id: nextBillNum,
        orderId: null,
        vendorName: contacts?.[0]?.name || 'Mr. Rahul',
        contactId: contacts?.[0]?.id || 'cnt-1',
        reference: `ARC-26-${String(billCount + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Not Paid',
        amount: 6000,
        paidViaCash: 0,
        paidViaBank: 0,
        amountDue: 6000,
        items: [
          {
            id: 'bill-item-1',
            srNo: 1,
            product: 'Table',
            chartOfAccount: 'Purchase',
            budgetAnalytics: 'Project 1',
            qty: 3,
            unitPrice: 2000,
            total: 6000
          }
        ]
      });
    }
    setBillViewMode('form');
  };

  const handleConfirmBill = async () => {
    const updated = {
      ...billFormData,
      amount: billTotalAmount,
      amountDue: Math.max(0, billTotalAmount - (billFormData.paidViaCash + billFormData.paidViaBank))
    };
    await createVendorBill(updated);
    setBillFormData(updated);
    showToast(`Vendor Bill ${billFormData.id} confirmed! Double-Entry Journal auto-created in General Ledger.`);
    refreshData();
  };

  const handleOpenPaymentModal = (bill) => {
    const target = bill || billFormData;
    const due = Number(target.amountDue) || Number(target.amount) || 6000;

    setPaymentModalData({
      billId: target.id,
      paymentType: 'Send',
      partner: target.vendorName || target.contactName || 'Mr. Rahul',
      amount: due,
      date: new Date().toISOString().split('T')[0],
      paymentVia: 'Cash',
      memo: `Payment for ${target.id}`
    });
  };

  const handleConfirmBillPayment = async (e) => {
    e.preventDefault();
    if (!paymentModalData || !paymentModalData.amount) return;

    await registerBillPayment(paymentModalData.billId, paymentModalData);

    const payNum = Number(paymentModalData.amount) || 0;
    const isCash = paymentModalData.paymentVia.toLowerCase().includes('cash');

    setBillFormData((prev) => {
      const newCash = isCash ? (Number(prev.paidViaCash || 0) + payNum) : Number(prev.paidViaCash || 0);
      const newBank = !isCash ? (Number(prev.paidViaBank || 0) + payNum) : Number(prev.paidViaBank || 0);
      const totalPaid = newCash + newBank;
      const newDue = Math.max(0, Number(prev.amount) - totalPaid);

      return {
        ...prev,
        paidViaCash: newCash,
        paidViaBank: newBank,
        amountDue: newDue,
        status: newDue === 0 ? 'Paid' : 'Partial'
      };
    });

    showToast(`Payment of ₹${payNum.toLocaleString()} recorded via ${paymentModalData.paymentVia}!`);
    setPaymentModalData(null);
    refreshData();
  };

  const handleOpenLinkedJE = (bill) => {
    const target = bill || billFormData;
    setLinkedJEModalData({
      billId: target.id,
      date: target.date,
      journal: 'Purchase',
      partner: target.vendorName || target.contactName || 'Mr. Rahul',
      amount: target.amount || 6000,
      lines: [
        {
          account: 'Purchase A/c',
          partner: target.vendorName || target.contactName || 'Mr. Rahul',
          debit: target.amount || 6000,
          credit: 0
        },
        {
          account: 'Creditor A/c',
          partner: target.vendorName || target.contactName || 'Mr. Rahul',
          debit: 0,
          credit: target.amount || 6000
        }
      ]
    });
  };

  // ═══════════════════════════════════════════════════════════════════
  // 3. SALES ORDER HANDLERS (Flowchart Module 1)
  // ═══════════════════════════════════════════════════════════════════
  const handleSOLineChange = (index, field, value) => {
    const updated = [...soFormData.items];
    const current = { ...updated[index], [field]: value };

    if (field === 'qty' || field === 'unitPrice') {
      const q = Number(field === 'qty' ? value : current.qty) || 0;
      const p = Number(field === 'unitPrice' ? value : current.unitPrice) || 0;
      current.total = q * p;
    }

    if (field === 'product') {
      const prod = products.find((p) => p.name === value);
      if (prod) {
        current.unitPrice = prod.salesPrice || prod.costPrice || current.unitPrice;
        current.total = (Number(current.qty) || 1) * current.unitPrice;
      }
    }

    updated[index] = current;
    setSoFormData({ ...soFormData, items: updated });
  };

  const handleAddSOLine = () => {
    const newLine = {
      id: `so-item-${Date.now()}`,
      srNo: soFormData.items.length + 1,
      product: products?.[0]?.name || 'Table',
      budgetAnalytics: analyticAccounts?.[0]?.name || 'Project 1',
      qty: 1,
      unitPrice: 2000,
      total: 2000
    };
    setSoFormData({ ...soFormData, items: [...soFormData.items, newLine] });
  };

  const handleRemoveSOLine = (index) => {
    if (soFormData.items.length <= 1) {
      showToast('A Sales Order must have at least one line item.');
      return;
    }
    const updated = soFormData.items.filter((_, idx) => idx !== index).map((item, i) => ({ ...item, srNo: i + 1 }));
    setSoFormData({ ...soFormData, items: updated });
  };

  const handleOpenSOForm = (so) => {
    if (so) {
      setSelectedSOId(so.id);
      setSoFormData({
        id: so.id,
        customerName: so.contactName || 'Mr. Rahul',
        contactId: so.contactId || 'cnt-2',
        status: so.status || 'Draft',
        date: so.date || new Date().toISOString().split('T')[0],
        items: (so.items && so.items.length > 0)
          ? so.items.map((it, idx) => ({
              id: it.id || `so-it-${idx}`,
              srNo: idx + 1,
              product: it.productName || it.product || 'Table',
              budgetAnalytics: it.budgetAnalytics || 'Project 1',
              qty: Number(it.qty) || 1,
              unitPrice: Number(it.unitPrice) || 2000,
              total: Number(it.total) || (Number(it.qty || 1) * Number(it.unitPrice || 2000))
            }))
          : [
              {
                id: 'so-item-1',
                srNo: 1,
                product: 'Table',
                budgetAnalytics: 'Project 1',
                qty: 3,
                unitPrice: 2000,
                total: 6000
              }
            ]
      });
    } else {
      const soCount = (orders || []).filter((o) => o.type === 'Sale' || o.type === 'Sales' || o.type === 'SO').length;
      const nextSONum = `SO${String(soCount + 1).padStart(4, '0')}`;
      setSelectedSOId(null);
      setSoFormData({
        id: nextSONum,
        customerName: contacts?.find(c => c.type === 'Customer')?.name || 'Mr. Rahul',
        contactId: contacts?.find(c => c.type === 'Customer')?.id || 'cnt-2',
        status: 'Draft',
        date: new Date().toISOString().split('T')[0],
        items: [
          {
            id: 'so-item-1',
            srNo: 1,
            product: 'Table',
            budgetAnalytics: 'Project 1',
            qty: 3,
            unitPrice: 2000,
            total: 6000
          }
        ]
      });
    }
    setSoViewMode('form');
  };

  const handleConfirmSO = async () => {
    const updated = {
      ...soFormData,
      status: 'Confirmed',
      totalAmount: soTotalAmount
    };
    await createSalesOrder(updated);
    setSoFormData(updated);
    showToast(`Sales Order ${soFormData.id} confirmed successfully!`);
    refreshData();
  };

  // Flowchart Action: [Create Invoice] on SO -> generates Customer Invoice and redirects
  const handleCreateInvoiceFromSO = async () => {
    const inv = await convertSOToInvoice({
      ...soFormData,
      totalAmount: soTotalAmount
    });

    if (inv) {
      showToast(`Customer Invoice ${inv.id} created from ${soFormData.id}!`);
      setSoFormData((prev) => ({ ...prev, status: 'Invoiced' }));
      handleOpenCustomerInvoiceForm(inv);
      setActiveTab('invoices');
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // 4. CUSTOMER INVOICE HANDLERS (Flowchart Module 2)
  // ═══════════════════════════════════════════════════════════════════
  const handleCustomerInvoiceLineChange = (index, field, value) => {
    const updated = [...invoiceFormData.items];
    const current = { ...updated[index], [field]: value };

    if (field === 'qty' || field === 'unitPrice') {
      const q = Number(field === 'qty' ? value : current.qty) || 0;
      const p = Number(field === 'unitPrice' ? value : current.unitPrice) || 0;
      current.total = q * p;
    }

    updated[index] = current;
    const newTotal = updated.reduce((s, it) => s + (Number(it.total) || 0), 0);
    const paid = (Number(invoiceFormData.paidViaCash) || 0) + (Number(invoiceFormData.paidViaBank) || 0);
    const due = Math.max(0, newTotal - paid);

    setInvoiceFormData({
      ...invoiceFormData,
      items: updated,
      amount: newTotal,
      amountDue: due,
      status: due === 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Not Paid')
    });
  };

  const handleAddCustomerInvoiceLine = () => {
    const newLine = {
      id: `inv-item-${Date.now()}`,
      srNo: invoiceFormData.items.length + 1,
      product: products?.[0]?.name || 'Table',
      chartOfAccount: 'Sales',
      budgetAnalytics: analyticAccounts?.[0]?.name || 'Project 1',
      qty: 1,
      unitPrice: 2000,
      total: 2000
    };
    const updated = [...invoiceFormData.items, newLine];
    const newTotal = updated.reduce((s, it) => s + (Number(it.total) || 0), 0);
    const paid = (Number(invoiceFormData.paidViaCash) || 0) + (Number(invoiceFormData.paidViaBank) || 0);
    const due = Math.max(0, newTotal - paid);

    setInvoiceFormData({
      ...invoiceFormData,
      items: updated,
      amount: newTotal,
      amountDue: due
    });
  };

  const handleRemoveCustomerInvoiceLine = (index) => {
    if (invoiceFormData.items.length <= 1) {
      showToast('A Customer Invoice must have at least one line item.');
      return;
    }
    const updated = invoiceFormData.items.filter((_, idx) => idx !== index).map((item, i) => ({ ...item, srNo: i + 1 }));
    const newTotal = updated.reduce((s, it) => s + (Number(it.total) || 0), 0);
    const paid = (Number(invoiceFormData.paidViaCash) || 0) + (Number(invoiceFormData.paidViaBank) || 0);
    const due = Math.max(0, newTotal - paid);

    setInvoiceFormData({
      ...invoiceFormData,
      items: updated,
      amount: newTotal,
      amountDue: due
    });
  };

  const handleOpenCustomerInvoiceForm = (inv) => {
    if (inv) {
      setSelectedInvoiceId(inv.id);
      const totalNum = Number(inv.amount) || 6000;
      const paidCash = Number(inv.paidViaCash) || (inv.status === 'Paid' ? totalNum : 0);
      const paidBank = Number(inv.paidViaBank) || 0;
      const due = inv.amountDue !== undefined ? Number(inv.amountDue) : Math.max(0, totalNum - (paidCash + paidBank));

      setInvoiceFormData({
        id: inv.id,
        orderId: inv.orderId || null,
        customerName: inv.contactName || inv.customerName || 'Mr. Rahul',
        contactId: inv.contactId || 'cnt-2',
        reference: inv.reference || 'ARC-26-001',
        date: inv.date || new Date().toISOString().split('T')[0],
        dueDate: inv.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: due === 0 ? 'Paid' : (paidCash > 0 || paidBank > 0 ? 'Partial' : 'Not Paid'),
        amount: totalNum,
        paidViaCash: paidCash,
        paidViaBank: paidBank,
        amountDue: due,
        items: (inv.items && inv.items.length > 0)
          ? inv.items.map((it, idx) => ({
              id: it.id || `inv-it-${idx}`,
              srNo: idx + 1,
              product: it.product || it.productName || 'Table',
              chartOfAccount: it.chartOfAccount || 'Sales',
              budgetAnalytics: it.budgetAnalytics || 'Project 1',
              qty: Number(it.qty) || 1,
              unitPrice: Number(it.unitPrice) || 2000,
              total: Number(it.total) || (Number(it.qty || 1) * Number(it.unitPrice || 2000))
            }))
          : [
              {
                id: 'inv-item-1',
                srNo: 1,
                product: 'Table',
                chartOfAccount: 'Sales',
                budgetAnalytics: 'Project 1',
                qty: 3,
                unitPrice: 2000,
                total: 6000
              }
            ]
      });
    } else {
      const invCount = (invoices || []).filter((i) => i.type === 'Customer Invoice' || i.id?.startsWith('INV/')).length;
      const nextInvNum = `INV/2026/${String(invCount + 1).padStart(4, '0')}`;

      setSelectedInvoiceId(null);
      setInvoiceFormData({
        id: nextInvNum,
        orderId: null,
        customerName: contacts?.find(c => c.type === 'Customer')?.name || 'Mr. Rahul',
        contactId: contacts?.find(c => c.type === 'Customer')?.id || 'cnt-2',
        reference: `ARC-26-${String(invCount + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Not Paid',
        amount: 6000,
        paidViaCash: 0,
        paidViaBank: 0,
        amountDue: 6000,
        items: [
          {
            id: 'inv-item-1',
            srNo: 1,
            product: 'Table',
            chartOfAccount: 'Sales',
            budgetAnalytics: 'Project 1',
            qty: 3,
            unitPrice: 2000,
            total: 6000
          }
        ]
      });
    }
    setInvoiceViewMode('form');
  };

  const handleConfirmCustomerInvoice = async () => {
    const updated = {
      ...invoiceFormData,
      amount: invoiceTotalAmount,
      amountDue: Math.max(0, invoiceTotalAmount - (invoiceFormData.paidViaCash + invoiceFormData.paidViaBank))
    };
    await createCustomerInvoice(updated);
    setInvoiceFormData(updated);
    showToast(`Customer Invoice ${invoiceFormData.id} confirmed! Double-Entry Journal auto-created in General Ledger.`);
    refreshData();
  };

  // Flowchart Action: [Pay] button on Invoice -> Opens Invoice Payment Modal
  const handleOpenCustomerPaymentModal = (inv) => {
    const target = inv || invoiceFormData;
    const due = Number(target.amountDue) || Number(target.amount) || 6000;

    setCustomerPaymentModalData({
      invoiceId: target.id,
      paymentType: 'Receive', // Default: Receive for Customer Invoices
      partner: target.customerName || target.contactName || 'Mr. Rahul',
      amount: due,
      date: new Date().toISOString().split('T')[0],
      paymentVia: 'Razorpay', // 'Razorpay' | 'Cash' | 'HDFC Bank'
      memo: `Settlement for ${target.id}`
    });
  };

  // Flowchart Action: Confirm Payment on Modal
  const handleConfirmCustomerPayment = async (e) => {
    e.preventDefault();
    if (!customerPaymentModalData || !customerPaymentModalData.amount) return;

    const payNum = Number(customerPaymentModalData.amount) || 0;
    const isRazorpay = customerPaymentModalData.paymentVia.toLowerCase().includes('razorpay');

    if (isRazorpay) {
      openRazorpayCheckout({
        amount: payNum,
        invoiceId: customerPaymentModalData.invoiceId,
        customerName: customerPaymentModalData.partner,
        description: `Invoice settlement for ${customerPaymentModalData.invoiceId}`,
        onSuccess: async (res) => {
          const updatedPaymentData = {
            ...customerPaymentModalData,
            paymentVia: 'Razorpay',
            memo: `${customerPaymentModalData.memo || 'Invoice payment'} (Razorpay ID: ${res.razorpay_payment_id})`
          };

          await registerInvoicePayment(customerPaymentModalData.invoiceId, updatedPaymentData);

          setInvoiceFormData((prev) => {
            const newBank = Number(prev.paidViaBank || 0) + payNum;
            const totalPaid = Number(prev.paidViaCash || 0) + newBank;
            const newDue = Math.max(0, Number(prev.amount) - totalPaid);
            return {
              ...prev,
              paidViaBank: newBank,
              amountDue: newDue,
              status: newDue === 0 ? 'Paid' : 'Partial'
            };
          });

          showToast(`Payment of ₹${payNum.toLocaleString()} received via Razorpay (Txn ID: ${res.razorpay_payment_id})!`);
          setCustomerPaymentModalData(null);
          refreshData();
        }
      });
      return;
    }

    await registerInvoicePayment(customerPaymentModalData.invoiceId, customerPaymentModalData);

    const isCash = customerPaymentModalData.paymentVia.toLowerCase().includes('cash');

    setInvoiceFormData((prev) => {
      const newCash = isCash ? (Number(prev.paidViaCash || 0) + payNum) : Number(prev.paidViaCash || 0);
      const newBank = !isCash ? (Number(prev.paidViaBank || 0) + payNum) : Number(prev.paidViaBank || 0);
      const totalPaid = newCash + newBank;
      const newDue = Math.max(0, Number(prev.amount) - totalPaid);

      return {
        ...prev,
        paidViaCash: newCash,
        paidViaBank: newBank,
        amountDue: newDue,
        status: newDue === 0 ? 'Paid' : 'Partial'
      };
    });

    showToast(`Payment of ₹${payNum.toLocaleString()} received via ${customerPaymentModalData.paymentVia}!`);
    setCustomerPaymentModalData(null);
    refreshData();
  };

  // Flowchart Action: Open Journal Entry for Customer Invoice
  const handleOpenLinkedCustomerInvoiceJE = (inv) => {
    const target = inv || invoiceFormData;
    setLinkedCustomerInvoiceJEModalData({
      invoiceId: target.id,
      date: target.date,
      journal: 'Customer Sales Journal',
      partner: target.customerName || target.contactName || 'Mr. Rahul',
      amount: target.amount || 6000,
      lines: [
        {
          account: 'Debtor A/c (Accounts Receivable)',
          partner: target.customerName || target.contactName || 'Mr. Rahul',
          debit: target.amount || 6000,
          credit: 0
        },
        {
          account: 'Sales A/c (Furniture Sales Income)',
          partner: target.customerName || target.contactName || 'Mr. Rahul',
          debit: 0,
          credit: target.amount || 6000
        }
      ]
    });
  };

  // Filter lists
  const purchaseOrdersList = (orders || []).filter(
    (o) => o && (o.type === 'Purchase' || o.type === 'PO')
  );

  const vendorBillsList = (invoices || []).filter(
    (i) => i && (i.type === 'Vendor Bill' || i.id?.startsWith('DB/') || i.id?.startsWith('BILL-'))
  );

  const salesOrdersList = (orders || []).filter(
    (o) => o && (o.type === 'Sales' || o.type === 'Sale' || o.type === 'SO' || o.id?.startsWith('SO'))
  );

  const customerInvoicesList = (invoices || []).filter(
    (i) => i && (i.type === 'Customer Invoice' || i.id?.startsWith('INV/') || i.id?.startsWith('INV-'))
  );

  return (
    <div style={{ color: theme.textMain, maxWidth: '1380px', margin: '0 auto', width: '100%', paddingBottom: '3rem' }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1.2rem',
            backgroundColor: theme.successBg || '#064e3b',
            color: theme.success || '#34d399',
            border: `1px solid ${theme.success || '#059669'}`,
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Top Header & Module Switcher */}
      <div
        style={{
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.borderLight}`,
          borderRadius: '12px',
          padding: '1.2rem 1.6rem',
          boxShadow: theme.shadow,
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: theme.bgSubtle,
              border: `1px solid ${theme.borderLight}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.accentGold,
            }}
          >
            <ShoppingCart size={22} />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.35rem', fontWeight: 600, color: theme.textMain, margin: 0 }}>
              Procurement, Vendor Bills &amp; Settlements
            </h1>
            <p style={{ fontSize: '0.8rem', color: theme.textMuted, margin: '0.15rem 0 0 0' }}>
              Purchase Orders → Vendor Bills → Payments &amp; Auto Double-Entry Journal Generation
            </p>
          </div>
        </div>

        {/* Top Module Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: theme.bgSubtle,
            padding: '4px',
            borderRadius: '8px',
            border: `1px solid ${theme.borderLight}`,
            gap: '4px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('po');
              setPoViewMode('list');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.95rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'po' ? theme.accentGold : 'transparent',
              color: activeTab === 'po' ? '#0E0D0C' : theme.textMuted,
              transition: 'all 0.15s ease',
            }}
          >
            <FileText size={14} />
            <span>Purchase Orders</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('bills');
              setBillViewMode('list');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.95rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'bills' ? theme.accentGold : 'transparent',
              color: activeTab === 'bills' ? '#0E0D0C' : theme.textMuted,
              transition: 'all 0.15s ease',
            }}
          >
            <Receipt size={14} />
            <span>Vendor Bills</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('so');
              setSoViewMode('list');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.95rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'so' ? theme.accentGold : 'transparent',
              color: activeTab === 'so' ? '#0E0D0C' : theme.textMuted,
              transition: 'all 0.15s ease',
            }}
          >
            <ShoppingCart size={14} />
            <span>Sales Orders</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('invoices');
              setInvoiceViewMode('list');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.95rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'invoices' ? theme.accentGold : 'transparent',
              color: activeTab === 'invoices' ? '#0E0D0C' : theme.textMuted,
              transition: 'all 0.15s ease',
            }}
          >
            <DollarSign size={14} />
            <span>Customer Invoices</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MODULE 1: PURCHASE ORDERS (PO LIST & FORM VIEW)
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'po' && (
        <div>
          {/* PO LIST VIEW */}
          {poViewMode === 'list' && (
            <div
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.borderLight}`,
                borderRadius: '12px',
                padding: '1.6rem 2rem',
                boxShadow: theme.shadow,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => handleOpenPOForm(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 1.3rem',
                    borderRadius: '6px',
                    backgroundColor: theme.accentGold,
                    color: '#0E0D0C',
                    border: 'none',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={15} />
                  <span>New Purchase Order</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ position: 'relative', width: '320px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: theme.textDim }} />
                    <input
                      type="text"
                      placeholder="Search Purchase Orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.8rem 0.5rem 2.2rem',
                        borderRadius: '6px',
                        border: `1px solid ${theme.borderLight}`,
                        backgroundColor: theme.bgInput,
                        color: theme.textMain,
                        fontSize: '0.84rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto', border: `1px solid ${theme.borderLight}`, borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}` }}>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>PO No.</th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Vendor Name</th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>PO Date</th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Total Amount</th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrdersList.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: theme.textMuted }}>
                          No Purchase Orders recorded. Click <strong>[New Purchase Order]</strong> to create one.
                        </td>
                      </tr>
                    ) : (
                      purchaseOrdersList.map((po) => (
                        <tr
                          key={po.id}
                          style={{ borderBottom: `1px solid ${theme.borderLight}`, color: theme.textMain, cursor: 'pointer' }}
                          onClick={() => handleOpenPOForm(po)}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${theme.bgSubtle}80`)}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '0.95rem 1.2rem', fontWeight: 700, color: theme.accentGold }}>{po.id}</td>
                          <td style={{ padding: '0.95rem 1.2rem', fontWeight: 600 }}>{po.contactName || 'Mr. Rahul'}</td>
                          <td style={{ padding: '0.95rem 1.2rem', color: theme.textMuted }}>{po.date || '2026-01-01'}</td>
                          <td style={{ padding: '0.95rem 1.2rem', textAlign: 'right', fontWeight: 700 }}>
                            ₹{(Number(po.totalAmount) || 6000).toLocaleString()}
                          </td>
                          <td style={{ padding: '0.95rem 1.2rem', textAlign: 'center' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '0.2rem 0.6rem',
                                borderRadius: '4px',
                                backgroundColor:
                                  po.status === 'Billed'
                                    ? '#10b98120'
                                    : po.status === 'Confirmed'
                                    ? '#3b82f620'
                                    : theme.bgSubtle,
                                color:
                                  po.status === 'Billed'
                                    ? '#34d399'
                                    : po.status === 'Confirmed'
                                    ? '#60a5fa'
                                    : theme.textMuted,
                                border: `1px solid ${theme.borderLight}`,
                              }}
                            >
                              {po.status || 'Draft'}
                            </span>
                          </td>
                          <td style={{ padding: '0.95rem 1.2rem', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPOForm(po);
                              }}
                              style={{
                                padding: '0.35rem 0.8rem',
                                borderRadius: '5px',
                                backgroundColor: theme.bgSubtle,
                                border: `1px solid ${theme.borderLight}`,
                                color: theme.accentGold,
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Open Form
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PO FORM VIEW (Matches Left Screen in Diagram!) */}
          {poViewMode === 'form' && (
            <div
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.borderLight}`,
                borderRadius: '12px',
                padding: '1.8rem 2.2rem',
                boxShadow: theme.shadow,
              }}
            >
              {/* Header Actions: [New] [Confirm] [Create Bill] [Cancel] [Back] */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  paddingBottom: '1.4rem',
                  borderBottom: `1px solid ${theme.borderLight}`,
                  marginBottom: '1.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenPOForm(null)}
                    style={{
                      padding: '0.55rem 1.2rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgSubtle,
                      color: theme.textMain,
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    New
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmPO}
                    style={{
                      padding: '0.55rem 1.3rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: poFormData.status === 'Confirmed' ? '#3b82f6' : theme.accentGold,
                      color: poFormData.status === 'Confirmed' ? '#ffffff' : '#0E0D0C',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Confirm
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateBillFromPO}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 1.35rem',
                      borderRadius: '6px',
                      border: '1px solid #10b98160',
                      backgroundColor: '#10b98125',
                      color: '#34d399',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Receipt size={14} />
                    <span>Create Bill</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={() => setPoFormData({ ...poFormData, status: 'Cancelled' })}
                    style={{
                      padding: '0.55rem 1rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgSubtle,
                      color: theme.textMuted,
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => setPoViewMode('list')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.55rem 1.1rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgSubtle,
                      color: theme.textMain,
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>
                </div>
              </div>

              {/* PO Header Fields: PO No., Vendor Name, Status, PO Date */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.8rem',
                  marginBottom: '2rem',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                    Purchase Order Number
                  </label>
                  <input
                    type="text"
                    value={poFormData.id}
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgSubtle,
                      color: theme.accentGold,
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                    Vendor Name
                  </label>
                  <select
                    value={poFormData.vendorName}
                    onChange={(e) => setPoFormData({ ...poFormData, vendorName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  >
                    <option value="Mr. Rahul">Mr. Rahul (Azure Furniture Supplies)</option>
                    {(contacts || []).map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} {c.company ? `(${c.company})` : ''} - {c.type || 'Vendor'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                    PO Date
                  </label>
                  <input
                    type="date"
                    value={poFormData.date}
                    onChange={(e) => setPoFormData({ ...poFormData, date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                    Status
                  </label>
                  <div style={{ paddingTop: '0.35rem' }}>
                    <span
                      style={{
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        padding: '0.4rem 0.9rem',
                        borderRadius: '6px',
                        backgroundColor:
                          poFormData.status === 'Billed'
                            ? '#10b98125'
                            : poFormData.status === 'Confirmed'
                            ? '#3b82f625'
                            : theme.bgSubtle,
                        color:
                          poFormData.status === 'Billed'
                            ? '#34d399'
                            : poFormData.status === 'Confirmed'
                            ? '#60a5fa'
                            : theme.textMuted,
                        border: `1px solid ${theme.borderLight}`,
                      }}
                    >
                      {poFormData.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* PO Line Items Table */}
              <div style={{ marginTop: '1.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: theme.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                    Order Lines
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddPOLine}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '5px',
                      backgroundColor: theme.bgSubtle,
                      border: `1px solid ${theme.borderLight}`,
                      color: theme.accentGold,
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={13} />
                    <span>Add line</span>
                  </button>
                </div>

                <div style={{ overflowX: 'auto', border: `1px solid ${theme.borderLight}`, borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}` }}>
                        <th style={{ padding: '0.85rem 0.8rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', width: '60px', textAlign: 'center' }}>Sr. No.</th>
                        <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Product</th>
                        <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Budget Analytic Account</th>
                        <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', width: '100px', textAlign: 'right' }}>Qty</th>
                        <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', width: '140px', textAlign: 'right' }}>Unit Price (₹)</th>
                        <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', width: '150px', textAlign: 'right' }}>Total (₹)</th>
                        <th style={{ padding: '0.85rem 0.6rem', width: '45px', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {poFormData.items.map((item, idx) => (
                        <tr key={item.id || idx} style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                          <td style={{ padding: '0.65rem 0.8rem', textAlign: 'center', color: theme.textMuted }}>{idx + 1}</td>

                          <td style={{ padding: '0.65rem 0.8rem' }}>
                            <select
                              value={item.product}
                              onChange={(e) => handlePOLineChange(idx, 'product', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.7rem',
                                borderRadius: '5px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.84rem',
                                outline: 'none',
                              }}
                            >
                              <option value="Table">Table (Solid Teak Wooden Table)</option>
                              <option value="Ergonomic Office Chair">Ergonomic Office Chair</option>
                              {(products || []).map((p) => (
                                <option key={p.id} value={p.name}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td style={{ padding: '0.65rem 0.8rem' }}>
                            <select
                              value={item.budgetAnalytics}
                              onChange={(e) => handlePOLineChange(idx, 'budgetAnalytics', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.7rem',
                                borderRadius: '5px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.84rem',
                                outline: 'none',
                              }}
                            >
                              <option value="Project 1">Project 1</option>
                              <option value="Furniture">Furniture</option>
                              {(analyticAccounts || []).map((a) => (
                                <option key={a.id} value={a.name}>
                                  {a.name} ({a.code})
                                </option>
                              ))}
                            </select>
                          </td>

                          <td style={{ padding: '0.65rem 0.8rem' }}>
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handlePOLineChange(idx, 'qty', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.7rem',
                                borderRadius: '5px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.84rem',
                                textAlign: 'right',
                                outline: 'none',
                              }}
                            />
                          </td>

                          <td style={{ padding: '0.65rem 0.8rem' }}>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handlePOLineChange(idx, 'unitPrice', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.7rem',
                                borderRadius: '5px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.84rem',
                                textAlign: 'right',
                                outline: 'none',
                              }}
                            />
                          </td>

                          <td style={{ padding: '0.65rem 0.8rem', textAlign: 'right', fontWeight: 700, color: theme.accentGold }}>
                            ₹{Number(item.total).toLocaleString()}
                          </td>

                          <td style={{ padding: '0.65rem 0.6rem', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemovePOLine(idx)}
                              style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ backgroundColor: theme.bgSubtle, borderTop: `2px solid ${theme.borderLight}` }}>
                        <td colSpan={5} style={{ padding: '0.85rem 1.2rem', textAlign: 'right', fontWeight: 700, color: theme.textMain }}>
                          Total:
                        </td>
                        <td style={{ padding: '0.85rem 1.2rem', textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: theme.accentGold }}>
                          ₹{poTotalAmount.toLocaleString()}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Non-Blocking Warning on Confirmation of PO (Matches diagram exactly!) */}
              {poExceedsBudget && (
                <div
                  style={{
                    marginTop: '1.5rem',
                    padding: '1rem 1.3rem',
                    borderRadius: '8px',
                    backgroundColor: '#fef3c715',
                    border: '1px solid #f59e0b50',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                  }}
                >
                  <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f59e0b', margin: '0 0 0.2rem 0' }}>
                      ⚠️ Exceeds Approved Budget
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: theme.textMuted, margin: 0 }}>
                      The entered amount is higher than the remaining budget amount for this budget line. Consider adjusting the value or revise the budget.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODULE 2: VENDOR BILLS (BILL LIST & FORM VIEW)
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'bills' && (
        <div>
          {/* VENDOR BILL LIST VIEW */}
          {billViewMode === 'list' && (
            <div
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.borderLight}`,
                borderRadius: '12px',
                padding: '1.6rem 2rem',
                boxShadow: theme.shadow,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => handleOpenBillForm(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 1.3rem',
                    borderRadius: '6px',
                    backgroundColor: theme.accentGold,
                    color: '#0E0D0C',
                    border: 'none',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={15} />
                  <span>New Vendor Bill</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ position: 'relative', width: '320px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: theme.textDim }} />
                    <input
                      type="text"
                      placeholder="Search Vendor Bills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.8rem 0.5rem 2.2rem',
                        borderRadius: '6px',
                        border: `1px solid ${theme.borderLight}`,
                        backgroundColor: theme.bgInput,
                        color: theme.textMain,
                        fontSize: '0.84rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto', border: `1px solid ${theme.borderLight}`, borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}` }}>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Vendor Bill No.</th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Vendor Name</th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Bill Date</th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Total</th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Amount Due</th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorBillsList.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: theme.textMuted }}>
                          No Vendor Bills found. Click <strong>[New Vendor Bill]</strong> or convert from a Purchase Order.
                        </td>
                      </tr>
                    ) : (
                      vendorBillsList.map((bill) => {
                        const totalNum = Number(bill.amount) || 6000;
                        const dueNum = bill.amountDue !== undefined ? Number(bill.amountDue) : (bill.status === 'Paid' ? 0 : totalNum);

                        return (
                          <tr
                            key={bill.id}
                            style={{ borderBottom: `1px solid ${theme.borderLight}`, color: theme.textMain, cursor: 'pointer' }}
                            onClick={() => handleOpenBillForm(bill)}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${theme.bgSubtle}80`)}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <td style={{ padding: '0.95rem 1.2rem', fontWeight: 700, color: theme.accentGold }}>{bill.id}</td>
                            <td style={{ padding: '0.95rem 1.2rem', fontWeight: 600 }}>{bill.contactName || 'Mr. Rahul'}</td>
                            <td style={{ padding: '0.95rem 1.2rem', color: theme.textMuted }}>{bill.date}</td>
                            <td style={{ padding: '0.95rem 1.2rem', textAlign: 'right', fontWeight: 700 }}>₹{totalNum.toLocaleString()}</td>
                            <td style={{ padding: '0.95rem 1.2rem', textAlign: 'right', fontWeight: 700, color: dueNum > 0 ? '#f87171' : '#34d399' }}>
                              ₹{dueNum.toLocaleString()}
                            </td>
                            <td style={{ padding: '0.95rem 1.2rem', textAlign: 'center' }}>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '4px',
                                  backgroundColor:
                                    dueNum === 0
                                      ? '#10b98120'
                                      : dueNum < totalNum
                                      ? '#f59e0b20'
                                      : '#ef444420',
                                  color:
                                    dueNum === 0
                                      ? '#34d399'
                                      : dueNum < totalNum
                                      ? '#f59e0b'
                                      : '#f87171',
                                  border: `1px solid ${theme.borderLight}`,
                                }}
                              >
                                {dueNum === 0 ? 'Paid' : dueNum < totalNum ? 'Partial' : 'Not Paid'}
                              </span>
                            </td>
                            <td style={{ padding: '0.95rem 1.2rem', textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', gap: '0.45rem' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenBillForm(bill);
                                  }}
                                  style={{
                                    padding: '0.35rem 0.75rem',
                                    borderRadius: '5px',
                                    backgroundColor: theme.bgSubtle,
                                    border: `1px solid ${theme.borderLight}`,
                                    color: theme.accentGold,
                                    fontSize: '0.76rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  View
                                </button>
                                {dueNum > 0 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenPaymentModal(bill);
                                    }}
                                    style={{
                                      padding: '0.35rem 0.75rem',
                                      borderRadius: '5px',
                                      backgroundColor: '#10b98125',
                                      border: '1px solid #10b98160',
                                      color: '#34d399',
                                      fontSize: '0.76rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Pay
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VENDOR BILL FORM VIEW (Matches Middle Screen in Diagram!) */}
          {billViewMode === 'form' && (
            <div
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.borderLight}`,
                borderRadius: '12px',
                padding: '1.8rem 2.2rem',
                boxShadow: theme.shadow,
              }}
            >
              {/* Top Header Actions: Left [New, Confirm, Pay] | Right Smart Buttons [PO, Budget, Saved, Back] */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  paddingBottom: '1.4rem',
                  borderBottom: `1px solid ${theme.borderLight}`,
                  marginBottom: '1.8rem',
                }}
              >
                {/* Left Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenBillForm(null)}
                    style={{
                      padding: '0.55rem 1.2rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgSubtle,
                      color: theme.textMain,
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    New
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmBill}
                    style={{
                      padding: '0.55rem 1.3rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: theme.accentGold,
                      color: '#0E0D0C',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Confirm
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenPaymentModal(billFormData)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 1.3rem',
                      borderRadius: '6px',
                      border: '1px solid #10b98160',
                      backgroundColor: '#10b98125',
                      color: '#34d399',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <CreditCard size={14} />
                    <span>Pay</span>
                  </button>
                </div>

                {/* Right Smart Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {/* [PO] Smart Button: Only show if bill created from PO */}
                  {billFormData.orderId && (
                    <button
                      type="button"
                      onClick={() => {
                        const originPO = (orders || []).find((o) => o.id === billFormData.orderId);
                        if (originPO) {
                          handleOpenPOForm(originPO);
                          setActiveTab('po');
                        } else {
                          showToast(`Origin Purchase Order: ${billFormData.orderId}`);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.5rem 0.95rem',
                        borderRadius: '6px',
                        backgroundColor: '#3b82f620',
                        border: '1px solid #3b82f650',
                        color: '#60a5fa',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                      title="On click open the PO from which Bill Created"
                    >
                      <FileText size={13} />
                      <span>PO: {billFormData.orderId}</span>
                    </button>
                  )}

                  {/* [Budget] Smart Button: Open Budget/Analytics Report used for Bill */}
                  <button
                    type="button"
                    onClick={() => navigate('/budgets')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 0.95rem',
                      borderRadius: '6px',
                      backgroundColor: `${theme.accentGold}20`,
                      border: `1px solid ${theme.accentGold}50`,
                      color: theme.accentGold,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    title="Open the Budget/Analytics Report that is used for Bill"
                  >
                    <PieChart size={13} />
                    <span>Budget Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenLinkedJE(billFormData)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 0.95rem',
                      borderRadius: '6px',
                      backgroundColor: theme.bgSubtle,
                      border: `1px solid ${theme.borderLight}`,
                      color: theme.textMain,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <BookOpen size={13} />
                    <span>Journal Entry</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBillViewMode('list')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgSubtle,
                      color: theme.textMain,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>
                </div>
              </div>

              {/* Vendor Bill Header (2 Columns) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '2.5rem',
                  marginBottom: '2rem',
                }}
              >
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                      Vendor Bill No.
                    </label>
                    <input
                      type="text"
                      value={billFormData.id}
                      disabled
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: '6px',
                        border: `1px solid ${theme.borderLight}`,
                        backgroundColor: theme.bgSubtle,
                        color: theme.accentGold,
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                      Vendor Name
                    </label>
                    <select
                      value={billFormData.vendorName}
                      onChange={(e) => setBillFormData({ ...billFormData, vendorName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: '6px',
                        border: `1px solid ${theme.borderLight}`,
                        backgroundColor: theme.bgInput,
                        color: theme.textMain,
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    >
                      <option value="Mr. Rahul">Mr. Rahul (Azure Furniture Supplies)</option>
                      {(contacts || []).map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} {c.company ? `(${c.company})` : ''} - {c.type || 'Vendor'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Badges */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                      Payment Status
                    </label>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <span
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          padding: '0.35rem 0.8rem',
                          borderRadius: '5px',
                          backgroundColor: billFormData.amountDue === 0 ? '#10b981' : '#10b98120',
                          color: billFormData.amountDue === 0 ? '#0E0D0C' : '#34d399',
                          border: '1px solid #10b98160',
                        }}
                      >
                        Paid
                      </span>
                      <span
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          padding: '0.35rem 0.8rem',
                          borderRadius: '5px',
                          backgroundColor:
                            billFormData.amountDue > 0 && billFormData.amountDue < billTotalAmount
                              ? '#f59e0b'
                              : '#f59e0b20',
                          color:
                            billFormData.amountDue > 0 && billFormData.amountDue < billTotalAmount
                              ? '#0E0D0C'
                              : '#f59e0b',
                          border: '1px solid #f59e0b60',
                        }}
                      >
                        Partial
                      </span>
                      <span
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          padding: '0.35rem 0.8rem',
                          borderRadius: '5px',
                          backgroundColor: billFormData.amountDue === billTotalAmount && billTotalAmount > 0 ? '#ef4444' : '#ef444420',
                          color: billFormData.amountDue === billTotalAmount && billTotalAmount > 0 ? '#ffffff' : '#f87171',
                          border: '1px solid #ef444460',
                        }}
                      >
                        Not Paid
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                      Bill Reference <span style={{ fontSize: '0.74rem', color: theme.textDim }}>(Alpha Numeric, e.g. ARC-26-001)</span>
                    </label>
                    <input
                      type="text"
                      value={billFormData.reference}
                      onChange={(e) => setBillFormData({ ...billFormData, reference: e.target.value })}
                      placeholder="e.g. ARC-26-001"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: '6px',
                        border: `1px solid ${theme.borderLight}`,
                        backgroundColor: theme.bgInput,
                        color: theme.textMain,
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                      Bill Date
                    </label>
                    <input
                      type="date"
                      value={billFormData.date}
                      onChange={(e) => setBillFormData({ ...billFormData, date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: '6px',
                        border: `1px solid ${theme.borderLight}`,
                        backgroundColor: theme.bgInput,
                        color: theme.textMain,
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={billFormData.dueDate}
                      onChange={(e) => setBillFormData({ ...billFormData, dueDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: '6px',
                        border: `1px solid ${theme.borderLight}`,
                        backgroundColor: theme.bgInput,
                        color: theme.textMain,
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Vendor Bill Line Items Table */}
              <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: theme.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                    Invoice Lines Breakdown
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddBillLine}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '5px',
                      backgroundColor: theme.bgSubtle,
                      border: `1px solid ${theme.borderLight}`,
                      color: theme.accentGold,
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={13} />
                    <span>Add a line</span>
                  </button>
                </div>

                <div style={{ overflowX: 'auto', border: `1px solid ${theme.borderLight}`, borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}` }}>
                        <th style={{ padding: '0.85rem 0.8rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', width: '60px', textAlign: 'center' }}>Sr. No.</th>
                        <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Product</th>
                        <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Chart of Account</th>
                        <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Budget Analytic Account</th>
                        <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', width: '90px', textAlign: 'right' }}>Qty</th>
                        <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', width: '130px', textAlign: 'right' }}>Unit Price (₹)</th>
                        <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', width: '140px', textAlign: 'right' }}>Total (₹)</th>
                        <th style={{ padding: '0.85rem 0.6rem', width: '45px', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {billFormData.items.map((item, idx) => (
                        <tr key={item.id || idx} style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                          <td style={{ padding: '0.65rem 0.8rem', textAlign: 'center', color: theme.textMuted }}>{idx + 1}</td>

                          <td style={{ padding: '0.65rem 0.8rem' }}>
                            <select
                              value={item.product}
                              onChange={(e) => handleBillLineChange(idx, 'product', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.7rem',
                                borderRadius: '5px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.84rem',
                                outline: 'none',
                              }}
                            >
                              <option value="Table">Table (Solid Teak Wooden Table)</option>
                              {(products || []).map((p) => (
                                <option key={p.id} value={p.name}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Chart of Account: Default is Purchase Expense Account (5010) */}
                          <td style={{ padding: '0.65rem 0.8rem' }}>
                            <select
                              value={item.chartOfAccount}
                              onChange={(e) => handleBillLineChange(idx, 'chartOfAccount', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.7rem',
                                borderRadius: '5px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.84rem',
                                outline: 'none',
                              }}
                            >
                              <option value="Purchase">Purchase (Purchase Expense A/c - 5010)</option>
                              {(chartOfAccounts || []).map((acc) => (
                                <option key={acc.id} value={acc.name}>
                                  {acc.code} - {acc.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td style={{ padding: '0.65rem 0.8rem' }}>
                            <select
                              value={item.budgetAnalytics}
                              onChange={(e) => handleBillLineChange(idx, 'budgetAnalytics', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.7rem',
                                borderRadius: '5px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.84rem',
                                outline: 'none',
                              }}
                            >
                              <option value="Project 1">Project 1</option>
                              <option value="Furniture">Furniture</option>
                              {(analyticAccounts || []).map((a) => (
                                <option key={a.id} value={a.name}>
                                  {a.name} ({a.code})
                                </option>
                              ))}
                            </select>
                          </td>

                          <td style={{ padding: '0.65rem 0.8rem' }}>
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleBillLineChange(idx, 'qty', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.7rem',
                                borderRadius: '5px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.84rem',
                                textAlign: 'right',
                                outline: 'none',
                              }}
                            />
                          </td>

                          <td style={{ padding: '0.65rem 0.8rem' }}>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleBillLineChange(idx, 'unitPrice', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.7rem',
                                borderRadius: '5px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.84rem',
                                textAlign: 'right',
                                outline: 'none',
                              }}
                            />
                          </td>

                          <td style={{ padding: '0.65rem 0.8rem', textAlign: 'right', fontWeight: 700, color: theme.accentGold }}>
                            ₹{Number(item.total).toLocaleString()}
                          </td>

                          <td style={{ padding: '0.65rem 0.6rem', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveBillLine(idx)}
                              style={{ background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Financial Summary: Total, Paid Via Cash, Paid Via Bank, Amount Due */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.4rem' }}>
                  <div
                    style={{
                      width: '340px',
                      backgroundColor: theme.bgSubtle,
                      padding: '1.2rem',
                      borderRadius: '8px',
                      border: `1px solid ${theme.borderLight}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: theme.textMain, fontWeight: 700 }}>
                      <span>Total:</span>
                      <span>₹{billTotalAmount.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#34d399' }}>
                      <span>Paid Via Cash:</span>
                      <span>₹{Number(billFormData.paidViaCash || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#60a5fa' }}>
                      <span>Paid Via Bank:</span>
                      <span>₹{Number(billFormData.paidViaBank || 0).toLocaleString()}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: Number(billFormData.amountDue) > 0 ? '#f87171' : '#34d399',
                        borderTop: `1px solid ${theme.borderLight}`,
                        paddingTop: '0.5rem',
                      }}
                    >
                      <span>Amount Due:</span>
                      <span>₹{Number(billFormData.amountDue).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Non-Blocking Warning on Confirmation of Bill */}
              {billExceedsBudget && (
                <div
                  style={{
                    marginTop: '1.5rem',
                    padding: '1rem 1.3rem',
                    borderRadius: '8px',
                    backgroundColor: '#fef3c715',
                    border: '1px solid #f59e0b50',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                  }}
                >
                  <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f59e0b', margin: '0 0 0.2rem 0' }}>
                      ⚠️ Exceeds Approved Budget
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: theme.textMuted, margin: 0 }}>
                      The entered amount is higher than the remaining budget amount for this budget line. Consider adjusting the value or revise the budget.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODULE 3: SALES ORDERS (SO LIST & FORM VIEW)
          Matches Left Screen in Flowchart Diagram
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'so' && (
        <div>
          {/* SO LIST VIEW */}
          {soViewMode === 'list' && (
            <div
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.borderLight}`,
                borderRadius: '12px',
                padding: '1.6rem 2rem',
                boxShadow: theme.shadow,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => handleOpenSOForm(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 1.3rem',
                    borderRadius: '6px',
                    backgroundColor: theme.accentGold,
                    color: '#0E0D0C',
                    border: 'none',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={15} />
                  <span>New Sales Order</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ position: 'relative', width: '320px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: theme.textDim }} />
                    <input
                      type="text"
                      placeholder="Search Sales Orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.8rem 0.5rem 2.2rem',
                        borderRadius: '6px',
                        border: `1px solid ${theme.borderLight}`,
                        backgroundColor: theme.bgInput,
                        color: theme.textMain,
                        fontSize: '0.84rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto', border: `1px solid ${theme.borderLight}`, borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}` }}>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>SO No.</th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Customer Name</th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>SO Date</th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Total Amount</th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '0.85rem 1.2rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesOrdersList
                      .filter((so) =>
                        (so.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (so.contactName || '').toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((so) => (
                        <tr
                          key={so.id}
                          style={{
                            borderBottom: `1px solid ${theme.borderLight}`,
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          <td style={{ padding: '0.95rem 1.2rem', fontWeight: 700, color: theme.accentGold }}>
                            {so.id}
                          </td>
                          <td style={{ padding: '0.95rem 1.2rem', fontWeight: 600, color: theme.textMain }}>
                            {so.contactName || 'Mr. Rahul'}
                          </td>
                          <td style={{ padding: '0.95rem 1.2rem', color: theme.textMuted }}>
                            {so.date}
                          </td>
                          <td style={{ padding: '0.95rem 1.2rem', textAlign: 'right', fontWeight: 700, color: theme.textMain }}>
                            ₹{(Number(so.totalAmount) || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '0.95rem 1.2rem', textAlign: 'center' }}>
                            <span
                              style={{
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                padding: '0.25rem 0.65rem',
                                borderRadius: '4px',
                                backgroundColor:
                                  so.status === 'Invoiced'
                                    ? '#10b98120'
                                    : so.status === 'Confirmed'
                                    ? '#3b82f620'
                                    : theme.bgSubtle,
                                color:
                                  so.status === 'Invoiced'
                                    ? '#34d399'
                                    : so.status === 'Confirmed'
                                    ? '#60a5fa'
                                    : theme.textMuted,
                                border: `1px solid ${theme.borderLight}`,
                              }}
                            >
                              {so.status || 'Draft'}
                            </span>
                          </td>
                          <td style={{ padding: '0.95rem 1.2rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenSOForm(so)}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  borderRadius: '5px',
                                  backgroundColor: theme.bgSubtle,
                                  color: theme.textMain,
                                  border: `1px solid ${theme.borderLight}`,
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                View / Edit
                              </button>

                              {so.status !== 'Invoiced' && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    handleOpenSOForm(so);
                                    await convertSOToInvoice(so);
                                    showToast(`Customer Invoice created from ${so.id}!`);
                                    setActiveTab('invoices');
                                  }}
                                  style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '5px',
                                    backgroundColor: theme.accentGold,
                                    color: '#0E0D0C',
                                    border: 'none',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Create Invoice
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    {salesOrdersList.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: theme.textMuted }}>
                          No Sales Orders found. Click <strong>+ New Sales Order</strong> to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SO FORM VIEW (Matches Left Screen in Whiteboard Diagram!) */}
          {soViewMode === 'form' && (
            <div
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.borderLight}`,
                borderRadius: '12px',
                padding: '1.8rem 2.2rem',
                boxShadow: theme.shadow,
              }}
            >
              {/* Header Toolbar: [New] [Confirm] [Create Invoice] [Cancel] [Back] */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.8rem',
                  paddingBottom: '1.2rem',
                  borderBottom: `1px solid ${theme.borderLight}`,
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenSOForm(null)}
                    style={{
                      padding: '0.5rem 1.1rem',
                      borderRadius: '6px',
                      backgroundColor: theme.bgSubtle,
                      color: theme.textMain,
                      border: `1px solid ${theme.borderLight}`,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    New
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmSO}
                    disabled={soFormData.status === 'Confirmed' || soFormData.status === 'Invoiced'}
                    style={{
                      padding: '0.5rem 1.2rem',
                      borderRadius: '6px',
                      backgroundColor:
                        soFormData.status === 'Confirmed' || soFormData.status === 'Invoiced'
                          ? theme.bgSubtle
                          : theme.accentGold,
                      color:
                        soFormData.status === 'Confirmed' || soFormData.status === 'Invoiced'
                          ? theme.textDim
                          : '#0E0D0C',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor:
                        soFormData.status === 'Confirmed' || soFormData.status === 'Invoiced'
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                  >
                    Confirm
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateInvoiceFromSO}
                    disabled={soFormData.status === 'Invoiced'}
                    style={{
                      padding: '0.5rem 1.2rem',
                      borderRadius: '6px',
                      backgroundColor: soFormData.status === 'Invoiced' ? theme.bgSubtle : '#10b981',
                      color: soFormData.status === 'Invoiced' ? theme.textDim : '#ffffff',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: soFormData.status === 'Invoiced' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {soFormData.status === 'Invoiced' ? 'Invoice Created' : 'Create Invoice'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSoFormData((prev) => ({ ...prev, status: 'Cancelled' }));
                      showToast(`Sales Order ${soFormData.id} cancelled.`);
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      backgroundColor: theme.bgSubtle,
                      color: '#f87171',
                      border: `1px solid ${theme.borderLight}`,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => setSoViewMode('list')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      backgroundColor: theme.bgSubtle,
                      color: theme.textMuted,
                      border: `1px solid ${theme.borderLight}`,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.78rem', color: theme.textDim, textTransform: 'uppercase', fontWeight: 600 }}>Status:</span>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '0.3rem 0.8rem',
                      borderRadius: '6px',
                      backgroundColor:
                        soFormData.status === 'Invoiced'
                          ? '#10b98120'
                          : soFormData.status === 'Confirmed'
                          ? '#3b82f620'
                          : theme.bgSubtle,
                      color:
                        soFormData.status === 'Invoiced'
                          ? '#34d399'
                          : soFormData.status === 'Confirmed'
                          ? '#60a5fa'
                          : theme.accentGold,
                      border: `1px solid ${theme.borderLight}`,
                    }}
                  >
                    {soFormData.status || 'Draft'}
                  </span>
                </div>
              </div>

              {/* Form Fields: SO No., Customer Name, SO Date */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.5rem',
                  backgroundColor: theme.bgSubtle,
                  padding: '1.4rem 1.6rem',
                  borderRadius: '10px',
                  border: `1px solid ${theme.borderLight}`,
                  marginBottom: '1.8rem',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted, marginBottom: '0.45rem' }}>
                    SO No. <span style={{ fontSize: '0.74rem', color: theme.textDim }}>(Auto generated sequence +1 of last order)</span>
                  </label>
                  <input
                    type="text"
                    value={soFormData.id}
                    onChange={(e) => setSoFormData({ ...soFormData, id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.9rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgInput,
                      color: theme.accentGold,
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted, marginBottom: '0.45rem' }}>
                    Customer Name
                  </label>
                  <select
                    value={soFormData.customerName}
                    onChange={(e) => {
                      const selected = contacts.find((c) => c.name === e.target.value);
                      setSoFormData({
                        ...soFormData,
                        customerName: e.target.value,
                        contactId: selected?.id || soFormData.contactId
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.9rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  >
                    {contacts.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} {c.type ? `(${c.type})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted, marginBottom: '0.45rem' }}>
                    SO Date
                  </label>
                  <input
                    type="date"
                    value={soFormData.date}
                    onChange={(e) => setSoFormData({ ...soFormData, date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.9rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgInput,
                      color: theme.textMain,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Line Items Table: Sr. No., Product, Budget Analytics, Qty, Unit Price, Total */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: theme.textMain, margin: 0 }}>
                    Order Lines
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddSOLine}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.9rem',
                      borderRadius: '6px',
                      backgroundColor: theme.bgSubtle,
                      color: theme.accentGold,
                      border: `1px solid ${theme.borderLight}`,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} />
                    <span>Add Line Item</span>
                  </button>
                </div>

                <div style={{ overflowX: 'auto', border: `1px solid ${theme.borderLight}`, borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}` }}>
                        <th style={{ width: '60px', padding: '0.8rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textAlign: 'center' }}>Sr. No.</th>
                        <th style={{ padding: '0.8rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700 }}>Product</th>
                        <th style={{ padding: '0.8rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700 }}>Budget Analytic Account</th>
                        <th style={{ width: '100px', padding: '0.8rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textAlign: 'right' }}>Qty</th>
                        <th style={{ width: '140px', padding: '0.8rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textAlign: 'right' }}>Unit Price (₹)</th>
                        <th style={{ width: '140px', padding: '0.8rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textAlign: 'right' }}>Total (₹)</th>
                        <th style={{ width: '50px', padding: '0.8rem', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {soFormData.items.map((item, idx) => (
                        <tr key={item.id || idx} style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                          <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: theme.textMuted }}>
                            {item.srNo || idx + 1}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <select
                              value={item.product}
                              onChange={(e) => handleSOLineChange(idx, 'product', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.45rem 0.65rem',
                                borderRadius: '5px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.84rem',
                                outline: 'none',
                              }}
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.name}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <select
                              value={item.budgetAnalytics}
                              onChange={(e) => handleSOLineChange(idx, 'budgetAnalytics', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.45rem 0.65rem',
                                borderRadius: '5px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.84rem',
                                outline: 'none',
                              }}
                            >
                              {analyticAccounts.map((a) => (
                                <option key={a.id} value={a.name}>
                                  {a.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleSOLineChange(idx, 'qty', e.target.value)}
                              style={{
                                width: '80px',
                                padding: '0.45rem 0.5rem',
                                textAlign: 'right',
                                borderRadius: '5px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.84rem',
                                outline: 'none',
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleSOLineChange(idx, 'unitPrice', e.target.value)}
                              style={{
                                width: '120px',
                                padding: '0.45rem 0.5rem',
                                textAlign: 'right',
                                borderRadius: '5px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.84rem',
                                outline: 'none',
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: theme.accentGold }}>
                            ₹{(Number(item.total) || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveSOLine(idx)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#f87171',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Total Summary */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.4rem' }}>
                  <div
                    style={{
                      width: '320px',
                      backgroundColor: theme.bgSubtle,
                      padding: '1.2rem',
                      borderRadius: '8px',
                      border: `1px solid ${theme.borderLight}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: theme.textMain }}>Total:</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: theme.accentGold }}>
                      ₹{soTotalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODULE 4: CUSTOMER INVOICES (INVOICE LIST & FORM VIEW)
          Matches Middle Screen in Flowchart Diagram
      ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'invoices' && (
        <div>
          {/* CUSTOMER INVOICE LIST VIEW */}
          {invoiceViewMode === 'list' && (
            <div
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.borderLight}`,
                borderRadius: '12px',
                padding: '1.6rem 2rem',
                boxShadow: theme.shadow,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => handleOpenCustomerInvoiceForm(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 1.3rem',
                    borderRadius: '6px',
                    backgroundColor: theme.accentGold,
                    color: '#0E0D0C',
                    border: 'none',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={15} />
                  <span>New Customer Invoice</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ position: 'relative', width: '320px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: theme.textDim }} />
                    <input
                      type="text"
                      placeholder="Search Customer Invoices..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.8rem 0.5rem 2.2rem',
                        borderRadius: '6px',
                        border: `1px solid ${theme.borderLight}`,
                        backgroundColor: theme.bgInput,
                        color: theme.textMain,
                        fontSize: '0.84rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto', border: `1px solid ${theme.borderLight}`, borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}` }}>
                      <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Invoice No.</th>
                      <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Origin SO</th>
                      <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Customer Name</th>
                      <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Reference</th>
                      <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Date</th>
                      <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Total</th>
                      <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Amount Due</th>
                      <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '0.85rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerInvoicesList
                      .filter((inv) =>
                        (inv.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (inv.contactName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (inv.reference || '').toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((inv) => {
                        const due = inv.amountDue !== undefined ? Number(inv.amountDue) : (Number(inv.amount) - (Number(inv.paidAmount) || 0));
                        const statusBadge = due === 0 ? 'Paid' : (inv.paidViaCash > 0 || inv.paidViaBank > 0 || inv.paidAmount > 0 ? 'Partial' : 'Not Paid');

                        return (
                          <tr
                            key={inv.id}
                            style={{
                              borderBottom: `1px solid ${theme.borderLight}`,
                              transition: 'background-color 0.15s ease',
                            }}
                          >
                            <td style={{ padding: '0.95rem 1rem', fontWeight: 700, color: theme.accentGold }}>
                              {inv.id}
                            </td>
                            <td style={{ padding: '0.95rem 1rem', color: inv.orderId ? theme.accentGold : theme.textDim, fontWeight: 600 }}>
                              {inv.orderId || '—'}
                            </td>
                            <td style={{ padding: '0.95rem 1rem', fontWeight: 600, color: theme.textMain }}>
                              {inv.contactName || 'Mr. Rahul'}
                            </td>
                            <td style={{ padding: '0.95rem 1rem', color: theme.textMuted }}>
                              {inv.reference || 'ARC-26-001'}
                            </td>
                            <td style={{ padding: '0.95rem 1rem', color: theme.textMuted }}>
                              {inv.date}
                            </td>
                            <td style={{ padding: '0.95rem 1rem', textAlign: 'right', fontWeight: 700, color: theme.textMain }}>
                              ₹{(Number(inv.amount) || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '0.95rem 1rem', textAlign: 'right', fontWeight: 700, color: due === 0 ? '#34d399' : '#f87171' }}>
                              ₹{due.toLocaleString()}
                            </td>
                            <td style={{ padding: '0.95rem 1rem', textAlign: 'center' }}>
                              <span
                                style={{
                                  fontSize: '0.74rem',
                                  fontWeight: 600,
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: '4px',
                                  backgroundColor:
                                    statusBadge === 'Paid'
                                      ? '#10b98120'
                                      : statusBadge === 'Partial'
                                      ? '#f59e0b20'
                                      : '#ef444420',
                                  color:
                                    statusBadge === 'Paid'
                                      ? '#34d399'
                                      : statusBadge === 'Partial'
                                      ? '#f59e0b'
                                      : '#f87171',
                                  border: `1px solid ${theme.borderLight}`,
                                }}
                              >
                                {statusBadge}
                              </span>
                            </td>
                            <td style={{ padding: '0.95rem 1rem', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenCustomerInvoiceForm(inv)}
                                  style={{
                                    padding: '0.4rem 0.75rem',
                                    borderRadius: '5px',
                                    backgroundColor: theme.bgSubtle,
                                    color: theme.textMain,
                                    border: `1px solid ${theme.borderLight}`,
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  View / Edit
                                </button>
                                {due > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCustomerPaymentModal(inv)}
                                    style={{
                                      padding: '0.4rem 0.75rem',
                                      borderRadius: '5px',
                                      backgroundColor: '#3b82f6',
                                      color: '#ffffff',
                                      border: 'none',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Pay
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    {customerInvoicesList.length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ padding: '2.5rem', textAlign: 'center', color: theme.textMuted }}>
                          No Customer Invoices found. Click <strong>+ New Customer Invoice</strong> or convert a Sales Order.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CUSTOMER INVOICE FORM VIEW (Matches Middle Screen in Whiteboard Diagram!) */}
          {invoiceViewMode === 'form' && (
            <div
              style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${theme.borderLight}`,
                borderRadius: '12px',
                padding: '1.8rem 2.2rem',
                boxShadow: theme.shadow,
              }}
            >
              {/* Header Action Bar: [New] [Confirm] [Pay]  Smart Buttons: [SO: SO0001] [Budget] [Journal Entry] [Saved] [Back] */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.8rem',
                  paddingBottom: '1.2rem',
                  borderBottom: `1px solid ${theme.borderLight}`,
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                {/* Left Action Buttons: [New] [Confirm] [Pay] */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenCustomerInvoiceForm(null)}
                    style={{
                      padding: '0.5rem 1.1rem',
                      borderRadius: '6px',
                      backgroundColor: theme.bgSubtle,
                      color: theme.textMain,
                      border: `1px solid ${theme.borderLight}`,
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    New
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmCustomerInvoice}
                    style={{
                      padding: '0.5rem 1.2rem',
                      borderRadius: '6px',
                      backgroundColor: theme.accentGold,
                      color: '#0E0D0C',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Confirm
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenCustomerPaymentModal(invoiceFormData)}
                    disabled={Number(invoiceFormData.amountDue) <= 0}
                    style={{
                      padding: '0.5rem 1.2rem',
                      borderRadius: '6px',
                      backgroundColor: Number(invoiceFormData.amountDue) <= 0 ? theme.bgSubtle : '#3b82f6',
                      color: Number(invoiceFormData.amountDue) <= 0 ? theme.textDim : '#ffffff',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: Number(invoiceFormData.amountDue) <= 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Pay
                  </button>
                </div>

                {/* Right Smart Buttons (Diagram: [SO] [Budget] [Saved] [Back]) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  {/* Smart Button: [SO: SO0001] -> ONLY show if bill created from SO! */}
                  {invoiceFormData.orderId && (
                    <button
                      type="button"
                      onClick={() => {
                        const originSO = orders.find((o) => o.id === invoiceFormData.orderId);
                        handleOpenSOForm(originSO || { id: invoiceFormData.orderId, contactName: invoiceFormData.customerName });
                        setActiveTab('so');
                        showToast(`Opened origin Sales Order ${invoiceFormData.orderId}`);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 0.95rem',
                        borderRadius: '6px',
                        backgroundColor: theme.bgSubtle,
                        color: theme.accentGold,
                        border: `1px solid ${theme.borderLight}`,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <ShoppingCart size={13} />
                      <span>SO: {invoiceFormData.orderId}</span>
                    </button>
                  )}

                  {/* Smart Button: [Budget] -> Opens Budget Analytics Report */}
                  <button
                    type="button"
                    onClick={() => navigate('/budgets')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.95rem',
                      borderRadius: '6px',
                      backgroundColor: theme.bgSubtle,
                      color: theme.textMain,
                      border: `1px solid ${theme.borderLight}`,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <PieChart size={13} />
                    <span>Budget</span>
                  </button>

                  {/* Smart Button: [Journal Entry] */}
                  <button
                    type="button"
                    onClick={() => handleOpenLinkedCustomerInvoiceJE(invoiceFormData)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.95rem',
                      borderRadius: '6px',
                      backgroundColor: theme.bgSubtle,
                      color: theme.textMain,
                      border: `1px solid ${theme.borderLight}`,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <BookOpen size={13} />
                    <span>Journal Entry</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInvoiceViewMode('list')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '6px',
                      backgroundColor: theme.bgSubtle,
                      color: theme.textMuted,
                      border: `1px solid ${theme.borderLight}`,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <ArrowLeft size={13} />
                    <span>Back</span>
                  </button>
                </div>
              </div>

              {/* 2-Column Header (Matches Whiteboard Layout) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '1.8rem',
                  backgroundColor: theme.bgSubtle,
                  padding: '1.6rem',
                  borderRadius: '10px',
                  border: `1px solid ${theme.borderLight}`,
                  marginBottom: '1.8rem',
                }}
              >
                {/* Left Column: Customer Invoice No., Customer Name, Status Badges */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted, marginBottom: '0.4rem' }}>
                      Customer Invoice No. <span style={{ fontSize: '0.74rem', color: theme.textDim }}>(Auto generated sequence +1 of last bill)</span>
                    </label>
                    <input
                      type="text"
                      value={invoiceFormData.id}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, id: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.85rem',
                        borderRadius: '6px',
                        border: `1px solid ${theme.borderLight}`,
                        backgroundColor: theme.bgInput,
                        color: theme.accentGold,
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted, marginBottom: '0.4rem' }}>
                      Customer Name
                    </label>
                    <select
                      value={invoiceFormData.customerName}
                      onChange={(e) => {
                        const selected = contacts.find((c) => c.name === e.target.value);
                        setInvoiceFormData({
                          ...invoiceFormData,
                          customerName: e.target.value,
                          contactId: selected?.id || invoiceFormData.contactId
                        });
                      }}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.85rem',
                        borderRadius: '6px',
                        border: `1px solid ${theme.borderLight}`,
                        backgroundColor: theme.bgInput,
                        color: theme.textMain,
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        outline: 'none',
                      }}
                    >
                      {contacts.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} {c.type ? `(${c.type})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted, marginBottom: '0.4rem' }}>
                      Payment Status
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          padding: '0.35rem 0.85rem',
                          borderRadius: '6px',
                          backgroundColor: invoiceFormData.status === 'Paid' ? '#10b981' : theme.bgInput,
                          color: invoiceFormData.status === 'Paid' ? '#ffffff' : theme.textDim,
                          border: `1px solid ${invoiceFormData.status === 'Paid' ? '#10b981' : theme.borderLight}`,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        Paid
                      </span>
                      <span
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          padding: '0.35rem 0.85rem',
                          borderRadius: '6px',
                          backgroundColor: invoiceFormData.status === 'Partial' ? '#f59e0b' : theme.bgInput,
                          color: invoiceFormData.status === 'Partial' ? '#0E0D0C' : theme.textDim,
                          border: `1px solid ${invoiceFormData.status === 'Partial' ? '#f59e0b' : theme.borderLight}`,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        Partial
                      </span>
                      <span
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          padding: '0.35rem 0.85rem',
                          borderRadius: '6px',
                          backgroundColor: invoiceFormData.status === 'Not Paid' ? '#ef4444' : theme.bgInput,
                          color: invoiceFormData.status === 'Not Paid' ? '#ffffff' : theme.textDim,
                          border: `1px solid ${invoiceFormData.status === 'Not Paid' ? '#ef4444' : theme.borderLight}`,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        Not Paid
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Invoice Reference, Invoice Date, Due Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted, marginBottom: '0.4rem' }}>
                      Invoice Reference
                    </label>
                    <input
                      type="text"
                      value={invoiceFormData.reference}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, reference: e.target.value })}
                      placeholder="e.g. ARC-26-001"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.85rem',
                        borderRadius: '6px',
                        border: `1px solid ${theme.borderLight}`,
                        backgroundColor: theme.bgInput,
                        color: theme.textMain,
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted, marginBottom: '0.4rem' }}>
                      Invoice Date
                    </label>
                    <input
                      type="date"
                      value={invoiceFormData.date}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.85rem',
                        borderRadius: '6px',
                        border: `1px solid ${theme.borderLight}`,
                        backgroundColor: theme.bgInput,
                        color: theme.textMain,
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textMuted, marginBottom: '0.4rem' }}>
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={invoiceFormData.dueDate}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, dueDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.85rem',
                        borderRadius: '6px',
                        border: `1px solid ${theme.borderLight}`,
                        backgroundColor: theme.bgInput,
                        color: theme.textMain,
                        fontSize: '0.88rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Line Items Table: Sr. No., Product, Chart of Accounts (Sales), Budget Analytics, Qty, Unit Price, Total */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: theme.textMain, margin: 0 }}>
                    Invoice Lines
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddCustomerInvoiceLine}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.9rem',
                      borderRadius: '6px',
                      backgroundColor: theme.bgSubtle,
                      color: theme.accentGold,
                      border: `1px solid ${theme.borderLight}`,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} />
                    <span>Add Line Item</span>
                  </button>
                </div>

                <div style={{ overflowX: 'auto', border: `1px solid ${theme.borderLight}`, borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}` }}>
                        <th style={{ width: '50px', padding: '0.8rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textAlign: 'center' }}>Sr. No.</th>
                        <th style={{ padding: '0.8rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700 }}>Product</th>
                        <th style={{ padding: '0.8rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700 }}>Income / Sales Account</th>
                        <th style={{ padding: '0.8rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700 }}>Budget Analytic Account</th>
                        <th style={{ width: '85px', padding: '0.8rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textAlign: 'right' }}>Qty</th>
                        <th style={{ width: '120px', padding: '0.8rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textAlign: 'right' }}>Unit Price (₹)</th>
                        <th style={{ width: '120px', padding: '0.8rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textAlign: 'right' }}>Total (₹)</th>
                        <th style={{ width: '45px', padding: '0.8rem', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceFormData.items.map((item, idx) => (
                        <tr key={item.id || idx} style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                          <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600, color: theme.textMuted }}>
                            {item.srNo || idx + 1}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <select
                              value={item.product}
                              onChange={(e) => handleCustomerInvoiceLineChange(idx, 'product', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.45rem 0.65rem',
                                borderRadius: '5px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.84rem',
                                outline: 'none',
                              }}
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.name}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <select
                              value={item.chartOfAccount || 'Sales'}
                              onChange={(e) => handleCustomerInvoiceLineChange(idx, 'chartOfAccount', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.45rem 0.65rem',
                                borderRadius: '5px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.accentGold,
                                fontWeight: 700,
                                fontSize: '0.84rem',
                                outline: 'none',
                              }}
                            >
                              <option value="Sales">Sales (4010 - Furniture Sales Income)</option>
                              <option value="Showroom & Delivery Expense">Showroom & Delivery (5020)</option>
                              <option value="Service Revenue">Interior Assembly Service (4020)</option>
                            </select>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <select
                              value={item.budgetAnalytics}
                              onChange={(e) => handleCustomerInvoiceLineChange(idx, 'budgetAnalytics', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.45rem 0.65rem',
                                borderRadius: '5px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.84rem',
                                outline: 'none',
                              }}
                            >
                              {analyticAccounts.map((a) => (
                                <option key={a.id} value={a.name}>
                                  {a.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleCustomerInvoiceLineChange(idx, 'qty', e.target.value)}
                              style={{
                                width: '75px',
                                padding: '0.45rem 0.5rem',
                                textAlign: 'right',
                                borderRadius: '5px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.84rem',
                                outline: 'none',
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleCustomerInvoiceLineChange(idx, 'unitPrice', e.target.value)}
                              style={{
                                width: '110px',
                                padding: '0.45rem 0.5rem',
                                textAlign: 'right',
                                borderRadius: '5px',
                                border: `1px solid ${theme.borderLight}`,
                                backgroundColor: theme.bgInput,
                                color: theme.textMain,
                                fontSize: '0.84rem',
                                outline: 'none',
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: theme.accentGold }}>
                            ₹{(Number(item.total) || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomerInvoiceLine(idx)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#f87171',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Financial Summary Card (Matches Whiteboard Layout: Total, Paid Via Cash, Paid Via Bank, Amount Due) */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.4rem' }}>
                  <div
                    style={{
                      width: '340px',
                      backgroundColor: theme.bgSubtle,
                      padding: '1.2rem',
                      borderRadius: '8px',
                      border: `1px solid ${theme.borderLight}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: theme.textMain, fontWeight: 700 }}>
                      <span>Total:</span>
                      <span>₹{invoiceTotalAmount.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#34d399' }}>
                      <span>Paid Via Cash:</span>
                      <span>₹{Number(invoiceFormData.paidViaCash || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#60a5fa' }}>
                      <span>Paid Via Bank:</span>
                      <span>₹{Number(invoiceFormData.paidViaBank || 0).toLocaleString()}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: Number(invoiceFormData.amountDue) > 0 ? '#f87171' : '#34d399',
                        borderTop: `1px solid ${theme.borderLight}`,
                        paddingTop: '0.5rem',
                      }}
                    >
                      <span>Amount Due:</span>
                      <span>₹{Number(invoiceFormData.amountDue).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Auto Double-Entry Creation Notice (Flowchart Bottom Note) */}
                <div
                  style={{
                    marginTop: '1.5rem',
                    padding: '1rem 1.3rem',
                    borderRadius: '8px',
                    backgroundColor: '#10b98115',
                    border: '1px solid #10b98140',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                  }}
                >
                  <Sparkles size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: '#34d399', margin: '0 0 0.2rem 0' }}>
                      Auto Double-Entry Accounting Rule
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: theme.textMuted, margin: 0 }}>
                      As soon as the Customer Invoice is confirmed, a journal entry is created that will be visible in the Journal Entries section.
                      For Customer Invoices, the <strong>Sales</strong> chart of account is always set by default. The Journal Entry is always balanced (Debit: Debtor A/c, Credit: Sales A/c).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL 1: BILL PAYMENT (Vendor Settlement)
      ═══════════════════════════════════════════════════════════════ */}
      {paymentModalData && (
        <Modal
          isOpen={true}
          onClose={() => setPaymentModalData(null)}
          title={`Bill Payment: ${paymentModalData.billId}`}
        >
          <form onSubmit={handleConfirmBillPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '0.9rem',
                borderBottom: `1px solid ${theme.borderLight}`,
                flexWrap: 'wrap',
                gap: '0.8rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  type="submit"
                  style={{
                    padding: '0.5rem 1.2rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: theme.accentGold,
                    color: '#0E0D0C',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentModalData(null)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.borderLight}`,
                    backgroundColor: theme.bgSubtle,
                    color: theme.textMuted,
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setIsPrintMenuOpen(!isPrintMenuOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 0.8rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgSubtle,
                      color: theme.textMain,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Printer size={13} />
                    <span>Options</span>
                  </button>
                  {isPrintMenuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '105%',
                        left: 0,
                        backgroundColor: theme.bgCard,
                        border: `1px solid ${theme.borderLight}`,
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        zIndex: 9999,
                        minWidth: '130px',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          window.print();
                          setIsPrintMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.85rem',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          color: theme.textMain,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                        }}
                      >
                        <Printer size={13} />
                        <span>1. Print</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          showToast('Payment receipt sent to vendor email.');
                          setIsPrintMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.85rem',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          color: theme.textMain,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                        }}
                      >
                        <Send size={13} />
                        <span>2. Send</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '3px', backgroundColor: theme.bgSubtle, padding: '2px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', borderRadius: '4px', backgroundColor: theme.bgCard, color: theme.textMuted }}>Draft</span>
                <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', borderRadius: '4px', backgroundColor: theme.accentGold, color: '#0E0D0C', fontWeight: 700 }}>Confirm</span>
                <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', borderRadius: '4px', color: theme.textDim }}>Cancelled</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                  Payment Type
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingTop: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.84rem', cursor: 'pointer', color: theme.textMain }}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="Send"
                      checked={paymentModalData.paymentType === 'Send'}
                      onChange={() => setPaymentModalData({ ...paymentModalData, paymentType: 'Send' })}
                    />
                    <span>Send (Vendor Pay)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.84rem', cursor: 'pointer', color: theme.textMuted }}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="Receive"
                      checked={paymentModalData.paymentType === 'Receive'}
                      onChange={() => setPaymentModalData({ ...paymentModalData, paymentType: 'Receive' })}
                    />
                    <span>Receive</span>
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                  Partner
                </label>
                <input
                  type="text"
                  value={paymentModalData.partner}
                  disabled
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.borderLight}`,
                    backgroundColor: theme.bgSubtle,
                    color: theme.textMain,
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={paymentModalData.amount}
                  onChange={(e) => setPaymentModalData({ ...paymentModalData, amount: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.borderLight}`,
                    backgroundColor: theme.bgInput,
                    color: theme.accentGold,
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                  Payment Date *
                </label>
                <input
                  type="date"
                  required
                  value={paymentModalData.date}
                  onChange={(e) => setPaymentModalData({ ...paymentModalData, date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.borderLight}`,
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                  Payment Via
                </label>
                <select
                  value={paymentModalData.paymentVia}
                  onChange={(e) => setPaymentModalData({ ...paymentModalData, paymentVia: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.borderLight}`,
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                >
                  <option value="Razorpay Payouts">⚡ Razorpay Payouts (Direct Bank Transfer)</option>
                  <option value="Cash">Cash (Cash on Hand - 1010)</option>
                  <option value="HDFC Bank">HDFC Bank (Operating Bank A/c - 1020)</option>
                  <option value="ICICI Bank">ICICI Corporate Bank (1020)</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                  Memo <span style={{ fontSize: '0.74rem', color: theme.textDim }}>(Alpha Numeric Text)</span>
                </label>
                <input
                  type="text"
                  value={paymentModalData.memo}
                  onChange={(e) => setPaymentModalData({ ...paymentModalData, memo: e.target.value })}
                  placeholder="e.g. Settlement for DB/2026/0001"
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.borderLight}`,
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL 2: OPEN BILL JOURNAL ENTRY
      ═══════════════════════════════════════════════════════════════ */}
      {linkedJEModalData && (
        <Modal
          isOpen={true}
          onClose={() => setLinkedJEModalData(null)}
          title={`Open Journal Entry: ${linkedJEModalData.billId}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '0.8rem',
                borderBottom: `1px solid ${theme.borderLight}`,
              }}
            >
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: theme.accentGold,
                    color: '#0E0D0C',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  Post
                </button>
                <button
                  type="button"
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '6px',
                    backgroundColor: theme.bgSubtle,
                    color: theme.textMain,
                    border: `1px solid ${theme.borderLight}`,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  Reset to Draft
                </button>
              </div>

              <button
                type="button"
                onClick={() => setLinkedJEModalData(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  backgroundColor: theme.bgSubtle,
                  color: theme.textMain,
                  border: `1px solid ${theme.borderLight}`,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: theme.textMuted, display: 'block' }}>Accounting Date</span>
                <strong style={{ fontSize: '0.9rem', color: theme.textMain }}>{linkedJEModalData.date}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: theme.textMuted, display: 'block' }}>Journal</span>
                <strong style={{ fontSize: '0.9rem', color: theme.accentGold }}>{linkedJEModalData.journal}</strong>
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: `1px solid ${theme.borderLight}`, borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}` }}>
                    <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700 }}>Account</th>
                    <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700 }}>Partner</th>
                    <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textAlign: 'right' }}>Debit</th>
                    <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textAlign: 'right' }}>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedJEModalData.lines.map((line, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 600, color: theme.textMain }}>{line.account}</td>
                      <td style={{ padding: '0.8rem 1rem', color: theme.textMuted }}>{line.partner}</td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right', fontWeight: 700, color: line.debit > 0 ? theme.textMain : theme.textDim }}>
                        {line.debit > 0 ? `Rs. ${Number(line.debit).toLocaleString()}` : '—'}
                      </td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right', fontWeight: 700, color: line.credit > 0 ? theme.textMain : theme.textDim }}>
                        {line.credit > 0 ? `Rs. ${Number(line.credit).toLocaleString()}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: theme.bgSubtle, fontWeight: 700 }}>
                    <td colSpan={2} style={{ padding: '0.75rem 1rem' }}>Total Balanced:</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Rs. {Number(linkedJEModalData.amount).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Rs. {Number(linkedJEModalData.amount).toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL 3: INVOICE PAYMENT (Customer Payment Receipt)
          Matches Right Screen in Flowchart Diagram!
      ═══════════════════════════════════════════════════════════════ */}
      {customerPaymentModalData && (
        <Modal
          isOpen={true}
          onClose={() => setCustomerPaymentModalData(null)}
          title={`Invoice Payment: ${customerPaymentModalData.invoiceId}`}
        >
          <form onSubmit={handleConfirmCustomerPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
            {/* Top Toolbar: [Confirm] [Cancel]  Options (1. Print, 2. Send)  Status Pipeline: [Draft -> Confirm -> Cancelled] */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '0.9rem',
                borderBottom: `1px solid ${theme.borderLight}`,
                flexWrap: 'wrap',
                gap: '0.8rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  type="submit"
                  style={{
                    padding: '0.5rem 1.2rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: theme.accentGold,
                    color: '#0E0D0C',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerPaymentModalData(null)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.borderLight}`,
                    backgroundColor: theme.bgSubtle,
                    color: theme.textMuted,
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                {/* Print / Send dropdown menu */}
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setIsCustomerPrintMenuOpen(!isCustomerPrintMenuOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 0.8rem',
                      borderRadius: '6px',
                      border: `1px solid ${theme.borderLight}`,
                      backgroundColor: theme.bgSubtle,
                      color: theme.textMain,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Printer size={13} />
                    <span>Options</span>
                  </button>
                  {isCustomerPrintMenuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '105%',
                        left: 0,
                        backgroundColor: theme.bgCard,
                        border: `1px solid ${theme.borderLight}`,
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        zIndex: 9999,
                        minWidth: '130px',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          window.print();
                          setIsCustomerPrintMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.85rem',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          color: theme.textMain,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                        }}
                      >
                        <Printer size={13} />
                        <span>1. Print</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          showToast('Receipt sent to customer email.');
                          setIsCustomerPrintMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.85rem',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          color: theme.textMain,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                        }}
                      >
                        <Send size={13} />
                        <span>2. Send</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Pipeline: [Draft] -> [Confirm] -> [Cancelled] */}
              <div style={{ display: 'flex', gap: '3px', backgroundColor: theme.bgSubtle, padding: '2px', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', borderRadius: '4px', backgroundColor: theme.bgCard, color: theme.textMuted }}>Draft</span>
                <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', borderRadius: '4px', backgroundColor: theme.accentGold, color: '#0E0D0C', fontWeight: 700 }}>Confirm</span>
                <span style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', borderRadius: '4px', color: theme.textDim }}>Cancelled</span>
              </div>
            </div>

            {/* Form Fields (Matches Flowchart Invoice Payment screen) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              {/* Payment Type: Send vs Receive */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                  Payment Type
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingTop: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.84rem', cursor: 'pointer', color: theme.textMuted }}>
                    <input
                      type="radio"
                      name="customerPaymentType"
                      value="Send"
                      checked={customerPaymentModalData.paymentType === 'Send'}
                      onChange={() => setCustomerPaymentModalData({ ...customerPaymentModalData, paymentType: 'Send' })}
                    />
                    <span>Send</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.84rem', cursor: 'pointer', color: theme.textMain }}>
                    <input
                      type="radio"
                      name="customerPaymentType"
                      value="Receive"
                      checked={customerPaymentModalData.paymentType === 'Receive'}
                      onChange={() => setCustomerPaymentModalData({ ...customerPaymentModalData, paymentType: 'Receive' })}
                    />
                    <span>Receive (Customer Receipt)</span>
                  </label>
                </div>
              </div>

              {/* Partner */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                  Partner
                </label>
                <input
                  type="text"
                  value={customerPaymentModalData.partner}
                  disabled
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.borderLight}`,
                    backgroundColor: theme.bgSubtle,
                    color: theme.textMain,
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Amount */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={customerPaymentModalData.amount}
                  onChange={(e) => setCustomerPaymentModalData({ ...customerPaymentModalData, amount: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.borderLight}`,
                    backgroundColor: theme.bgInput,
                    color: theme.accentGold,
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Payment Date */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                  Payment Date *
                </label>
                <input
                  type="date"
                  required
                  value={customerPaymentModalData.date}
                  onChange={(e) => setCustomerPaymentModalData({ ...customerPaymentModalData, date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.borderLight}`,
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Payment Via */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                  Payment Via
                </label>
                <select
                  value={customerPaymentModalData.paymentVia}
                  onChange={(e) => setCustomerPaymentModalData({ ...customerPaymentModalData, paymentVia: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.borderLight}`,
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                >
                  <option value="Razorpay">⚡ Razorpay (UPI, Google Pay, Credit/Debit Cards, NetBanking)</option>
                  <option value="Cash">Cash (Cash on Hand - 1010)</option>
                  <option value="HDFC Bank">HDFC Bank (Operating Bank A/c - 1020)</option>
                  <option value="ICICI Bank">ICICI Corporate Bank (1020)</option>
                </select>
              </div>

              {/* Note / Memo */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: theme.textMuted, marginBottom: '0.45rem' }}>
                  Note <span style={{ fontSize: '0.74rem', color: theme.textDim }}>(Alpha Numeric Text)</span>
                </label>
                <input
                  type="text"
                  value={customerPaymentModalData.memo}
                  onChange={(e) => setCustomerPaymentModalData({ ...customerPaymentModalData, memo: e.target.value })}
                  placeholder="e.g. Settlement for INV/2026/0001"
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.borderLight}`,
                    backgroundColor: theme.bgInput,
                    color: theme.textMain,
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL 4: OPEN CUSTOMER INVOICE JOURNAL ENTRY
      ═══════════════════════════════════════════════════════════════ */}
      {linkedCustomerInvoiceJEModalData && (
        <Modal
          isOpen={true}
          onClose={() => setLinkedCustomerInvoiceJEModalData(null)}
          title={`Open Journal Entry: ${linkedCustomerInvoiceJEModalData.invoiceId}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '0.8rem',
                borderBottom: `1px solid ${theme.borderLight}`,
              }}
            >
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: theme.accentGold,
                    color: '#0E0D0C',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  Post
                </button>
                <button
                  type="button"
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '6px',
                    backgroundColor: theme.bgSubtle,
                    color: theme.textMain,
                    border: `1px solid ${theme.borderLight}`,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  Reset to Draft
                </button>
              </div>

              <button
                type="button"
                onClick={() => setLinkedCustomerInvoiceJEModalData(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  backgroundColor: theme.bgSubtle,
                  color: theme.textMain,
                  border: `1px solid ${theme.borderLight}`,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={13} />
                <span>Back</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: theme.textMuted, display: 'block' }}>Accounting Date</span>
                <strong style={{ fontSize: '0.9rem', color: theme.textMain }}>{linkedCustomerInvoiceJEModalData.date}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: theme.textMuted, display: 'block' }}>Journal</span>
                <strong style={{ fontSize: '0.9rem', color: theme.accentGold }}>{linkedCustomerInvoiceJEModalData.journal}</strong>
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: `1px solid ${theme.borderLight}`, borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ backgroundColor: theme.bgSubtle, borderBottom: `1px solid ${theme.borderLight}` }}>
                    <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700 }}>Account</th>
                    <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700 }}>Partner</th>
                    <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textAlign: 'right' }}>Debit</th>
                    <th style={{ padding: '0.75rem 1rem', color: theme.textDim, fontSize: '0.74rem', fontWeight: 700, textAlign: 'right' }}>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedCustomerInvoiceJEModalData.lines.map((line, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 600, color: theme.textMain }}>{line.account}</td>
                      <td style={{ padding: '0.8rem 1rem', color: theme.textMuted }}>{line.partner}</td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right', fontWeight: 700, color: line.debit > 0 ? theme.textMain : theme.textDim }}>
                        {line.debit > 0 ? `Rs. ${Number(line.debit).toLocaleString()}` : '—'}
                      </td>
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right', fontWeight: 700, color: line.credit > 0 ? theme.textMain : theme.textDim }}>
                        {line.credit > 0 ? `Rs. ${Number(line.credit).toLocaleString()}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: theme.bgSubtle, fontWeight: 700 }}>
                    <td colSpan={2} style={{ padding: '0.75rem 1rem' }}>Total Balanced:</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Rs. {Number(linkedCustomerInvoiceJEModalData.amount).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Rs. {Number(linkedCustomerInvoiceJEModalData.amount).toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p style={{ fontSize: '0.76rem', color: theme.textMuted, margin: 0, fontStyle: 'italic' }}>
              * For customer invoices, always Sales chart of account is set by default (Debit Debtor A/c, Credit Sales A/c). The Journal Entry is always balanced.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
