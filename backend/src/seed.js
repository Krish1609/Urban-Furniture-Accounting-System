import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();
import prisma from './lib/prisma.js';

export async function seedDatabase() {
  console.log('🌱 Seeding XAMPP MySQL database (urban_furniture)...');

  // 1. Get or Create Organization
  let org = await prisma.organizations.findFirst();
  if (!org) {
    org = await prisma.organizations.create({
      data: {
        name: 'Urban Furniture',
        legal_name: 'Urban Furniture Pvt. Ltd.',
        tax_identifier: '27AABCU9603R1ZM',
        base_currency: 'INR',
        fiscal_year_start_month: 4,
        timezone: 'Asia/Kolkata',
        is_active: true
      }
    });
    console.log('✅ Created Organization:', org.name);
  } else {
    console.log('✅ Using Organization:', org.name, org.id);
  }

  // 2. Seed Users (Rule: Exactly 1 Administrator, Multiple Accountants, Multiple Users)
  const hashedPassword = await bcrypt.hash('Password@123', 10);

  // Clean up any extra administrator accounts to strictly enforce 1 single Super Administrator
  await prisma.app_users.updateMany({
    where: {
      AND: [
        { role: { in: ['Administrator', 'admin'] } },
        { NOT: { login_id: 'admin' } }
      ]
    },
    data: {
      role: 'Accountant'
    }
  });
  console.log('🛡️ Enforced single Administrator constraint (only `admin` is Administrator)');

  const demoUsers = [
    // 👑 Single Administrator
    {
      login_id: 'admin',
      email: 'admin@urbanfurniture.com',
      password_hash: hashedPassword,
      display_name: 'Administrator',
      role: 'Administrator',
      membershipRole: 'admin'
    },
    // 💼 Multiple Accountants
    {
      login_id: 'accountant',
      email: 'accountant@urbanfurniture.com',
      password_hash: hashedPassword,
      display_name: 'Rajeev Mehta (Senior Accountant)',
      role: 'Accountant',
      membershipRole: 'accountant'
    },
    {
      login_id: 'accountant_demo',
      email: 'accountant.demo@urbanfurniture.com',
      password_hash: hashedPassword,
      display_name: 'Senior Accountant Demo',
      role: 'Accountant',
      membershipRole: 'accountant'
    },
    {
      login_id: 'priya_acc',
      email: 'priya.sharma@urbanfurniture.com',
      password_hash: hashedPassword,
      display_name: 'Priya Sharma (Financial Accountant)',
      role: 'Accountant',
      membershipRole: 'accountant'
    },
    {
      login_id: 'vikram_acc',
      email: 'vikram.patel@urbanfurniture.com',
      password_hash: hashedPassword,
      display_name: 'Vikram Patel (Tax & Audit Accountant)',
      role: 'Accountant',
      membershipRole: 'accountant'
    },
    {
      login_id: 'ananya_acc',
      email: 'ananya.d@urbanfurniture.com',
      password_hash: hashedPassword,
      display_name: 'Ananya Deshmukh (Cost Accountant)',
      role: 'Accountant',
      membershipRole: 'accountant'
    },
    // 👥 Multiple Users (Clients, Customers & Vendors)
    {
      login_id: 'nimesh_user',
      email: 'nimesh.pathak@client.com',
      password_hash: hashedPassword,
      display_name: 'Nimesh Pathak (Client & Buyer)',
      role: 'User',
      membershipRole: 'accountant'
    },
    {
      login_id: 'priya_client',
      email: 'priya.mehta@studio.com',
      password_hash: hashedPassword,
      display_name: 'Priya Mehta (Studio Architect)',
      role: 'User',
      membershipRole: 'accountant'
    },
    {
      login_id: 'rahul_wood',
      email: 'rahul.timber@sharmawood.in',
      password_hash: hashedPassword,
      display_name: 'Rahul Sharma (Timber Vendor)',
      role: 'User',
      membershipRole: 'accountant'
    },
    {
      login_id: 'sneha_user',
      email: 'sneha.joshi@design.in',
      password_hash: hashedPassword,
      display_name: 'Sneha Joshi (Interior Designer)',
      role: 'User',
      membershipRole: 'accountant'
    },
    {
      login_id: 'rohit_user',
      email: 'rohit.verma@home.com',
      password_hash: hashedPassword,
      display_name: 'Rohit Verma (Retail Customer)',
      role: 'User',
      membershipRole: 'accountant'
    }
  ];

  for (const u of demoUsers) {
    let user = await prisma.app_users.findFirst({
      where: {
        OR: [{ login_id: u.login_id }, { email: u.email }]
      }
    });
    if (!user) {
      user = await prisma.app_users.create({
        data: {
          login_id: u.login_id,
          email: u.email,
          password_hash: u.password_hash,
          display_name: u.display_name,
          role: u.role,
          is_active: true
        }
      });
      console.log(`✅ Created User: ${u.login_id} (${u.role})`);
    } else {
      user = await prisma.app_users.update({
        where: { id: user.id },
        data: { login_id: u.login_id, password_hash: u.password_hash, display_name: u.display_name, role: u.role }
      });
    }

    const membership = await prisma.organization_memberships.findFirst({
      where: { organization_id: org.id, user_id: user.id }
    });
    if (!membership) {
      await prisma.organization_memberships.create({
        data: {
          organization_id: org.id,
          user_id: user.id,
          role: u.membershipRole,
          is_active: true
        }
      });
    }
  }

  // 3. Seed Chart of Accounts (Pre-configured from Diagram)
  const initialAccounts = [
    { code: '1020', name: 'Bank A/c', type: 'bank' },
    { code: '5010', name: 'Purchase Expense A/c', type: 'expenses' },
    { code: '1100', name: 'Debtors A/c', type: 'asset' },
    { code: '2010', name: 'Creditors A/c', type: 'liability' },
    { code: '4010', name: 'Sales Income A/c', type: 'income' },
    { code: '1010', name: 'Cash A/c', type: 'cash' },
    { code: '5020', name: 'Other Expense A/c', type: 'other expenses' },
    { code: '3010', name: 'Capital A/c', type: 'capital' },
    { code: '1200', name: 'Furniture Inventory Stock', type: 'asset' },
    { code: '2050', name: 'GST / Taxes Payable', type: 'liability' },
  ];

  const accountMap = {};
  for (const acc of initialAccounts) {
    let existing = await prisma.chart_of_accounts.findFirst({
      where: { organization_id: org.id, account_code: acc.code }
    });
    if (!existing) {
      existing = await prisma.chart_of_accounts.create({
        data: {
          organization_id: org.id,
          account_code: acc.code,
          name: acc.name,
          account_type: acc.type,
          is_active: true
        }
      });
    } else {
      existing = await prisma.chart_of_accounts.update({
        where: { id: existing.id },
        data: { name: acc.name, account_type: acc.type, is_active: true }
      });
    }
    accountMap[acc.name] = existing.id;
    accountMap[acc.code] = existing.id;
  }
  console.log('✅ Chart of Accounts seeded.');

  // 4. Seed Journals (Pre-configured from Diagram)
  const initialJournals = [
    { name: 'Sales', code: 'SALES', type: 'sales', defaultAccount: 'Sales Income A/c' },
    { name: 'Purchase', code: 'PURCH', type: 'purchase', defaultAccount: 'Purchase Expense A/c' },
    { name: 'Bank', code: 'BANK', type: 'bank', defaultAccount: 'Bank A/c' },
    { name: 'Cash', code: 'CASH', type: 'cash', defaultAccount: 'Cash A/c' },
    { name: 'General Journal Entries', code: 'GEN', type: 'general', defaultAccount: 'Bank A/c' },
  ];

  const journalMap = {};
  for (const j of initialJournals) {
    const defaultAccId = accountMap[j.defaultAccount] || null;
    let existing = await prisma.journals.findFirst({
      where: { organization_id: org.id, name: j.name }
    });
    if (!existing) {
      existing = await prisma.journals.create({
        data: {
          organization_id: org.id,
          name: j.name,
          code: j.code,
          type: j.type,
          default_account_id: defaultAccId,
          is_active: true
        }
      });
    } else {
      existing = await prisma.journals.update({
        where: { id: existing.id },
        data: { default_account_id: defaultAccId, is_active: true }
      });
    }
    journalMap[j.name] = existing.id;
    journalMap[j.type] = existing.id;
  }
  console.log('✅ Journals seeded.');

  // 5. Seed Product Categories
  const categories = [
    { name: 'Ergonomic Seating', code: 'SEAT' },
    { name: 'Tables & Workstations', code: 'TBL' },
    { name: 'Storage & Cabinets', code: 'STRG' },
    { name: 'Living Room Furniture', code: 'LVNG' },
    { name: 'Services & Fitting', code: 'SERV' },
  ];

  const categoryMap = {};
  for (const c of categories) {
    let cat = await prisma.product_categories.findFirst({
      where: { organization_id: org.id, name: c.name }
    });
    if (!cat) {
      cat = await prisma.product_categories.create({
        data: {
          organization_id: org.id,
          name: c.name,
          code: c.code
        }
      });
    }
    categoryMap[c.name] = cat.id;
  }
  console.log('✅ Product Categories seeded.');

  // 6. Seed Products
  const initialProducts = [
    {
      name: 'Aeron Ergonomic Office Chair',
      sku: 'CHAIR-001',
      category: 'Ergonomic Seating',
      type: 'goods',
      salesPrice: 18500,
      costPrice: 11000
    },
    {
      name: 'Solid Teak Wood Dining Table',
      sku: 'TBL-002',
      category: 'Tables & Workstations',
      type: 'goods',
      salesPrice: 34000,
      costPrice: 21000
    },
    {
      name: 'Dual-Motor Electric Standing Desk',
      sku: 'DESK-003',
      category: 'Tables & Workstations',
      type: 'goods',
      salesPrice: 28000,
      costPrice: 16500
    },
    {
      name: 'Executive High-Back Leather Chair',
      sku: 'CHAIR-004',
      category: 'Ergonomic Seating',
      type: 'goods',
      salesPrice: 15500,
      costPrice: 9200
    },
    {
      name: 'Modular 3-Door Credenza Storage',
      sku: 'STRG-005',
      category: 'Storage & Cabinets',
      type: 'goods',
      salesPrice: 22000,
      costPrice: 13500
    },
    {
      name: 'Modern Minimalist Coffee Table',
      sku: 'LVNG-006',
      category: 'Living Room Furniture',
      type: 'goods',
      salesPrice: 8500,
      costPrice: 4800
    },
    {
      name: 'Assembly & On-Site Installation',
      sku: 'SERV-007',
      category: 'Services & Fitting',
      type: 'service',
      salesPrice: 2500,
      costPrice: 500
    }
  ];

  const productMap = {};
  for (const p of initialProducts) {
    let prod = await prisma.products.findFirst({
      where: { organization_id: org.id, sku: p.sku }
    });
    if (!prod) {
      prod = await prisma.products.create({
        data: {
          organization_id: org.id,
          category_id: categoryMap[p.category],
          sku: p.sku,
          name: p.name,
          product_type: p.type,
          sales_price: p.salesPrice,
          cost_price: p.costPrice,
          is_active: true
        }
      });
    }
    productMap[p.name] = prod.id;
  }
  console.log('✅ Products seeded.');

  // 7. Seed Contacts & Addresses
  const contactsData = [
    {
      name: 'Mr Rahul',
      type: 'customer',
      email: 'rahul@example.com',
      phone: '+91 98200 12345',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    {
      name: 'Mr Raj',
      type: 'customer',
      email: 'raj@example.com',
      phone: '+91 98450 67890',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001'
    },
    {
      name: 'Nimesh Pathak',
      type: 'customer',
      email: 'nimesh.pathak@client.com',
      phone: '+91 98200 12345',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    {
      name: 'Azure Furniture Supplies',
      type: 'vendor',
      email: 'supplies@azurefurn.com',
      phone: '+91 98450 67890',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001'
    },
    {
      name: 'Apex Interior Solutions',
      type: 'customer',
      email: 'contact@apexinterior.in',
      phone: '+91 98111 22334',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    },
    {
      name: 'Global Timber & Woods Co.',
      type: 'vendor',
      email: 'sales@globaltimber.com',
      phone: '+91 98765 43210',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700001'
    }
  ];

  const contactMap = {};
  for (const c of contactsData) {
    let contact = await prisma.contacts.findFirst({
      where: { organization_id: org.id, display_name: c.name }
    });
    if (!contact) {
      contact = await prisma.contacts.create({
        data: {
          organization_id: org.id,
          display_name: c.name,
          contact_type: c.type,
          email: c.email,
          phone: c.phone,
          is_active: true,
          contact_addresses: {
            create: {
              address_type: 'billing',
              line1: '102 Industrial Furniture Boulevard',
              city: c.city,
              state: c.state,
              postal_code: c.pincode,
              country_code: 'IN',
              is_default: true
            }
          }
        }
      });
    }
    contactMap[c.name] = contact.id;
  }
  console.log('✅ Contacts & Addresses seeded.');

  // 8. Seed Analytic Accounts (from Diagram)
  const analyticsData = [
    { code: 'ANA-FURN', name: 'Furniture', type: 'expense', description: 'Furniture Manufacturing Cost Center' },
    { code: 'ANA-SALES', name: 'Commercial Sales', type: 'income', description: 'Commercial Furniture Revenue Center' },
    { code: 'ANA-TIMBER', name: 'Raw Timber Procurement', type: 'expense', description: 'Procurement Cost Center' },
    { code: 'ANA-SHOWROOM', name: 'Showroom Operations', type: 'expense', description: 'Flagship Showroom Cost Center' }
  ];

  const analyticMap = {};
  for (const a of analyticsData) {
    let existing = await prisma.analytic_accounts.findFirst({
      where: { organization_id: org.id, name: a.name }
    });
    if (!existing) {
      existing = await prisma.analytic_accounts.create({
        data: {
          organization_id: org.id,
          code: a.code,
          name: a.name,
          type: a.type,
          description: a.description
        }
      });
    } else {
      existing = await prisma.analytic_accounts.update({
        where: { id: existing.id },
        data: { type: a.type, description: a.description }
      });
    }
    analyticMap[a.name] = existing.id;
  }
  console.log('✅ Analytic Accounts seeded.');

  // 9. Seed Journal Entries (from Diagram)
  const existingEntries = await prisma.journal_entries.count({ where: { organization_id: org.id } });
  if (existingEntries === 0) {
    // Entry 1: Sep 1, 2026 | RB/2026/0001 | Mr Rahul | Purchases | Rs. 10,000 | Posted
    const purchaseJournalId = journalMap['Purchase'] || journalMap['purchase'];
    const salesJournalId = journalMap['Sales'] || journalMap['sales'];
    const mrRahulId = contactMap['Mr Rahul'];
    const mrRajId = contactMap['Mr Raj'];

    if (purchaseJournalId && mrRahulId) {
      await prisma.journal_entries.create({
        data: {
          organization_id: org.id,
          journal_id: purchaseJournalId,
          entry_number: 'RB/2026/0001',
          entry_date: new Date('2026-09-01'),
          partner_id: mrRahulId,
          reference: 'RB/2026/0001 - Mr Rahul',
          status: 'posted',
          total_amount: 10000,
          journal_entry_lines: {
            create: [
              {
                account_id: accountMap['5010'] || accountMap['Purchase Expense A/c'],
                partner_id: mrRahulId,
                description: 'Purchase Expense A/c',
                debit_amount: 10000,
                credit_amount: 0
              },
              {
                account_id: accountMap['1020'] || accountMap['Bank A/c'],
                partner_id: mrRahulId,
                description: 'Bank A/c',
                debit_amount: 0,
                credit_amount: 10000
              }
            ]
          }
        }
      });
    }

    // Entry 2: Sep 2, 2026 | Inv/2026/001 | Mr Raj | Sales | Rs. 10,500 | Draft
    if (salesJournalId && mrRajId) {
      await prisma.journal_entries.create({
        data: {
          organization_id: org.id,
          journal_id: salesJournalId,
          entry_number: 'Inv/2026/001',
          entry_date: new Date('2026-09-02'),
          partner_id: mrRajId,
          reference: 'Inv/2026/001 - Mr Raj',
          status: 'draft',
          total_amount: 10500,
          journal_entry_lines: {
            create: [
              {
                account_id: accountMap['1100'] || accountMap['Debtors A/c'],
                partner_id: mrRajId,
                description: 'Debtors A/c',
                debit_amount: 10500,
                credit_amount: 0
              },
              {
                account_id: accountMap['4010'] || accountMap['Sales Income A/c'],
                partner_id: mrRajId,
                description: 'Sales Income A/c',
                debit_amount: 0,
                credit_amount: 10500
              }
            ]
          }
        }
      });
    }

    console.log('✅ Journal Entries seeded from diagram.');
  }

  // 10. Seed Budgets (Original & Revised from Diagram)
  const existingBudgets = await prisma.budgets.count({ where: { organization_id: org.id } });
  if (existingBudgets === 0) {
    const furnitureAnId = analyticMap['Furniture'] || Object.values(analyticMap)[0];

    // Budget 1: Original Budget (January 2026)
    const bgt1 = await prisma.budgets.create({
      data: {
        organization_id: org.id,
        name: 'January 2026',
        period_start: new Date('2026-01-01'),
        period_end: new Date('2026-01-31'),
        currency_code: 'INR',
        status: 'confirm',
        responsible: 'Administrator',
        budget_lines: {
          create: [
            {
              analytic_account_id: furnitureAnId,
              line_type: 'expense',
              planned_amount: 200000,
              committed_amount: 200000,
              achieved_amount: 10000,
              amount_to_achieve: 190000
            }
          ]
        }
      }
    });

    // Budget 2: Revised Budget (January 2026 (Revised))
    const bgtRev = await prisma.budgets.create({
      data: {
        organization_id: org.id,
        name: 'January 2026 (Revised)',
        period_start: new Date('2026-01-01'),
        period_end: new Date('2026-01-31'),
        currency_code: 'INR',
        status: 'revised',
        responsible: 'Administrator',
        revision_of_id: bgt1.id,
        revision_of_name: bgt1.name,
        budget_lines: {
          create: [
            {
              analytic_account_id: furnitureAnId,
              line_type: 'expense',
              planned_amount: 200000,
              committed_amount: 200000,
              achieved_amount: 10000,
              amount_to_achieve: 190000
            }
          ]
        }
      }
    });

    // Link original budget with revised budget
    await prisma.budgets.update({
      where: { id: bgt1.id },
      data: {
        revised_with_id: bgtRev.id,
        revised_with_name: bgtRev.name
      }
    });

    console.log('✅ Budgets seeded (Original & Revised).');
  }

  console.log('\n🎉 ALL MASTER & DEMO DATA SUCCESSFULLY SEEDED INTO XAMPP MYSQL DATABASE!');
}

seedDatabase()
  .then(async () => {
    console.log('\n✅ Seeding finished successfully.');
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('❌ Seeding error:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
