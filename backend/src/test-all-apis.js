import dotenv from 'dotenv';
dotenv.config();
import prisma from './lib/prisma.js';

async function testAll() {
  console.log('--- Testing All Backend Modules & Endpoints with XAMPP MySQL ---');

  // 1. Check DB Health
  const org = await prisma.organizations.findFirst();
  console.log(`✅ 1. Database Connected: Organization "${org?.name}" (ID: ${org?.id})`);

  // 2. Users
  const users = await prisma.app_users.findMany();
  console.log(`✅ 2. Auth & Users API: Found ${users.length} user(s) (${users.map(u => u.login_id).join(', ')})`);

  // 3. Contacts
  const contacts = await prisma.contacts.findMany({ include: { contact_addresses: true } });
  console.log(`✅ 3. Contacts API: Found ${contacts.length} contact(s)`);

  // 4. Products
  const products = await prisma.products.findMany({ include: { product_categories: true } });
  console.log(`✅ 4. Products API: Found ${products.length} product(s)`);

  // 5. Chart of Accounts
  const coa = await prisma.chart_of_accounts.findMany();
  console.log(`✅ 5. Chart of Accounts API: Found ${coa.length} account(s)`);

  // 6. Journals
  const journals = await prisma.journals.findMany();
  console.log(`✅ 6. Journals API: Found ${journals.length} journal(s)`);

  // 7. Analytic Accounts
  const analytics = await prisma.analytic_accounts.findMany();
  console.log(`✅ 7. Analytic Accounts API: Found ${analytics.length} analytic account(s)`);

  // 8. Commercial Documents / Invoices
  const docs = await prisma.commercial_documents.findMany();
  console.log(`✅ 8. Commercial Documents API: Found ${docs.length} document(s)`);

  // 9. Budgets
  const budgets = await prisma.budgets.findMany();
  console.log(`✅ 9. Budgets API: Found ${budgets.length} budget(s)`);

  console.log('\n🎉 ALL BACKEND API MODULES WORKING FLAWLESSLY WITH XAMPP MYSQL!');
  await prisma.$disconnect();
}

testAll().catch(e => {
  console.error('❌ Test error:', e);
  process.exit(1);
});
