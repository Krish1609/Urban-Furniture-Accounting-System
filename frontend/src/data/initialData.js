// Initial Seed Data for Urban Furniture: Accounting System (FurniLedger)

export const INITIAL_CHART_OF_ACCOUNTS = [
  { id: '1010', code: '1010', name: 'Cash in Hand', type: 'Asset', balance: 25000 },
  { id: '1020', code: '1020', name: 'HDFC Bank Account', type: 'Asset', balance: 145000 },
  { id: '1100', code: '1100', name: 'Accounts Receivable (Debtors)', type: 'Asset', balance: 42000 },
  { id: '1200', code: '1200', name: 'Furniture Inventory Stock', type: 'Asset', balance: 88000 },
  { id: '2010', code: '2010', name: 'Accounts Payable (Creditors)', type: 'Liability', balance: 35000 },
  { id: '2050', code: '2050', name: 'GST / Taxes Payable', type: 'Liability', balance: 12000 },
  { id: '3010', code: '3010', name: "Owner's Capital", type: 'Capital', balance: 200000 },
  { id: '4010', code: '4010', name: 'Furniture Sales Income', type: 'Income', balance: 95000 },
  { id: '5010', code: '5010', name: 'Raw Materials & Purchase Expense', type: 'Expense', balance: 42000 },
  { id: '5020', code: '5020', name: 'Showroom & Delivery Expense', type: 'Expense', balance: 8000 },
];

export const INITIAL_JOURNALS = [
  { id: 'J-SALES', name: 'Customer Sales Journal', code: 'INV', type: 'Sales', defaultDebit: '1100', defaultCredit: '4010' },
  { id: 'J-PURCH', name: 'Vendor Purchase Journal', code: 'BILL', type: 'Purchase', defaultDebit: '5010', defaultCredit: '2010' },
  { id: 'J-BANK', name: 'Bank Operations Journal', code: 'BNK', type: 'Bank', defaultDebit: '1020', defaultCredit: '1020' },
  { id: 'J-CASH', name: 'Cash Receipts & Payments', code: 'CSH', type: 'Cash', defaultDebit: '1010', defaultCredit: '1010' },
  { id: 'J-GEN', name: 'General Journal Entries', code: 'GEN', type: 'General', defaultDebit: '', defaultCredit: '' },
];

export const INITIAL_CONTACTS = [
  {
    id: 'cnt-1',
    name: 'Azure Furniture Supplies',
    type: 'Vendor',
    email: 'azure@furnituresupplies.com',
    mobile: '+91 98250 11223',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380015',
    status: 'Active',
    totalBilled: 75000,
    totalPaid: 50000,
    dueAmount: 25000,
  },
  {
    id: 'cnt-2',
    name: 'Nimesh Pathak',
    type: 'Customer',
    email: 'nimesh.pathak@client.com',
    mobile: '+91 99090 44556',
    city: 'Surat',
    state: 'Gujarat',
    pincode: '395007',
    status: 'Active',
    totalBilled: 45000,
    totalPaid: 30000,
    dueAmount: 15000,
  },
  {
    id: 'cnt-3',
    name: 'Rahul Sharma',
    type: 'Vendor',
    email: 'rahul.timber@sharmawood.in',
    mobile: '+91 94280 77889',
    city: 'Vadodara',
    state: 'Gujarat',
    pincode: '390001',
    status: 'Active',
    totalBilled: 32000,
    totalPaid: 22000,
    dueAmount: 10000,
  },
  {
    id: 'cnt-4',
    name: 'Priya Mehta',
    type: 'Customer',
    email: 'priya.mehta@studio.com',
    mobile: '+91 98791 22334',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    status: 'Active',
    totalBilled: 68000,
    totalPaid: 68000,
    dueAmount: 0,
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Ergonomic Office Chair',
    type: 'Goods',
    category: 'Chairs',
    salesPrice: 4500,
    costPrice: 2800,
    taxRate: 18,
    stockQty: 38,
    sku: 'CHR-OFF-01',
  },
  {
    id: 'prod-2',
    name: 'Solid Teak Wooden Table',
    type: 'Goods',
    category: 'Tables',
    salesPrice: 18500,
    costPrice: 12000,
    taxRate: 18,
    stockQty: 14,
    sku: 'TBL-WOD-02',
  },
  {
    id: 'prod-3',
    name: 'Nordic Velvet 3-Seater Sofa',
    type: 'Goods',
    category: 'Sofas',
    salesPrice: 34000,
    costPrice: 22500,
    taxRate: 18,
    stockQty: 8,
    sku: 'SOF-NORD-03',
  },
  {
    id: 'prod-4',
    name: '6-Seater Royal Dining Table Set',
    type: 'Goods',
    category: 'Dining',
    salesPrice: 42000,
    costPrice: 28000,
    taxRate: 18,
    stockQty: 5,
    sku: 'DIN-ROY-04',
  },
  {
    id: 'prod-5',
    name: 'Interior Assembly & Polishing',
    type: 'Service',
    category: 'Services',
    salesPrice: 2500,
    costPrice: 800,
    taxRate: 18,
    stockQty: 999,
    sku: 'SRV-ASMB-05',
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'PO-2026-001',
    type: 'Purchase',
    contactId: 'cnt-1',
    contactName: 'Azure Furniture Supplies',
    date: '2026-08-28',
    status: 'Billed',
    items: [
      { productId: 'prod-1', productName: 'Ergonomic Office Chair', qty: 10, unitPrice: 2800, total: 28000 },
      { productId: 'prod-2', productName: 'Solid Teak Wooden Table', qty: 2, unitPrice: 12000, total: 24000 }
    ],
    totalAmount: 52000,
  },
  {
    id: 'SO-2026-001',
    type: 'Sale',
    contactId: 'cnt-2',
    contactName: 'Nimesh Pathak',
    date: '2026-09-01',
    status: 'Invoiced',
    items: [
      { productId: 'prod-1', productName: 'Ergonomic Office Chair', qty: 5, unitPrice: 4500, total: 22500 }
    ],
    totalAmount: 22500,
  }
];

export const INITIAL_INVOICES = [
  {
    id: 'BILL-001',
    type: 'Vendor Bill',
    orderId: 'PO-2026-001',
    contactId: 'cnt-1',
    contactName: 'Azure Furniture Supplies',
    date: '2026-08-29',
    dueDate: '2026-09-29',
    status: 'Paid',
    amount: 52000,
    paidAmount: 52000,
    paymentMethod: 'HDFC Bank',
  },
  {
    id: 'INV-001',
    type: 'Customer Invoice',
    orderId: 'SO-2026-001',
    contactId: 'cnt-2',
    contactName: 'Nimesh Pathak',
    date: '2026-09-02',
    dueDate: '2026-09-17',
    status: 'Paid',
    amount: 22500,
    paidAmount: 22500,
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'INV-002',
    type: 'Customer Invoice',
    orderId: '',
    contactId: 'cnt-2',
    contactName: 'Nimesh Pathak',
    date: '2026-09-04',
    dueDate: '2026-09-20',
    status: 'Unpaid',
    amount: 15000,
    paidAmount: 0,
    paymentMethod: '',
  }
];

export const INITIAL_JOURNAL_ENTRIES = [
  {
    id: 'JE-001',
    date: '2026-08-29',
    journal: 'Purchase Journal',
    ref: 'BILL-001 (Azure Furniture)',
    status: 'Posted',
    lines: [
      { accountCode: '5010', accountName: 'Raw Materials & Purchase Expense', debit: 52000, credit: 0 },
      { accountCode: '2010', accountName: 'Accounts Payable (Creditors)', debit: 0, credit: 52000 },
    ]
  },
  {
    id: 'JE-002',
    date: '2026-08-30',
    journal: 'Bank Journal',
    ref: 'Payment to Azure Furniture',
    status: 'Posted',
    lines: [
      { accountCode: '2010', accountName: 'Accounts Payable (Creditors)', debit: 52000, credit: 0 },
      { accountCode: '1020', accountName: 'HDFC Bank Account', debit: 0, credit: 52000 },
    ]
  },
  {
    id: 'JE-003',
    date: '2026-09-02',
    journal: 'Sales Journal',
    ref: 'INV-001 (Nimesh Pathak - 5 Office Chairs)',
    status: 'Posted',
    lines: [
      { accountCode: '1100', accountName: 'Accounts Receivable (Debtors)', debit: 22500, credit: 0 },
      { accountCode: '4010', accountName: 'Furniture Sales Income', debit: 0, credit: 22500 },
    ]
  },
  {
    id: 'JE-004',
    date: '2026-09-03',
    journal: 'Bank Journal',
    ref: 'Receipt from Nimesh Pathak',
    status: 'Posted',
    lines: [
      { accountCode: '1020', accountName: 'HDFC Bank Account', debit: 22500, credit: 0 },
      { accountCode: '1100', accountName: 'Accounts Receivable (Debtors)', debit: 0, credit: 22500 },
    ]
  }
];

export const INITIAL_ANALYTIC_ACCOUNTS = [
  { id: 'an-1', name: 'Commercial Office Projects', code: 'AN-OFFICE', type: 'Both', budgetAllocated: 150000, spent: 52000 },
  { id: 'an-2', name: 'Residential Luxury Villas', code: 'AN-VILLA', type: 'Income', budgetAllocated: 200000, spent: 68000 },
  { id: 'an-3', name: 'Showroom Renovation & Logistics', code: 'AN-SHOWROOM', type: 'Expense', budgetAllocated: 40000, spent: 18000 },
];

export const INITIAL_BUDGETS = [
  {
    id: 'bdg-1',
    name: 'Q3 2026 Furniture Operations',
    period: 'Jul 2026 - Sep 2026',
    responsible: 'Admin (Business Owner)',
    plannedAmount: 180000,
    actualAmount: 110000,
    variance: 70000,
    analyticAccount: 'Commercial Office Projects',
  },
  {
    id: 'bdg-2',
    name: 'Showroom Expansion Budget',
    period: 'Aug 2026 - Oct 2026',
    responsible: 'Invoicing User (Accountant)',
    plannedAmount: 50000,
    actualAmount: 18000,
    variance: 32000,
    analyticAccount: 'Showroom Renovation & Logistics',
  }
];
