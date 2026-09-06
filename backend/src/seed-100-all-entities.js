import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from './lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const INDIAN_LOCATIONS = [
  { city: 'Mumbai', state: 'Maharashtra', code: '27', pincode: '400001' },
  { city: 'Pune', state: 'Maharashtra', code: '27', pincode: '411001' },
  { city: 'Bengaluru', state: 'Karnataka', code: '29', pincode: '560001' },
  { city: 'New Delhi', state: 'Delhi', code: '07', pincode: '110001' },
  { city: 'Hyderabad', state: 'Telangana', code: '36', pincode: '500001' },
  { city: 'Ahmedabad', state: 'Gujarat', code: '24', pincode: '380001' },
  { city: 'Chennai', state: 'Tamil Nadu', code: '33', pincode: '600001' },
  { city: 'Kolkata', state: 'West Bengal', code: '19', pincode: '700001' },
  { city: 'Jaipur', state: 'Rajasthan', code: '08', pincode: '302001' },
  { city: 'Surat', state: 'Gujarat', code: '24', pincode: '395001' },
  { city: 'Lucknow', state: 'Uttar Pradesh', code: '09', pincode: '226001' },
  { city: 'Chandigarh', state: 'Punjab', code: '04', pincode: '160001' },
  { city: 'Kochi', state: 'Kerala', code: '32', pincode: '682001' },
  { city: 'Indore', state: 'Madhya Pradesh', code: '23', pincode: '452001' }
];

const COMPANY_PREFIXES = [
  'Godrej Interio', 'SpaceCraft', 'Studio Morphogenesis', 'Prestige Living', 'UrbanNest', 'Royal Oak Interiors',
  'DecorCraft', 'Apex Infrastructure', 'Vanguard Spaces', 'Heritage Woodcraft', 'Amber Living', 'Dwellings Studio',
  'Blueprint Architects', 'Zenith Commercial Fitouts', 'Symphony Design Lab', 'Opus Home Decor', 'Habitat Concept',
  'Nova Workspace', 'Aura Luxury Living', 'Signature Realty & Furnishings', 'Paramount Timber Traders', 'Indus Wood Industries',
  'Kashmir Walnut Art', 'Malabar Teak Exporters', 'Shree Ram Hardware', 'Nilkamal Projects', 'Century Ply Solutions',
  'Greenply Associates', 'Asian Paints Decor', 'Duroflex Commercial', 'FabIndia Living', 'Chumbak Design Studio'
];

const INDIVIDUAL_NAMES = [
  'Rajesh Singhania', 'Priya Deshmukh', 'Vikramaditya Oberoi', 'Ananya Bhattacharya', 'Kunal Merchant',
  'Deepak Malhotra', 'Snehal Kulkarni', 'Arjun Nambiar', 'Pooja Agarwal', 'Siddharth Varma',
  'Meenakshi Sundaram', 'Harish Chhabra', 'Bhavna Parekh', 'Rohan Tendon', 'Gaurav Kothari',
  'Divya Jhaveri', 'Manish Godbole', 'Swati Bansal', 'Ritesh Ganguly', 'Sunita Hegde',
  'Naveen Rastogi', 'Kavita Pillai', 'Tanmay Dixit', 'Shreya Shinde', 'Alok Upadhyay'
];

const CONTACT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=250&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=250&auto=format&fit=crop&q=80'
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomPhone() {
  const p = getRandom(['98', '97', '99', '96', '95', '93', '91', '88', '89']);
  const num = Math.floor(10000000 + Math.random() * 90000000).toString().substring(0, 8);
  return `+91 ${p}${num.substring(0, 3)} ${num.substring(3)}`;
}

function getRandomDate(monthsBack = 6) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * (monthsBack * 30)));
  return d;
}

function generateGSTIN(stateCode) {
  const chars = 'ABCDE';
  const pan = `${chars[Math.floor(Math.random()*chars.length)]}${chars[Math.floor(Math.random()*chars.length)]}${chars[Math.floor(Math.random()*chars.length)]}P${chars[Math.floor(Math.random()*chars.length)]}${Math.floor(1000 + Math.random()*9000)}Z${Math.floor(1+Math.random()*9)}`;
  return `${stateCode}${pan}`;
}

async function seed100AllEntities() {
  console.log('🚀 Starting ~100 records check/generation across all accounting entities...\n');

  const org = await prisma.organizations.findFirst({
    where: { name: 'Urban Furniture' }
  }) || await prisma.organizations.findFirst();

  if (!org) throw new Error('Organization not found.');
  console.log(`🏢 Target Organization: "${org.name}" (${org.id})\n`);

  // 1. ANALYTIC ACCOUNTS
  console.log('📊 1. Checking Analytic Accounts / Cost Centers...');
  const ANALYTIC_NAMES = [
    { code: 'PRJ-MUM-01', name: 'Bandra Luxury Villa Interior', type: 'project' },
    { code: 'PRJ-BLR-02', name: 'Whitefield IT Campus Furnishing', type: 'project' },
    { code: 'PRJ-DEL-03', name: 'Gurugram High-Rise Penthouse', type: 'project' },
    { code: 'PRJ-HYD-04', name: 'Hitec City Corporate Office Fitout', type: 'project' },
    { code: 'PRJ-PUN-05', name: 'Koregaon Park Cafe & Lounge', type: 'project' },
    { code: 'BR-MUM-HQ', name: 'Mumbai Central Flagship Showroom', type: 'cost_center' },
    { code: 'BR-BLR-01', name: 'Indiranagar Experience Studio', type: 'cost_center' },
    { code: 'BR-DEL-01', name: 'South Extension Furniture Gallery', type: 'cost_center' },
    { code: 'BR-AHM-01', name: 'SG Highway Showroom', type: 'cost_center' },
    { code: 'BR-PUN-01', name: 'Senapati Bapat Road Store', type: 'cost_center' },
    { code: 'MFG-THN-01', name: 'Thane Central Woodworking Factory', type: 'manufacturing' },
    { code: 'MFG-SUR-02', name: 'Surat Metal & Coating Plant', type: 'manufacturing' },
    { code: 'EXP-MKT-25', name: 'Digital & Architectural Marketing', type: 'expense' },
    { code: 'EXP-LOG-25', name: 'Pan-India Freight & Logistics', type: 'expense' },
    { code: 'EXP-RND-25', name: 'Ergonomic Product R&D Division', type: 'expense' },
    { code: 'PRJ-JAI-06', name: 'Jaipur Heritage Resort Restoration', type: 'project' },
    { code: 'PRJ-KOC-07', name: 'Kochi Waterfront Villa Design', type: 'project' },
    { code: 'PRJ-GOA-08', name: 'Goa Boutique Hotel Suite Decor', type: 'project' },
    { code: 'EXP-CSR-25', name: 'Sustainable Forestry & CSR', type: 'expense' },
    { code: 'EXP-IT-25', name: 'Cloud ERP & Digital Infrastructure', type: 'expense' }
  ];

  for (const an of ANALYTIC_NAMES) {
    const existing = await prisma.analytic_accounts.findFirst({
      where: { organization_id: org.id, code: an.code }
    });
    if (!existing) {
      await prisma.analytic_accounts.create({
        data: {
          organization_id: org.id,
          code: an.code,
          name: an.name,
          type: an.type,
          description: `${an.name} (${an.type.toUpperCase()}) for Urban Furniture operations.`,
          is_active: true
        }
      });
    }
  }
  const allAnalytics = await prisma.analytic_accounts.findMany({ where: { organization_id: org.id } });
  console.log(`   ✅ Total Analytic Accounts: ${allAnalytics.length}\n`);

  // Load Accounts & Journals Map
  const accounts = await prisma.chart_of_accounts.findMany({ where: { organization_id: org.id } });
  const accountMap = {};
  accounts.forEach(a => {
    accountMap[a.account_code] = a.id;
    accountMap[a.name] = a.id;
  });

  const journals = await prisma.journals.findMany({ where: { organization_id: org.id } });
  const journalMap = {};
  journals.forEach(j => {
    journalMap[j.code] = j.id;
    journalMap[j.type] = j.id;
  });

  const allProducts = await prisma.products.findMany({
    where: { organization_id: org.id, is_active: true },
    include: { product_categories: true }
  });

  // 2. CONTACTS CHECK
  const currentContactCount = await prisma.contacts.count({ where: { organization_id: org.id } });
  console.log(`📇 2. Contacts count: ${currentContactCount} (Target: 100+)`);
  if (currentContactCount < 100) {
    const existingContacts = await prisma.contacts.findMany({
      where: { organization_id: org.id },
      select: { display_name: true }
    });
    const usedContactNames = new Set(existingContacts.map(c => c.display_name.toLowerCase()));

    const toAdd = 100 - currentContactCount;
    for (let i = 1; i <= toAdd; i++) {
      const isVendor = i % 3 === 0;
      const isCompany = i % 2 === 0;
      const loc = getRandom(INDIAN_LOCATIONS);

      let displayName;
      if (isCompany) {
        const pfx = COMPANY_PREFIXES[(i - 1) % COMPANY_PREFIXES.length];
        const suffix = isVendor ? 'Supplies & Timber Ltd' : 'Interiors & Projects Pvt Ltd';
        displayName = `${pfx} ${suffix}`;
      } else {
        displayName = `${INDIVIDUAL_NAMES[(i - 1) % INDIVIDUAL_NAMES.length]} (Client #${i})`;
      }

      if (usedContactNames.has(displayName.toLowerCase())) {
        displayName = `${displayName} ${i}`;
      }
      usedContactNames.add(displayName.toLowerCase());

      const slug = displayName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
      const email = `contact.${slug}${i}@${isVendor ? 'vendorhub.in' : 'clientmail.in'}`;
      const avatar = CONTACT_AVATARS[i % CONTACT_AVATARS.length];

      const createdContact = await prisma.contacts.create({
        data: {
          organization_id: org.id,
          contact_type: isVendor ? 'vendor' : 'customer',
          display_name: displayName,
          legal_name: displayName,
          tax_identifier: generateGSTIN(loc.code),
          email,
          phone: getRandomPhone(),
          image_url: avatar,
          website: `https://${slug}.in`,
          is_active: true
        }
      });

      await prisma.contact_addresses.create({
        data: {
          contact_id: createdContact.id,
          address_type: 'billing',
          line1: `Suite ${100 + Math.floor(Math.random()*800)}, Commercial Hub`,
          line2: `${loc.city} Industrial Zone`,
          city: loc.city,
          state: loc.state,
          postal_code: loc.pincode,
          country_code: 'IN',
          is_default: true
        }
      });
    }
  }
  const allContacts = await prisma.contacts.findMany({ where: { organization_id: org.id } });
  const customers = allContacts.filter(c => c.contact_type === 'customer');
  const vendors = allContacts.filter(c => c.contact_type === 'vendor');
  console.log(`   ✅ Contacts ready: ${allContacts.length}\n`);

  // 3. COMMERCIAL DOCUMENTS CHECK
  const currentDocCount = await prisma.commercial_documents.count({ where: { organization_id: org.id } });
  console.log(`📑 3. Commercial Documents count: ${currentDocCount} (Target: 100)`);
  if (currentDocCount < 100) {
    const docTypes = [
      { type: 'customer_invoice', pfx: 'INV', count: 45, contacts: customers, statusList: ['posted', 'paid', 'posted', 'draft'] },
      { type: 'sales_order', pfx: 'SO', count: 30, contacts: customers, statusList: ['confirmed', 'delivered', 'confirmed', 'draft'] },
      { type: 'vendor_bill', pfx: 'BILL', count: 15, contacts: vendors, statusList: ['posted', 'paid', 'posted'] },
      { type: 'purchase_order', pfx: 'PO', count: 10, contacts: vendors, statusList: ['confirmed', 'received', 'confirmed'] }
    ];

    let docNumberSeq = 2001;
    for (const group of docTypes) {
      for (let i = 1; i <= group.count; i++) {
        const contact = getRandom(group.contacts);
        const docDate = getRandomDate(7);
        const dueDate = new Date(docDate);
        dueDate.setDate(dueDate.getDate() + 30);
        const status = getRandom(group.statusList);
        const docNumber = `${group.pfx}-2025-${String(docNumberSeq++).padStart(5, '0')}`;

        const lineCount = 1 + Math.floor(Math.random() * 3);
        let subtotal = 0;
        let totalTax = 0;
        const linesData = [];

        for (let l = 0; l < lineCount; l++) {
          const product = getRandom(allProducts);
          const qty = 1 + Math.floor(Math.random() * 5);
          const unitPrice = group.type.includes('vendor') || group.type.includes('purchase')
            ? Number(product.cost_price)
            : Number(product.sales_price);

          const lineSubtotal = unitPrice * qty;
          const lineTax = Math.round(lineSubtotal * 0.18);
          const lineTotal = lineSubtotal + lineTax;

          subtotal += lineSubtotal;
          totalTax += lineTax;

          linesData.push({
            product_id: product.id,
            description: `${product.name} (Qty: ${qty})`,
            quantity: qty,
            unit_price: unitPrice,
            line_tax_amount: lineTax,
            line_total_amount: lineTotal,
            analytic_account_id: getRandom(allAnalytics).id
          });
        }

        await prisma.commercial_documents.create({
          data: {
            organization_id: org.id,
            contact_id: contact.id,
            document_type: group.type,
            document_number: docNumber,
            document_date: docDate,
            due_date: dueDate,
            currency_code: 'INR',
            status,
            subtotal_amount: subtotal,
            tax_amount: totalTax,
            total_amount: subtotal + totalTax,
            commercial_document_lines: { create: linesData }
          }
        });
      }
    }
  }
  const allDocs = await prisma.commercial_documents.findMany({ where: { organization_id: org.id } });
  console.log(`   ✅ Commercial Documents ready: ${allDocs.length}\n`);

  // 4. PAYMENTS CHECK
  const currentPaymentsCount = await prisma.payments.count({ where: { organization_id: org.id } });
  console.log(`💳 4. Payments count: ${currentPaymentsCount} (Target: 100)`);
  if (currentPaymentsCount < 100) {
    const postedInvoices = allDocs.filter(d => d.document_type === 'customer_invoice');
    const postedBills = allDocs.filter(d => d.document_type === 'vendor_bill');
    const PAYMENT_METHODS = ['bank_transfer', 'upi', 'cheque', 'credit_card', 'cash'];

    let paySeq = 2001;
    for (let i = 0; i < 70; i++) {
      const targetDoc = postedInvoices[i % postedInvoices.length];
      const amount = Number(targetDoc.total_amount);
      const payDate = new Date(targetDoc.document_date);
      payDate.setDate(payDate.getDate() + Math.floor(1 + Math.random() * 15));

      await prisma.payments.create({
        data: {
          organization_id: org.id,
          contact_id: targetDoc.contact_id,
          payment_number: `PAY-REC-2025-${String(paySeq++).padStart(5, '0')}`,
          payment_date: payDate,
          payment_direction: 'inbound',
          payment_method: getRandom(PAYMENT_METHODS),
          amount,
          currency_code: 'INR',
          payment_allocations: {
            create: [{ commercial_document_id: targetDoc.id, allocated_amount: amount }]
          }
        }
      });
    }

    for (let i = 0; i < 30; i++) {
      const targetBill = postedBills[i % postedBills.length];
      const amount = Number(targetBill.total_amount);
      const payDate = new Date(targetBill.document_date);
      payDate.setDate(payDate.getDate() + Math.floor(1 + Math.random() * 10));

      await prisma.payments.create({
        data: {
          organization_id: org.id,
          contact_id: targetBill.contact_id,
          payment_number: `PAY-OUT-2025-${String(paySeq++).padStart(5, '0')}`,
          payment_date: payDate,
          payment_direction: 'outbound',
          payment_method: getRandom(PAYMENT_METHODS),
          amount,
          currency_code: 'INR',
          payment_allocations: {
            create: [{ commercial_document_id: targetBill.id, allocated_amount: amount }]
          }
        }
      });
    }
  }
  const totalPayments = await prisma.payments.count({ where: { organization_id: org.id } });
  console.log(`   ✅ Payments ready: ${totalPayments}\n`);

  // 5. BALANCED JOURNAL ENTRIES (Generate 100 entries)
  const currentJeCount = await prisma.journal_entries.count({ where: { organization_id: org.id } });
  console.log(`📖 5. Journal Entries count: ${currentJeCount} (Target: 100)`);

  if (currentJeCount < 100) {
    const salesJournalId = journalMap['SALES'] || journals[0]?.id;
    const purchJournalId = journalMap['PURCH'] || journals[0]?.id;
    const bankJournalId = journalMap['BANK'] || journals[0]?.id;
    const cashJournalId = journalMap['CASH'] || journals[0]?.id;

    // Use verified account codes
    const cashAccId = accountMap['1010'];
    const bankAccId = accountMap['1020'];
    const arAccId = accountMap['1100'] || accountMap['1010'];
    const apAccId = accountMap['2010'] || accountMap['1010'];
    const salesAccId = accountMap['4010'] || accountMap['1010'];
    const cogsAccId = accountMap['5010'] || accountMap['1010'];
    const taxAccId = accountMap['2050'] || accountMap['1010'];

    const ENTRY_TEMPLATES = [
      {
        journal: salesJournalId,
        name: 'Customer Invoice Posting',
        lines: (amt) => [
          { account_id: arAccId, debit: amt, credit: 0, desc: 'Debtors A/c (Sales Invoice)' },
          { account_id: salesAccId, debit: 0, credit: Math.round(amt / 1.18), desc: 'Furniture Sales Income A/c' },
          { account_id: taxAccId, debit: 0, credit: amt - Math.round(amt / 1.18), desc: 'GST / Taxes Payable (18%)' }
        ]
      },
      {
        journal: bankJournalId,
        name: 'Customer Bank Collection',
        lines: (amt) => [
          { account_id: bankAccId, debit: amt, credit: 0, desc: 'Bank A/c Collection' },
          { account_id: arAccId, debit: 0, credit: amt, desc: 'Debtors A/c Settlement' }
        ]
      },
      {
        journal: purchJournalId,
        name: 'Timber & Raw Wood Procurement',
        lines: (amt) => [
          { account_id: cogsAccId, debit: Math.round(amt / 1.18), credit: 0, desc: 'Purchase Expense A/c (Wood & Steel)' },
          { account_id: taxAccId, debit: amt - Math.round(amt / 1.18), credit: 0, desc: 'Input GST Credit' },
          { account_id: apAccId, debit: 0, credit: amt, desc: 'Creditors A/c' }
        ]
      },
      {
        journal: bankJournalId,
        name: 'Supplier Vendor Bill Settlement',
        lines: (amt) => [
          { account_id: apAccId, debit: amt, credit: 0, desc: 'Creditors A/c Settlement' },
          { account_id: bankAccId, debit: 0, credit: amt, desc: 'Bank A/c Payment' }
        ]
      },
      {
        journal: cashJournalId,
        name: 'Showroom Daily Retail Petty Cash Sales',
        lines: (amt) => [
          { account_id: cashAccId, debit: amt, credit: 0, desc: 'Cash A/c Counter Receipt' },
          { account_id: salesAccId, debit: 0, credit: amt, desc: 'Sales Income A/c' }
        ]
      }
    ];

    let jeSeq = 2001;
    const toCreate = 100 - currentJeCount;
    for (let i = 1; i <= toCreate; i++) {
      const tpl = ENTRY_TEMPLATES[(i - 1) % ENTRY_TEMPLATES.length];
      const amount = 5000 + Math.floor(Math.random() * 450) * 100;
      const partner = getRandom(allContacts);
      const entryDate = getRandomDate(6);
      const analytic = getRandom(allAnalytics);

      const rawLines = tpl.lines(amount);
      const lines = rawLines.map(l => ({
        account_id: l.account_id,
        partner_id: partner.id,
        analytic_account_id: analytic.id,
        description: l.desc,
        debit_amount: l.debit,
        credit_amount: l.credit
      }));

      await prisma.journal_entries.create({
        data: {
          organization_id: org.id,
          journal_id: tpl.journal,
          entry_number: `JE-2025-${String(jeSeq++).padStart(5, '0')}`,
          entry_date: entryDate,
          partner_id: partner.id,
          reference: `${tpl.name} - Ref #${10000 + i}`,
          status: 'posted',
          total_amount: amount,
          journal_entry_lines: { create: lines }
        }
      });
    }
  }
  const totalJe = await prisma.journal_entries.count({ where: { organization_id: org.id } });
  console.log(`   ✅ Journal Entries ready: ${totalJe}\n`);

  // 6. BUDGETS & BUDGET LINES CHECK
  const currentBudgetCount = await prisma.budgets.count({ where: { organization_id: org.id } });
  console.log(`💰 6. Budgets count: ${currentBudgetCount} (Target: 20+)`);

  if (currentBudgetCount < 20) {
    const BUDGET_TEMPLATES = [
      { name: 'FY 2025-26 Q1 Showroom Sales Budget', start: new Date('2025-04-01'), end: new Date('2025-06-30'), resp: 'Rajeev Mehta' },
      { name: 'FY 2025-26 Q2 Festival Season Inventory Budget', start: new Date('2025-07-01'), end: new Date('2025-09-30'), resp: 'Ananya Deshmukh' },
      { name: 'FY 2025-26 Q3 Diwali Corporate Furnishing Campaign', start: new Date('2025-10-01'), end: new Date('2025-12-31'), resp: 'Priya Sharma' },
      { name: 'FY 2025-26 Q4 Year-End Architectural Projects', start: new Date('2026-01-01'), end: new Date('2026-03-31'), resp: 'Vikram Patel' },
      { name: 'Mumbai Bandra Luxury Living Project Budget', start: new Date('2025-05-01'), end: new Date('2025-11-30'), resp: 'Rajeev Mehta' },
      { name: 'Bengaluru Tech Park Commercial Fitout Budget', start: new Date('2025-06-01'), end: new Date('2025-12-31'), resp: 'Vikram Patel' },
      { name: 'Annual Factory Machinery & Maintenance Budget', start: new Date('2025-04-01'), end: new Date('2026-03-31'), resp: 'Ananya Deshmukh' },
      { name: 'Pan-India Logistics & Warehouse Freight Budget', start: new Date('2025-04-01'), end: new Date('2026-03-31'), resp: 'Priya Sharma' },
      { name: 'Digital Adverts & Architectural Magazine Campaign', start: new Date('2025-05-01'), end: new Date('2025-10-31'), resp: 'Rajeev Mehta' },
      { name: 'Sustainable Teakwood Plantation & Timber Procurement', start: new Date('2025-04-01'), end: new Date('2026-03-31'), resp: 'Vikram Patel' },
      { name: 'Jaipur Heritage Palace Restorations Budget', start: new Date('2025-08-01'), end: new Date('2026-02-28'), resp: 'Rajeev Mehta' },
      { name: 'Kochi Waterfront Luxury Suites Budget', start: new Date('2025-09-01'), end: new Date('2026-03-31'), resp: 'Priya Sharma' },
      { name: 'Goa Boutique Villas Fitout Master Budget', start: new Date('2025-07-01'), end: new Date('2025-12-31'), resp: 'Vikram Patel' },
      { name: 'Ergonomic Seating Line Design & Prototyping', start: new Date('2025-04-01'), end: new Date('2025-09-30'), resp: 'Ananya Deshmukh' },
      { name: 'Annual Showroom Energy & Utilities Budget', start: new Date('2025-04-01'), end: new Date('2026-03-31'), resp: 'Priya Sharma' },
      { name: 'Hyderabad Financial District Corporate HQ Budget', start: new Date('2025-06-01'), end: new Date('2025-11-30'), resp: 'Rajeev Mehta' },
      { name: 'Ahmedabad Retail Experience Center Expansion', start: new Date('2025-05-01'), end: new Date('2025-10-31'), resp: 'Vikram Patel' },
      { name: 'Delhi NCR Corporate Outreach & Dealer Network', start: new Date('2025-04-01'), end: new Date('2025-12-31'), resp: 'Ananya Deshmukh' },
      { name: 'Pune High-Street Experience Studio Launch', start: new Date('2025-07-01'), end: new Date('2025-12-31'), resp: 'Priya Sharma' },
      { name: 'ERP Cloud & Digital Workflow Modernization', start: new Date('2025-04-01'), end: new Date('2026-03-31'), resp: 'Rajeev Mehta' }
    ];

    for (const b of BUDGET_TEMPLATES) {
      const createdBudget = await prisma.budgets.create({
        data: {
          organization_id: org.id,
          name: b.name,
          period_start: b.start,
          period_end: b.end,
          currency_code: 'INR',
          status: 'confirmed',
          responsible: b.resp
        }
      });

      const lineCount = 2 + Math.floor(Math.random() * 3);
      for (let bl = 0; bl < lineCount; bl++) {
        const planned = 150000 + Math.floor(Math.random() * 350) * 1000;
        const achieved = Math.round(planned * (0.5 + Math.random() * 0.45));
        const committed = Math.round((planned - achieved) * (0.3 + Math.random() * 0.4));
        const toAchieve = Math.max(0, planned - (achieved + committed));

        await prisma.budget_lines.create({
          data: {
            budget_id: createdBudget.id,
            analytic_account_id: getRandom(allAnalytics).id,
            account_id: getRandom(accounts).id,
            line_type: 'expense',
            planned_amount: planned,
            committed_amount: committed,
            achieved_amount: achieved,
            amount_to_achieve: toAchieve
          }
        });
      }
    }
  }
  const totalBudgets = await prisma.budgets.count({ where: { organization_id: org.id } });
  console.log(`   ✅ Budgets ready: ${totalBudgets}\n`);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎉 ALL ~100 ENTITY RECORDS COMPLETED & VERIFIED IN MYSQL!');
  console.log('═══════════════════════════════════════════════════════════════');
}

seed100AllEntities()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('❌ Error seeding all entities:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
