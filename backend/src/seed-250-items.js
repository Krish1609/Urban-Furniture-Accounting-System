import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from './lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const CATEGORIES_DATA = [
  { name: 'Ergonomic Seating', code: 'SEAT' },
  { name: 'Living Room Furniture', code: 'LVNG' },
  { name: 'Bedroom Furniture', code: 'BED' },
  { name: 'Dining Room Furniture', code: 'DINE' },
  { name: 'Tables & Workstations', code: 'TBL' },
  { name: 'Storage & Cabinets', code: 'STRG' },
  { name: 'Outdoor & Patio Furniture', code: 'OUT' },
  { name: 'Decor & Lighting', code: 'DEC' },
  { name: 'Services & Fitting', code: 'SERV' },
];

const ADJECTIVES = [
  'Royal', 'Malabar', 'Heritage', 'Nordic', 'Zenith', 'Apex', 'Urban', 'Elegance', 'Artisan', 'Imperial',
  'Craftsman', 'Nova', 'Aura', 'Summit', 'Vanguard', 'Signature', 'Regal', 'Oasis', 'Cosmo', 'Metro',
  'Symphony', 'Opus', 'Haven', 'Rustic', 'Modernist', 'Milano', 'Copenhagen', 'Kashmir', 'Jaipur', 'Indus'
];

const MATERIALS = [
  'Solid Teak Wood', 'Kiln-Dried Sheesham Wood', 'Grade-A European Beechwood', 'Engineered Oak Veneer',
  'American Black Walnut', 'Powder-Coated Matte Carbon Steel', 'Top-Grain Italian Nappa Leather',
  'High-Resilience Boucle Fabric', 'Premium Microfiber Velvet', 'All-Weather Synthetic Rattan',
  'Imported Italian White Carrara Marble', 'Tempered Fluted Glass', 'Acoustic Felt & Ash Wood'
];

const FINISHES = ['Honey Teak Finish', 'Rich Walnut Polish', 'Matte Charcoal Ash', 'Natural Raw Oak Finish', 'Glossy Espresso', 'Golden Brass Trim'];

const PRODUCT_TEMPLATES = [
  // SEAT
  { cat: 'Ergonomic Seating', type: 'goods', name: 'High-Back Executive Ergonomic Chair', minPrice: 14000, maxPrice: 32000 },
  { cat: 'Ergonomic Seating', type: 'goods', name: 'Mesh Swivel Task Chair with 3D Armrests', minPrice: 8500, maxPrice: 19500 },
  { cat: 'Ergonomic Seating', type: 'goods', name: 'Contoured Lumbar Conference Chair', minPrice: 7200, maxPrice: 16000 },
  { cat: 'Ergonomic Seating', type: 'goods', name: 'Mid-Century Velvet Accent Armchair', minPrice: 12500, maxPrice: 28000 },
  { cat: 'Ergonomic Seating', type: 'goods', name: 'Top-Grain Leather Recliner with Ottoman', minPrice: 28000, maxPrice: 65000 },
  { cat: 'Ergonomic Seating', type: 'goods', name: 'Minimalist Wooden Bar Stool with Footrest', minPrice: 4200, maxPrice: 9500 },
  { cat: 'Ergonomic Seating', type: 'goods', name: 'Bespoke Wingback Reading Chair', minPrice: 16000, maxPrice: 34000 },
  { cat: 'Ergonomic Seating', type: 'goods', name: 'Ergonomic Kneeling Posture Chair', minPrice: 6500, maxPrice: 13500 },

  // LVNG
  { cat: 'Living Room Furniture', type: 'goods', name: '3-Seater Chesterfield Velvet Sofa', minPrice: 38000, maxPrice: 75000 },
  { cat: 'Living Room Furniture', type: 'goods', name: 'Modular L-Shape Reversible Sectional', minPrice: 48000, maxPrice: 98000 },
  { cat: 'Living Room Furniture', type: 'goods', name: 'Convertible Fabric Daybed & Divan', minPrice: 22000, maxPrice: 42000 },
  { cat: 'Living Room Furniture', type: 'goods', name: '2-Seater Compact Apartment Loveseat', minPrice: 19000, maxPrice: 36000 },
  { cat: 'Living Room Furniture', type: 'goods', name: 'Cushioned Storage Ottoman Bench', minPrice: 6500, maxPrice: 14500 },
  { cat: 'Living Room Furniture', type: 'goods', name: 'Curved Boucle Cloud Sofa', minPrice: 52000, maxPrice: 110000 },
  { cat: 'Living Room Furniture', type: 'goods', name: 'Scandinavian Chaise Lounge', minPrice: 24000, maxPrice: 49000 },

  // BED
  { cat: 'Bedroom Furniture', type: 'goods', name: 'King Size Hydraulic Storage Bed', minPrice: 42000, maxPrice: 85000 },
  { cat: 'Bedroom Furniture', type: 'goods', name: 'Queen Platform Bed with Floating Headboard', minPrice: 32000, maxPrice: 68000 },
  { cat: 'Bedroom Furniture', type: 'goods', name: 'Solid Wood Poster Canopy Bed', minPrice: 48000, maxPrice: 96000 },
  { cat: 'Bedroom Furniture', type: 'goods', name: '2-Drawer Bedside Nightstand Table', minPrice: 4500, maxPrice: 11000 },
  { cat: 'Bedroom Furniture', type: 'goods', name: 'Vanity Dressing Console with LED Mirror', minPrice: 18500, maxPrice: 39000 },
  { cat: 'Bedroom Furniture', type: 'goods', name: 'Tufted Velvet Upholstered Bed Base', minPrice: 36000, maxPrice: 72000 },
  { cat: 'Bedroom Furniture', type: 'goods', name: 'Solid Wood 6-Drawer Tallboy Dresser', minPrice: 24000, maxPrice: 46000 },

  // DINE
  { cat: 'Dining Room Furniture', type: 'goods', name: '6-Seater Solid Wood Dining Table', minPrice: 32000, maxPrice: 68000 },
  { cat: 'Dining Room Furniture', type: 'goods', name: '4-Seater Compact Round Dining Table', minPrice: 18000, maxPrice: 38000 },
  { cat: 'Dining Room Furniture', type: 'goods', name: '8-Seater Extendable Banquet Dining Table', minPrice: 52000, maxPrice: 115000 },
  { cat: 'Dining Room Furniture', type: 'goods', name: 'Italian Marble Top 6-Seater Dining Table', minPrice: 58000, maxPrice: 125000 },
  { cat: 'Dining Room Furniture', type: 'goods', name: 'Pair of Cushioned Ergonomic Dining Chairs', minPrice: 7500, maxPrice: 18000 },
  { cat: 'Dining Room Furniture', type: 'goods', name: 'Industrial Solid Wood Dining Bench', minPrice: 9500, maxPrice: 21000 },
  { cat: 'Dining Room Furniture', type: 'goods', name: 'Buffet Sideboard & Crockery Cabinet', minPrice: 28000, maxPrice: 58000 },

  // TBL
  { cat: 'Tables & Workstations', type: 'goods', name: 'Dual-Motor Motorized Standing Desk', minPrice: 24000, maxPrice: 48000 },
  { cat: 'Tables & Workstations', type: 'goods', name: 'Executive L-Shape Corner Office Desk', minPrice: 34000, maxPrice: 72000 },
  { cat: 'Tables & Workstations', type: 'goods', name: 'Minimalist Solid Wood Study Writing Desk', minPrice: 14000, maxPrice: 29000 },
  { cat: 'Tables & Workstations', type: 'goods', name: 'Set of 3 Round Nesting Coffee Tables', minPrice: 8500, maxPrice: 19500 },
  { cat: 'Tables & Workstations', type: 'goods', name: 'Tempered Glass Center Table with Brass Base', minPrice: 12000, maxPrice: 26000 },
  { cat: 'Tables & Workstations', type: 'goods', name: '10-Seater Boardroom Conference Table', minPrice: 65000, maxPrice: 140000 },
  { cat: 'Tables & Workstations', type: 'goods', name: 'C-Shape Mobile Sofa Side Table', minPrice: 3200, maxPrice: 7500 },

  // STRG
  { cat: 'Storage & Cabinets', type: 'goods', name: '4-Door Wardrobe with Full-Length Mirror', minPrice: 44000, maxPrice: 89000 },
  { cat: 'Storage & Cabinets', type: 'goods', name: 'Sliding 2-Door Wardrobe with Soft-Close', minPrice: 36000, maxPrice: 76000 },
  { cat: 'Storage & Cabinets', type: 'goods', name: '5-Tier Open Geometric Bookshelf', minPrice: 11000, maxPrice: 24000 },
  { cat: 'Storage & Cabinets', type: 'goods', name: 'Modular Wall-Mounted Entertainment TV Unit', minPrice: 19500, maxPrice: 42000 },
  { cat: 'Storage & Cabinets', type: 'goods', name: 'Multi-Compartment Wooden Shoe Rack', minPrice: 6800, maxPrice: 15500 },
  { cat: 'Storage & Cabinets', type: 'goods', name: '3-Door Office Credenza Storage Cabinet', minPrice: 16500, maxPrice: 34000 },
  { cat: 'Storage & Cabinets', type: 'goods', name: 'Heavy-Duty Steel Lateral Filing Cabinet', minPrice: 12500, maxPrice: 26000 },

  // OUT
  { cat: 'Outdoor & Patio Furniture', type: 'goods', name: 'All-Weather Rattan Wicker 4-Piece Patio Set', minPrice: 38000, maxPrice: 82000 },
  { cat: 'Outdoor & Patio Furniture', type: 'goods', name: 'Cast Aluminum 3-Piece Balcony Bistro Set', minPrice: 14500, maxPrice: 29000 },
  { cat: 'Outdoor & Patio Furniture', type: 'goods', name: 'Teakwood Slatted Garden Park Bench', minPrice: 12000, maxPrice: 26000 },
  { cat: 'Outdoor & Patio Furniture', type: 'goods', name: 'Adjustable Poolside Sun Lounger Recliner', minPrice: 16000, maxPrice: 34000 },
  { cat: 'Outdoor & Patio Furniture', type: 'goods', name: 'Suspended Wicker Hanging Egg Swing Chair', minPrice: 13500, maxPrice: 28000 },

  // DEC
  { cat: 'Decor & Lighting', type: 'goods', name: 'Nordic Tripod Timber Floor Lamp', minPrice: 4200, maxPrice: 9800 },
  { cat: 'Decor & Lighting', type: 'goods', name: 'Arched Full-Length Dressing Floor Mirror', minPrice: 7800, maxPrice: 16500 },
  { cat: 'Decor & Lighting', type: 'goods', name: 'Hand-Carved Wooden Wall Art Panel', minPrice: 3500, maxPrice: 8500 },
  { cat: 'Decor & Lighting', type: 'goods', name: 'Brass Inlay Geometric Floating Wall Shelves', minPrice: 2900, maxPrice: 6500 },

  // SERV
  { cat: 'Services & Fitting', type: 'service', name: 'On-Site Modular Furniture Assembly Service', minPrice: 1500, maxPrice: 3500 },
  { cat: 'Services & Fitting', type: 'service', name: 'Wood Buffing & High-Gloss Polishing Service', minPrice: 2800, maxPrice: 6200 },
  { cat: 'Services & Fitting', type: 'service', name: 'Custom Wardrobe Interior Fitting & Alignment', minPrice: 3500, maxPrice: 8500 },
  { cat: 'Services & Fitting', type: 'service', name: 'Premium Fabric Deep Cleaning & Sterilization', minPrice: 1800, maxPrice: 4200 },
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min, max, step = 100) {
  const count = Math.floor((max - min) / step);
  return min + Math.floor(Math.random() * count) * step;
}

async function seed250Items() {
  console.log('🚀 Starting generation of 250 Furniture Items...');

  const org = await prisma.organizations.findFirst({
    where: { name: 'Urban Furniture' }
  }) || await prisma.organizations.findFirst();

  if (!org) throw new Error('No organization found.');

  // Ensure accounts
  let incomeAcc = await prisma.chart_of_accounts.findFirst({
    where: { organization_id: org.id, account_code: '4010' }
  });
  let expenseAcc = await prisma.chart_of_accounts.findFirst({
    where: { organization_id: org.id, account_code: '5010' }
  });

  // Ensure all categories exist
  const categoryMap = {};
  for (const c of CATEGORIES_DATA) {
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
  console.log('✅ Categories verified.');

  // Find existing SKUs to avoid collision
  const existingProducts = await prisma.products.findMany({
    select: { sku: true }
  });
  const existingSkus = new Set(existingProducts.map(p => p.sku.toUpperCase()));

  const itemsToCreate = [];
  const TOTAL_TARGET = 250;

  for (let i = 1; i <= TOTAL_TARGET; i++) {
    const tpl = getRandom(PRODUCT_TEMPLATES);
    const adj = getRandom(ADJECTIVES);
    const material = getRandom(MATERIALS);
    const finish = getRandom(FINISHES);

    const productName = `${adj} ${tpl.name}`;
    const catCode = CATEGORIES_DATA.find(c => c.name === tpl.cat)?.code || 'FUR';

    // Generate unique SKU
    let skuNumber = i + 10;
    let sku = `${catCode}-${String(skuNumber).padStart(4, '0')}`;
    while (existingSkus.has(sku)) {
      skuNumber += 100;
      sku = `${catCode}-${String(skuNumber).padStart(4, '0')}`;
    }
    existingSkus.add(sku);

    const salesPrice = getRandomNumber(tpl.minPrice, tpl.maxPrice, 250);
    // Cost price ~ 55-65% of sales price
    const costFactor = 0.55 + Math.random() * 0.12;
    const costPrice = Math.round((salesPrice * costFactor) / 100) * 100;

    const description = `${productName} crafted from premium ${material} with ${finish}. Designed for high durability and ergonomic comfort. Includes 3-year structural warranty and eco-friendly protective coating.`;

    itemsToCreate.push({
      organization_id: org.id,
      category_id: categoryMap[tpl.cat],
      sku,
      name: productName,
      description,
      product_type: tpl.type,
      sales_price: salesPrice,
      cost_price: costPrice,
      income_account_id: incomeAcc?.id || null,
      expense_account_id: expenseAcc?.id || null,
      is_active: true,
      initialStock: tpl.type === 'goods' ? Math.floor(15 + Math.random() * 55) : 0
    });
  }

  console.log(`📦 Inserting ${itemsToCreate.length} products into MySQL...`);

  let insertedCount = 0;
  const BATCH_SIZE = 25;

  for (let i = 0; i < itemsToCreate.length; i += BATCH_SIZE) {
    const batch = itemsToCreate.slice(i, i + BATCH_SIZE);

    for (const item of batch) {
      const createdProd = await prisma.products.create({
        data: {
          organization_id: item.organization_id,
          category_id: item.category_id,
          sku: item.sku,
          name: item.name,
          description: item.description,
          product_type: item.product_type,
          sales_price: item.sales_price,
          cost_price: item.cost_price,
          income_account_id: item.income_account_id,
          expense_account_id: item.expense_account_id,
          is_active: item.is_active
        }
      });

      // Add opening stock movement for goods
      if (item.initialStock > 0) {
        await prisma.inventory_movements.create({
          data: {
            product_id: createdProd.id,
            movement_type: 'opening_stock',
            quantity_delta: item.initialStock,
            reference_type: 'initial_catalog_seed',
            reference_id: createdProd.sku
          }
        });
      }

      insertedCount++;
    }

    console.log(`   ⏳ Inserted ${insertedCount} / ${TOTAL_TARGET} items...`);
  }

  const finalCount = await prisma.products.count();
  console.log(`\n🎉 SUCCESS: Added ${insertedCount} furniture items!`);
  console.log(`📊 Total products in catalog: ${finalCount}`);
}

seed250Items()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('❌ Error adding 250 items:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
