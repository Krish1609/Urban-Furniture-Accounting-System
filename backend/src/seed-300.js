import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();
import prisma from './lib/prisma.js';

// High-resolution Unsplash furniture images
const FURNITURE_IMAGES = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1549497538-303791108f95?auto=format&fit=crop&w=800&q=80'
];

// Profile & Company Avatar URLs
const AVATAR_IMAGES = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'
];

// Cities and States in India
const INDIAN_LOCATIONS = [
  { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  { city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
  { city: 'Delhi', state: 'Delhi', pincode: '110001' },
  { city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
  { city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' },
  { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
  { city: 'Kolkata', state: 'West Bengal', pincode: '700001' },
  { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
  { city: 'Surat', state: 'Gujarat', pincode: '395001' },
  { city: 'Jaipur', state: 'Rajasthan', pincode: '302001' },
  { city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001' },
  { city: 'Nagpur', state: 'Maharashtra', pincode: '440001' },
  { city: 'Indore', state: 'Madhya Pradesh', pincode: '452001' },
  { city: 'Thane', state: 'Maharashtra', pincode: '400601' },
  { city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462001' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530001' },
  { city: 'Vadodara', state: 'Gujarat', pincode: '390001' },
  { city: 'Ghaziabad', state: 'Uttar Pradesh', pincode: '201001' },
  { city: 'Ludhiana', state: 'Punjab', pincode: '141001' },
  { city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641001' },
  { city: 'Kochi', state: 'Kerala', pincode: '682001' },
  { city: 'Chandigarh', state: 'Punjab', pincode: '160001' },
  { city: 'Mysore', state: 'Karnataka', pincode: '570001' },
  { city: 'Goa', state: 'Goa', pincode: '403001' }
];

// Furniture Categories
const CATEGORY_DEFINITIONS = [
  { name: 'Ergonomic Seating', code: 'SEAT', desc: 'Chairs, Ergonomic Recliners, Mesh Stools' },
  { name: 'Tables & Workstations', code: 'TBL', desc: 'Desks, Standing Tables, Conference Tables' },
  { name: 'Living Room Furniture', code: 'LVNG', desc: 'Sofas, Lounges, Coffee Tables, Ottomans' },
  { name: 'Storage & Cabinets', code: 'STRG', desc: 'Wardrobes, Credenzas, Bookshelves, Filing' },
  { name: 'Bedroom & Mattresses', code: 'BED', desc: 'Beds, Nightstands, Memory Foam Mattresses' },
  { name: 'Dining Room Sets', code: 'DINE', desc: 'Dining Tables, Crockery Units, Dining Chairs' },
  { name: 'Lighting & Fixtures', code: 'LGHT', desc: 'Lamps, Chandeliers, Sconces, LED Accents' },
  { name: 'Executive & Boardroom', code: 'EXEC', desc: 'Executive Desks, Boardroom Suites' },
  { name: 'Outdoor & Balcony', code: 'OUTD', desc: 'Rattan Patio Sets, Loungers, Garden Tables' },
  { name: 'Services & Fitting', code: 'SERV', desc: 'Installation, Custom Polishing, On-site Fitting' }
];

// Product Name Base Generators
const PRODUCT_ADJECTIVES = [
  'Nordic', 'Modern', 'Ergonomic', 'Minimalist', 'Royal', 'Executive', 'Classic', 'Industrial',
  'Contemporary', 'Artisan', 'Vintage', 'Luxury', 'Sleek', 'Premium', 'Aero', 'Modular',
  'Teakwood', 'Walnut', 'Velvet', 'Italian', 'Scandi', 'Zenith', 'Apex', 'Signature'
];

const PRODUCT_NOUNS = [
  { name: 'Office Task Chair', cat: 'Ergonomic Seating', type: 'goods', basePrice: 14500 },
  { name: 'High-Back Mesh Chair', cat: 'Ergonomic Seating', type: 'goods', basePrice: 18900 },
  { name: 'Leather Executive Throne', cat: 'Ergonomic Seating', type: 'goods', basePrice: 28500 },
  { name: 'Swivel Drafting Stool', cat: 'Ergonomic Seating', type: 'goods', basePrice: 8900 },
  { name: 'Dual-Motor Standing Desk', cat: 'Tables & Workstations', type: 'goods', basePrice: 32000 },
  { name: 'Live Edge Solid Wood Desk', cat: 'Tables & Workstations', type: 'goods', basePrice: 42000 },
  { name: 'L-Shaped Corner Workstation', cat: 'Tables & Workstations', type: 'goods', basePrice: 38500 },
  { name: 'Modular Conference Table', cat: 'Tables & Workstations', type: 'goods', basePrice: 65000 },
  { name: '3-Seater Velvet Tufted Sofa', cat: 'Living Room Furniture', type: 'goods', basePrice: 48000 },
  { name: 'L-Shaped Sectional Couch', cat: 'Living Room Furniture', type: 'goods', basePrice: 72000 },
  { name: 'Accent Lounge Armchair', cat: 'Living Room Furniture', type: 'goods', basePrice: 21500 },
  { name: 'Marble Top Coffee Table', cat: 'Living Room Furniture', type: 'goods', basePrice: 16500 },
  { name: 'Storage Ottoman Bench', cat: 'Living Room Furniture', type: 'goods', basePrice: 12000 },
  { name: '4-Door Wooden Wardrobe', cat: 'Storage & Cabinets', type: 'goods', basePrice: 54000 },
  { name: 'Credenza Sideboard Cabinet', cat: 'Storage & Cabinets', type: 'goods', basePrice: 26500 },
  { name: 'Open Geometric Bookshelf', cat: 'Storage & Cabinets', type: 'goods', basePrice: 19500 },
  { name: 'Mobile Filing Pedestal', cat: 'Storage & Cabinets', type: 'goods', basePrice: 9500 },
  { name: 'King Size Hydraulic Storage Bed', cat: 'Bedroom & Mattresses', type: 'goods', basePrice: 68000 },
  { name: 'Queen Platform Sheesham Bed', cat: 'Bedroom & Mattresses', type: 'goods', basePrice: 46000 },
  { name: 'Orthopedic Pocket Spring Mattress', cat: 'Bedroom & Mattresses', type: 'goods', basePrice: 28000 },
  { name: 'Bedside Nightstand with Drawer', cat: 'Bedroom & Mattresses', type: 'goods', basePrice: 8500 },
  { name: '6-Seater Solid Teak Dining Table', cat: 'Dining Room Sets', type: 'goods', basePrice: 58000 },
  { name: 'Cushioned Dining Chair Set', cat: 'Dining Room Sets', type: 'goods', basePrice: 24000 },
  { name: 'Glass Display Crockery Unit', cat: 'Dining Room Sets', type: 'goods', basePrice: 38000 },
  { name: 'Arc Floor Reading Lamp', cat: 'Lighting & Fixtures', type: 'goods', basePrice: 9800 },
  { name: 'Modern Brass Pendant Chandelier', cat: 'Lighting & Fixtures', type: 'goods', basePrice: 18500 },
  { name: 'Dimmable Architectural LED Sconce', cat: 'Lighting & Fixtures', type: 'goods', basePrice: 6200 },
  { name: 'Presidential Suite Boardroom Desk', cat: 'Executive & Boardroom', type: 'goods', basePrice: 95000 },
  { name: 'Ergonomic Leather Director Chair', cat: 'Executive & Boardroom', type: 'goods', basePrice: 39000 },
  { name: 'All-Weather Rattan Patio Set', cat: 'Outdoor & Balcony', type: 'goods', basePrice: 42000 },
  { name: 'Teak Sun Lounger with Cushion', cat: 'Outdoor & Balcony', type: 'goods', basePrice: 22000 },
  { name: 'On-Site Modular Assembly Service', cat: 'Services & Fitting', type: 'service', basePrice: 3500 },
  { name: 'Wood Lacquer & Polishing Service', cat: 'Services & Fitting', type: 'service', basePrice: 5500 },
  { name: 'Interior Space Acoustic Planning', cat: 'Services & Fitting', type: 'service', basePrice: 12000 }
];

// Indian First Names and Surnames
const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Dhruv', 'Kabir', 'Rohan', 'Vikram', 'Rajesh', 'Suresh', 'Manish', 'Nimesh', 'Ketan', 'Pranav',
  'Priya', 'Ananya', 'Diya', 'Isha', 'Aadhya', 'Saanvi', 'Tanvi', 'Sneha', 'Pooja', 'Neha',
  'Ritu', 'Kavita', 'Sunita', 'Meera', 'Roshni', 'Shreya', 'Divya', 'Anushka', 'Natasha', 'Kiran',
  'Amit', 'Rahul', 'Deepak', 'Sanjay', 'Alok', 'Sachin', 'Gaurav', 'Tarun', 'Harsh', 'Mohit'
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Verma', 'Gupta', 'Mehta', 'Deshmukh', 'Nair', 'Iyer', 'Joshi', 'Singhania',
  'Shah', 'Kapoor', 'Rao', 'Banerjee', 'Kulkarni', 'Trivedi', 'Choudhary', 'Menon', 'Bhatia', 'Reddy',
  'Agarwal', 'Chatterjee', 'Dutta', 'Pandey', 'Mishra', 'Saxena', 'Chopra', 'Malhotra', 'Bose', 'Seth'
];

const COMPANY_PREFIXES = [
  'Apex', 'Royal', 'Century', 'Urban', 'Spacewood', 'Godrej Interio Partner', 'Studio Lotus',
  'Greenlam', 'Nilkamal Logistics', 'Featherlite', 'Merino', 'Pepperfry B2B', 'Bombay', 'Gujarat',
  'Bangalore Tech Space', 'Delhi Furnishings', 'Taj Hospitality Interiors', 'Oberoi Project Group',
  'Marriott Suites Furnishers', 'Havells Decor Alliance', 'Prestige Living Concepts', 'Lodha Interior Cell',
  'Hiranandani Space Design', 'DLF Corporate Supplies', 'K Raheja Corp Fitting'
];

const COMPANY_SUFFIXES = [
  'Enterprises', 'Pvt. Ltd.', 'Design Studio', 'Furnishings LLP', 'Solutions', 'Timber & Woods',
  'Decor & Living', 'Contractors', 'Architects', 'Creations', 'Concepts', 'Hub'
];

export async function seed300Entries() {
  console.log('🚀 Starting 300+ entries database generator for Urban Furniture...');

  // 1. Resolve Organization
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
  }
  console.log(`✅ Using Organization: ${org.name} (${org.id})`);

  // 2. Ensure Chart of Accounts
  const coaData = [
    { code: '1010', name: 'Cash A/c', type: 'cash' },
    { code: '1020', name: 'Bank A/c', type: 'bank' },
    { code: '1100', name: 'Debtors A/c', type: 'asset' },
    { code: '1200', name: 'Furniture Inventory Stock', type: 'asset' },
    { code: '2010', name: 'Creditors A/c', type: 'liability' },
    { code: '2050', name: 'GST / Taxes Payable', type: 'liability' },
    { code: '3010', name: 'Capital A/c', type: 'capital' },
    { code: '4010', name: 'Sales Income A/c', type: 'income' },
    { code: '5010', name: 'Purchase Expense A/c', type: 'expenses' },
    { code: '5020', name: 'Other Expense A/c', type: 'other expenses' },
  ];

  const coaMap = {};
  for (const c of coaData) {
    let acc = await prisma.chart_of_accounts.findFirst({
      where: { organization_id: org.id, account_code: c.code }
    });
    if (!acc) {
      acc = await prisma.chart_of_accounts.create({
        data: {
          organization_id: org.id,
          account_code: c.code,
          name: c.name,
          account_type: c.type,
          is_active: true
        }
      });
    }
    coaMap[c.code] = acc.id;
    coaMap[c.name] = acc.id;
  }

  // 3. Ensure Journals
  const journalsData = [
    { name: 'Sales', code: 'SALES', type: 'sales', acc: coaMap['4010'] },
    { name: 'Purchase', code: 'PURCH', type: 'purchase', acc: coaMap['5010'] },
    { name: 'Bank', code: 'BANK', type: 'bank', acc: coaMap['1020'] },
    { name: 'Cash', code: 'CASH', type: 'cash', acc: coaMap['1010'] },
    { name: 'General Journal Entries', code: 'GEN', type: 'general', acc: coaMap['1020'] }
  ];

  const journalMap = {};
  for (const j of journalsData) {
    let jrn = await prisma.journals.findFirst({
      where: { organization_id: org.id, name: j.name }
    });
    if (!jrn) {
      jrn = await prisma.journals.create({
        data: {
          organization_id: org.id,
          name: j.name,
          code: j.code,
          type: j.type,
          default_account_id: j.acc,
          is_active: true
        }
      });
    }
    journalMap[j.name] = jrn.id;
    journalMap[j.type] = jrn.id;
  }

  // 4. Ensure Analytic Accounts
  const analyticsList = [
    { code: 'ANA-FURN', name: 'Furniture Manufacturing', type: 'expense', desc: 'Furniture production cost center' },
    { code: 'ANA-SALES', name: 'Commercial Sales', type: 'income', desc: 'Wholesale & B2B furniture revenue center' },
    { code: 'ANA-TIMBER', name: 'Raw Timber Procurement', type: 'expense', desc: 'Solid wood and lumber cost center' },
    { code: 'ANA-SHOWROOM', name: 'Flagship Showroom', type: 'expense', desc: 'Retail showroom operational costs' },
    { code: 'ANA-LOGISTICS', name: 'Logistics & Distribution', type: 'expense', desc: 'Pan-India shipping & logistics' },
    { code: 'ANA-RND', name: 'Design & Ergonomic R&D', type: 'expense', desc: 'Product development and testing' }
  ];

  const analyticMap = {};
  for (const a of analyticsList) {
    let an = await prisma.analytic_accounts.findFirst({
      where: { organization_id: org.id, name: a.name }
    });
    if (!an) {
      an = await prisma.analytic_accounts.create({
        data: {
          organization_id: org.id,
          code: a.code,
          name: a.name,
          type: a.type,
          description: a.desc
        }
      });
    }
    analyticMap[a.name] = an.id;
  }

  // 5. Seed Product Categories
  const categoryMap = {};
  for (const cat of CATEGORY_DEFINITIONS) {
    let c = await prisma.product_categories.findFirst({
      where: { organization_id: org.id, name: cat.name }
    });
    if (!c) {
      c = await prisma.product_categories.create({
        data: {
          organization_id: org.id,
          name: cat.name,
          code: cat.code,
          description: cat.desc
        }
      });
    }
    categoryMap[cat.name] = c.id;
  }

  // ─────────────────────────────────────────────────────────────
  // 6. GENERATE 300 PRODUCTS
  // ─────────────────────────────────────────────────────────────
  console.log('📦 Seeding 300 Products...');
  const currentProductCount = await prisma.products.count({ where: { organization_id: org.id } });
  const productsToCreate = Math.max(0, 300 - currentProductCount);

  if (productsToCreate > 0) {
    console.log(`Generating ${productsToCreate} additional products to reach 300...`);
    const productEntries = [];

    for (let i = currentProductCount + 1; i <= 300; i++) {
      const nounObj = PRODUCT_NOUNS[(i - 1) % PRODUCT_NOUNS.length];
      const adj = PRODUCT_ADJECTIVES[Math.floor(Math.random() * PRODUCT_ADJECTIVES.length)];
      const variationNum = Math.floor(i / PRODUCT_NOUNS.length) + 1;
      const productName = `${adj} ${nounObj.name} ${variationNum > 1 ? `(Series ${variationNum})` : ''}`.trim();
      const sku = `FUR-${String(i).padStart(4, '0')}`;
      
      const priceVariation = 0.85 + Math.random() * 0.35; // 85% to 120%
      const salesPrice = Math.round(nounObj.basePrice * priceVariation / 100) * 100;
      const costPrice = Math.round(salesPrice * (0.50 + Math.random() * 0.15) / 100) * 100;
      const imageUrl = FURNITURE_IMAGES[(i - 1) % FURNITURE_IMAGES.length];
      const catId = categoryMap[nounObj.cat] || Object.values(categoryMap)[0];

      productEntries.push({
        organization_id: org.id,
        category_id: catId,
        sku: sku,
        name: productName,
        description: `Premium grade ${productName}. Built with high quality materials, ergonomic precision and modern aesthetic finish.`,
        product_type: nounObj.type,
        sales_price: salesPrice,
        cost_price: costPrice,
        image_url: imageUrl,
        is_active: true
      });
    }

    // Insert in batches of 50
    for (let b = 0; b < productEntries.length; b += 50) {
      const batch = productEntries.slice(b, b + 50);
      await prisma.products.createMany({ data: batch });
    }
  }

  const allProducts = await prisma.products.findMany({ where: { organization_id: org.id } });
  console.log(`✅ Total Products in DB: ${allProducts.length}`);

  // ─────────────────────────────────────────────────────────────
  // 7. GENERATE 300 CONTACTS & ADDRESSES
  // ─────────────────────────────────────────────────────────────
  console.log('👥 Seeding 300 Contacts & Addresses...');
  const currentContactCount = await prisma.contacts.count({ where: { organization_id: org.id } });
  const contactsToCreate = Math.max(0, 300 - currentContactCount);

  if (contactsToCreate > 0) {
    console.log(`Generating ${contactsToCreate} additional contacts to reach 300...`);
    for (let i = currentContactCount + 1; i <= 300; i++) {
      const isVendor = i % 3 === 0;
      const isCompany = i % 2 === 0;

      let displayName = '';
      let email = '';
      let website = '';
      let phone = `+91 ${98000 + (i * 17) % 9999} ${String(10000 + (i * 31) % 89999)}`;
      const loc = INDIAN_LOCATIONS[(i - 1) % INDIAN_LOCATIONS.length];
      const avatar = AVATAR_IMAGES[(i - 1) % AVATAR_IMAGES.length];

      if (isCompany) {
        const pref = COMPANY_PREFIXES[(i - 1) % COMPANY_PREFIXES.length];
        const suff = COMPANY_SUFFIXES[(i * 3) % COMPANY_SUFFIXES.length];
        const cityTag = loc.city;
        displayName = `${pref} ${suff} (${cityTag})`;
        const domainSlug = pref.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
        const roles = ['contact', 'sales', 'procurement', 'orders', 'info', 'billing', 'support', 'b2b'];
        const role = roles[i % roles.length];
        email = `${role}@${domainSlug}.in`;
        website = `https://www.${domainSlug}.in`;
      } else {
        const first = FIRST_NAMES[(i - 1) % FIRST_NAMES.length];
        const last = LAST_NAMES[(i * 2) % LAST_NAMES.length];
        displayName = `${first} ${last}`;
        const domains = ['gmail.com', 'outlook.com', 'yahoo.in', 'icloud.com', 'designstudio.in', 'architects.in', 'urbanhome.co.in'];
        const domain = domains[i % domains.length];
        const f = first.toLowerCase().replace(/[^a-z]/g, '');
        const l = last.toLowerCase().replace(/[^a-z]/g, '');
        email = (i % 3 === 0) ? `${f}.${l}@${domain}` : (i % 3 === 1) ? `${f}_${l}@${domain}` : `${f}${l[0]}@${domain}`;
        website = `https://www.${f}${l}.me`;
      }

      await prisma.contacts.create({
        data: {
          organization_id: org.id,
          contact_type: isVendor ? 'vendor' : 'customer',
          display_name: displayName,
          legal_name: `${displayName} (Verified)`,
          tax_identifier: `27AA${String(1000 + i)}Z${String(5000 + i)}1Z${i % 9}`,
          email: email,
          phone: phone,
          image_url: avatar,
          website: website,
          is_active: true,
          contact_addresses: {
            create: {
              address_type: 'billing',
              line1: `${100 + (i % 800)}, Industrial Furniture Park, Road ${1 + (i % 25)}`,
              line2: `Phase ${1 + (i % 5)}, Near Metro Station`,
              city: loc.city,
              state: loc.state,
              postal_code: loc.pincode,
              country_code: 'IN',
              is_default: true
            }
          }
        }
      });
    }
  }

  const allContacts = await prisma.contacts.findMany({ where: { organization_id: org.id } });
  console.log(`✅ Total Contacts in DB: ${allContacts.length}`);

  // ─────────────────────────────────────────────────────────────
  // 8. GENERATE 300 COMMERCIAL DOCUMENTS (Orders & Invoices)
  // ─────────────────────────────────────────────────────────────
  console.log('📄 Seeding 300 Commercial Documents & Lines...');
  const currentDocCount = await prisma.commercial_documents.count({ where: { organization_id: org.id } });
  const docsToCreate = Math.max(0, 300 - currentDocCount);

  if (docsToCreate > 0) {
    console.log(`Generating ${docsToCreate} commercial documents (Sales Orders, Purchase Orders, Invoices, Bills)...`);
    const docTypes = ['sales_order', 'purchase_order', 'customer_invoice', 'vendor_bill'];

    for (let i = currentDocCount + 1; i <= 300; i++) {
      const docType = docTypes[(i - 1) % docTypes.length];
      const contact = allContacts[(i * 7) % allContacts.length];

      // Prefix based on doc type
      let prefix = 'SO-2026';
      if (docType === 'purchase_order') prefix = 'PO-2026';
      else if (docType === 'customer_invoice') prefix = 'INV-2026';
      else if (docType === 'vendor_bill') prefix = 'BILL-2026';

      const docNumber = `${prefix}-${String(i).padStart(4, '0')}`;

      // Date in 2026 (Jan to Sep 2026)
      const dayOffset = (i * 2) % 240; // 0 to 240 days from Jan 1 2026
      const docDate = new Date(new Date('2026-01-01').getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const dueDate = new Date(docDate.getTime() + 15 * 24 * 60 * 60 * 1000);

      // Pick 1 to 4 products
      const numLines = 1 + (i % 4);
      const lines = [];
      let subtotal = 0;

      for (let l = 0; l < numLines; l++) {
        const prod = allProducts[(i * 3 + l * 11) % allProducts.length];
        const qty = 1 + ((i + l) % 8);
        const unitPrice = docType.includes('purchase') || docType.includes('bill') 
          ? Number(prod.cost_price) || 8000 
          : Number(prod.sales_price) || 15000;
        
        const lineTotal = qty * unitPrice;
        subtotal += lineTotal;

        lines.push({
          product_id: prod.id,
          description: prod.name,
          quantity: qty,
          unit_price: unitPrice,
          line_tax_amount: Math.round(lineTotal * 0.18),
          line_total_amount: Math.round(lineTotal * 1.18),
          analytic_account_id: Object.values(analyticMap)[(i + l) % Object.values(analyticMap).length]
        });
      }

      const taxAmount = Math.round(subtotal * 0.18);
      const totalAmount = subtotal + taxAmount;
      const status = i % 4 === 0 ? 'draft' : 'confirmed';

      await prisma.commercial_documents.create({
        data: {
          organization_id: org.id,
          contact_id: contact.id,
          document_type: docType,
          document_number: docNumber,
          document_date: docDate,
          due_date: dueDate,
          currency_code: 'INR',
          status: status,
          subtotal_amount: subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          commercial_document_lines: {
            create: lines
          }
        }
      });
    }
  }

  const allDocuments = await prisma.commercial_documents.findMany({ where: { organization_id: org.id } });
  console.log(`✅ Total Commercial Documents in DB: ${allDocuments.length}`);

  // ─────────────────────────────────────────────────────────────
  // 9. GENERATE 300 BALANCED JOURNAL ENTRIES
  // ─────────────────────────────────────────────────────────────
  console.log('📒 Seeding 300 Double-Entry Balanced Journal Entries...');
  const currentJECount = await prisma.journal_entries.count({ where: { organization_id: org.id } });
  const jeToCreate = Math.max(0, 300 - currentJECount);

  if (jeToCreate > 0) {
    console.log(`Generating ${jeToCreate} balanced journal entries...`);
    const salesJrnId = journalMap['Sales'] || Object.values(journalMap)[0];
    const purchJrnId = journalMap['Purchase'] || Object.values(journalMap)[0];
    const bankJrnId = journalMap['Bank'] || Object.values(journalMap)[0];
    const cashJrnId = journalMap['Cash'] || Object.values(journalMap)[0];
    const genJrnId = journalMap['General Journal Entries'] || Object.values(journalMap)[0];

    const bankAcc = coaMap['1020'];
    const cashAcc = coaMap['1010'];
    const debtorsAcc = coaMap['1100'];
    const creditorsAcc = coaMap['2010'];
    const inventoryAcc = coaMap['1200'];
    const gstAcc = coaMap['2050'];
    const capitalAcc = coaMap['3010'];
    const salesAcc = coaMap['4010'];
    const purchaseAcc = coaMap['5010'];
    const otherExpAcc = coaMap['5020'];

    for (let i = currentJECount + 1; i <= 300; i++) {
      const partner = allContacts[(i * 5) % allContacts.length];
      const entryType = i % 5; // 0: Sales, 1: Purchase, 2: Bank Receipt, 3: Bank Payment, 4: General/Expense
      const baseAmount = 5000 + ((i * 1357) % 85000);
      const taxPart = Math.round(baseAmount * 0.18);
      const totalAmount = baseAmount + taxPart;

      const dayOffset = (i * 2) % 240;
      const entryDate = new Date(new Date('2026-01-01').getTime() + dayOffset * 24 * 60 * 60 * 1000);
      
      let journalId = genJrnId;
      let entryNumber = `JE/2026/${String(i).padStart(4, '0')}`;
      let reference = `Voucher #${i} - ${partner.display_name}`;
      let lines = [];

      if (entryType === 0) {
        // Sales Journal: Dr Debtors, Cr Sales Income, Cr GST Payable
        journalId = salesJrnId;
        entryNumber = `INV/2026/${String(i).padStart(4, '0')}`;
        reference = `Commercial Sales Invoice #${i} - ${partner.display_name}`;
        lines = [
          {
            account_id: debtorsAcc,
            partner_id: partner.id,
            description: `Debtors A/c - ${partner.display_name}`,
            debit_amount: totalAmount,
            credit_amount: 0
          },
          {
            account_id: salesAcc,
            partner_id: partner.id,
            description: 'Sales Income A/c',
            debit_amount: 0,
            credit_amount: baseAmount
          },
          {
            account_id: gstAcc,
            partner_id: partner.id,
            description: 'GST Output Liability (18%)',
            debit_amount: 0,
            credit_amount: taxPart
          }
        ];
      } else if (entryType === 1) {
        // Purchase Journal: Dr Purchase Expense, Dr GST, Cr Creditors
        journalId = purchJrnId;
        entryNumber = `RB/2026/${String(i).padStart(4, '0')}`;
        reference = `Vendor Procurement Bill #${i} - ${partner.display_name}`;
        lines = [
          {
            account_id: purchaseAcc,
            partner_id: partner.id,
            description: `Purchase Expense A/c - ${partner.display_name}`,
            debit_amount: baseAmount,
            credit_amount: 0
          },
          {
            account_id: gstAcc,
            partner_id: partner.id,
            description: 'GST Input Tax (18%)',
            debit_amount: taxPart,
            credit_amount: 0
          },
          {
            account_id: creditorsAcc,
            partner_id: partner.id,
            description: `Creditors A/c - ${partner.display_name}`,
            debit_amount: 0,
            credit_amount: totalAmount
          }
        ];
      } else if (entryType === 2) {
        // Bank Customer Receipt: Dr Bank, Cr Debtors
        journalId = bankJrnId;
        entryNumber = `BNK/2026/IN/${String(i).padStart(4, '0')}`;
        reference = `Customer Inward Payment Receipt - ${partner.display_name}`;
        lines = [
          {
            account_id: bankAcc,
            partner_id: partner.id,
            description: 'HDFC Bank Inward Wire Transfer',
            debit_amount: totalAmount,
            credit_amount: 0
          },
          {
            account_id: debtorsAcc,
            partner_id: partner.id,
            description: `Debtors A/c Settlement - ${partner.display_name}`,
            debit_amount: 0,
            credit_amount: totalAmount
          }
        ];
      } else if (entryType === 3) {
        // Bank Vendor Payment: Dr Creditors, Cr Bank
        journalId = bankJrnId;
        entryNumber = `BNK/2026/OUT/${String(i).padStart(4, '0')}`;
        reference = `Vendor Settlement Disbursement - ${partner.display_name}`;
        lines = [
          {
            account_id: creditorsAcc,
            partner_id: partner.id,
            description: `Creditors A/c Settlement - ${partner.display_name}`,
            debit_amount: totalAmount,
            credit_amount: 0
          },
          {
            account_id: bankAcc,
            partner_id: partner.id,
            description: 'HDFC Bank Outward NEFT/RTGS',
            debit_amount: 0,
            credit_amount: totalAmount
          }
        ];
      } else {
        // General / Expense / Stock Journal: Dr Other Exp / Inventory, Cr Cash / Bank
        journalId = cashJrnId;
        entryNumber = `CSH/2026/${String(i).padStart(4, '0')}`;
        reference = `Operational Expense Voucher #${i} - ${partner.display_name}`;
        lines = [
          {
            account_id: otherExpAcc,
            partner_id: partner.id,
            description: `Operational Utility & Workshop Expense #${i}`,
            debit_amount: totalAmount,
            credit_amount: 0
          },
          {
            account_id: cashAcc,
            partner_id: partner.id,
            description: 'Cash Counter Disbursement',
            debit_amount: 0,
            credit_amount: totalAmount
          }
        ];
      }

      await prisma.journal_entries.create({
        data: {
          organization_id: org.id,
          journal_id: journalId,
          entry_number: entryNumber,
          entry_date: entryDate,
          partner_id: partner.id,
          reference: reference,
          status: 'posted',
          total_amount: totalAmount,
          journal_entry_lines: {
            create: lines
          }
        }
      });
    }
  }

  const allJEs = await prisma.journal_entries.findMany({ where: { organization_id: org.id } });
  console.log(`✅ Total Journal Entries in DB: ${allJEs.length}`);

  // ─────────────────────────────────────────────────────────────
  // 10. GENERATE 300 PAYMENTS & ALLOCATIONS
  // ─────────────────────────────────────────────────────────────
  console.log('💳 Seeding 300 Payments & Allocations...');
  const currentPayCount = await prisma.payments.count({ where: { organization_id: org.id } });
  const payToCreate = Math.max(0, 300 - currentPayCount);

  if (payToCreate > 0) {
    console.log(`Generating ${payToCreate} payments...`);
    const invoiceDocs = await prisma.commercial_documents.findMany({
      where: {
        organization_id: org.id,
        document_type: { in: ['customer_invoice', 'vendor_bill', 'sales_order', 'purchase_order'] }
      }
    });

    const paymentMethods = ['bank_transfer', 'neft', 'rtgs', 'upi', 'cheque'];

    for (let i = currentPayCount + 1; i <= 300; i++) {
      const isInbound = i % 2 === 1;
      const contact = allContacts[(i * 3) % allContacts.length];
      const doc = invoiceDocs.length > 0 ? invoiceDocs[(i - 1) % invoiceDocs.length] : null;
      const payNumber = `PAY-2026-${String(i).padStart(4, '0')}`;
      const amount = doc ? Number(doc.total_amount) : 12500 + ((i * 450) % 65000);
      const method = paymentMethods[(i - 1) % paymentMethods.length];

      const dayOffset = (i * 2) % 240;
      const payDate = new Date(new Date('2026-01-01').getTime() + dayOffset * 24 * 60 * 60 * 1000);

      const payment = await prisma.payments.create({
        data: {
          organization_id: org.id,
          contact_id: contact.id,
          payment_number: payNumber,
          payment_date: payDate,
          payment_direction: isInbound ? 'inbound' : 'outbound',
          payment_method: method,
          amount: amount,
          currency_code: 'INR'
        }
      });

      // Allocate to document if available
      if (doc) {
        await prisma.payment_allocations.create({
          data: {
            payment_id: payment.id,
            commercial_document_id: doc.id,
            allocated_amount: amount
          }
        });
      }
    }
  }

  const allPayments = await prisma.payments.findMany({ where: { organization_id: org.id } });
  console.log(`✅ Total Payments in DB: ${allPayments.length}`);

  // ─────────────────────────────────────────────────────────────
  // 11. GENERATE BUDGETS & BUDGET LINES
  // ─────────────────────────────────────────────────────────────
  console.log('📊 Seeding Budgets & Budget Lines...');
  const currentBudgetCount = await prisma.budgets.count({ where: { organization_id: org.id } });
  
  if (currentBudgetCount < 12) {
    const months = [
      'January 2026', 'February 2026', 'March 2026', 'April 2026',
      'May 2026', 'June 2026', 'July 2026', 'August 2026',
      'September 2026', 'October 2026', 'November 2026', 'December 2026'
    ];

    for (let m = currentBudgetCount; m < 12; m++) {
      const monthName = months[m];
      const start = new Date(`2026-${String(m + 1).padStart(2, '0')}-01`);
      const end = new Date(2026, m + 1, 0);

      const budgetLines = Object.values(analyticMap).map((anId, idx) => {
        const planned = 150000 + (idx * 50000);
        const committed = planned;
        const achieved = Math.round(planned * (0.3 + Math.random() * 0.65));
        const toAchieve = Math.max(0, committed - achieved);

        return {
          analytic_account_id: anId,
          account_id: coaMap['5010'] || Object.values(coaMap)[0],
          line_type: idx === 1 ? 'income' : 'expense',
          planned_amount: planned,
          committed_amount: committed,
          achieved_amount: achieved,
          amount_to_achieve: toAchieve
        };
      });

      await prisma.budgets.create({
        data: {
          organization_id: org.id,
          name: monthName,
          period_start: start,
          period_end: end,
          currency_code: 'INR',
          status: m < 9 ? 'confirm' : 'draft',
          responsible: 'Administrator',
          budget_lines: {
            create: budgetLines
          }
        }
      });
    }
  }

  const allBudgets = await prisma.budgets.findMany({ where: { organization_id: org.id } });
  const allBudgetLines = await prisma.budget_lines.count();
  console.log(`✅ Total Budgets in DB: ${allBudgets.length} (with ${allBudgetLines} budget line allocations)`);

  console.log('\n🎉 ALL 300+ ENTRIES SUCCESSFULLY POPULATED IN DATABASE!');
}

seed300Entries()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('❌ Seeding error:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
