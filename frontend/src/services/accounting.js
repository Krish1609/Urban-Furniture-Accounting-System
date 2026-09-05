import { requireSupabase } from '../lib/supabase';

async function getOrganizationId(userId) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data?.organization_id) {
    throw new Error('Your account is not assigned to an organization yet. Run the latest Supabase migration.');
  }

  return data.organization_id;
}

export async function loadAccountingData(userId) {
  const supabase = requireSupabase();
  const organizationId = await getOrganizationId(userId);
  const [contacts, products, accounts, journals, analyticAccounts, budgets] = await Promise.all([
    supabase.from('contacts').select('*, contact_addresses(*)').eq('organization_id', organizationId).is('deleted_at', null).order('display_name'),
    supabase.from('products').select('*, product_categories(name)').eq('organization_id', organizationId).is('deleted_at', null).order('name'),
    supabase.from('chart_of_accounts').select('*').eq('organization_id', organizationId).eq('is_active', true).order('account_code'),
    supabase.from('journals').select('*').eq('organization_id', organizationId).eq('is_active', true).order('name'),
    supabase.from('analytic_accounts').select('*').eq('organization_id', organizationId).eq('is_active', true).order('name'),
    supabase.from('budgets').select('*, budget_lines(*)').eq('organization_id', organizationId).order('created_at', { ascending: false }),
  ]);

  for (const result of [contacts, products, accounts, journals, analyticAccounts, budgets]) {
    if (result.error) throw result.error;
  }

  return {
    organizationId,
    contacts: contacts.data.map((contact) => ({
      id: contact.id,
      name: contact.display_name,
      type: contact.contact_type[0].toUpperCase() + contact.contact_type.slice(1),
      email: contact.email || '',
      mobile: contact.phone || '',
      city: contact.contact_addresses?.find((address) => address.is_default)?.city || '',
      state: contact.contact_addresses?.find((address) => address.is_default)?.state || '',
      pincode: contact.contact_addresses?.find((address) => address.is_default)?.postal_code || '',
      status: contact.is_active ? 'Active' : 'Inactive',
      totalBilled: 0,
      totalPaid: 0,
      dueAmount: 0,
    })),
    products: products.data.map((product) => ({
      id: product.id,
      name: product.name,
      type: product.product_type[0].toUpperCase() + product.product_type.slice(1),
      category: product.product_categories?.name || '',
      salesPrice: Number(product.sales_price),
      costPrice: Number(product.cost_price),
      taxRate: 0,
      stockQty: 0,
      sku: product.sku || '',
    })),
    chartOfAccounts: accounts.data.map((account) => ({
      id: account.id,
      code: account.account_code,
      name: account.name,
      type: account.account_type,
      balance: 0,
    })),
    journals: journals.data,
    analyticAccounts: analyticAccounts.data,
    budgets: budgets.data,
  };
}

export async function createContact(userId, contact) {
  const supabase = requireSupabase();
  const organizationId = await getOrganizationId(userId);
  const { data, error } = await supabase.from('contacts').insert({
    organization_id: organizationId,
    display_name: contact.name,
    contact_type: contact.type.toLowerCase(),
    email: contact.email || null,
    phone: contact.mobile || null,
  }).select().single();

  if (error) throw error;
  return data;
}

export async function createProduct(userId, product) {
  const supabase = requireSupabase();
  const organizationId = await getOrganizationId(userId);
  const { data, error } = await supabase.from('products').insert({
    organization_id: organizationId,
    name: product.name,
    product_type: product.type.toLowerCase(),
    sku: product.sku,
    sales_price: product.salesPrice,
    cost_price: product.costPrice,
  }).select().single();

  if (error) throw error;
  return data;
}