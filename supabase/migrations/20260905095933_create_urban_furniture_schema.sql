create extension if not exists pgcrypto;
create extension if not exists citext;

-- Enums
create type public.user_role as enum ('admin', 'accountant', 'contact_portal');
create type public.contact_type as enum ('customer', 'vendor', 'both');
create type public.address_type as enum ('billing', 'shipping', 'other');
create type public.product_type as enum ('goods', 'service', 'combo');
create type public.account_type as enum ('asset', 'liability', 'equity', 'income', 'expense');
create type public.journal_type as enum ('sales', 'purchase', 'cash', 'bank', 'general');
create type public.commercial_document_type as enum (
  'sales_order',
  'customer_invoice',
  'purchase_order',
  'vendor_bill'
);
create type public.commercial_document_status as enum (
  'draft',
  'confirmed',
  'cancelled',
  'posted',
  'partially_paid',
  'paid'
);
create type public.payment_direction as enum ('inbound', 'outbound');
create type public.payment_status as enum ('draft', 'posted', 'cancelled');
create type public.journal_entry_status as enum ('draft', 'posted', 'reversed');
create type public.analytic_type as enum ('income', 'expense', 'mixed');
create type public.budget_status as enum ('draft', 'active', 'closed', 'cancelled');
create type public.inventory_movement_type as enum (
  'purchase_receipt',
  'sale_delivery',
  'adjustment',
  'opening_balance',
  'combo_build'
);
create type public.audit_action as enum (
  'insert',
  'update',
  'delete',
  'login',
  'post',
  'reverse'
);

-- Organization / tenant
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name varchar(200) not null unique,
  base_currency char(3) not null check (base_currency ~ '^[A-Z]{3}$'),
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Application profile. Credentials are managed exclusively by auth.users.
create table public.app_users (
  id uuid primary key references auth.users(id) on delete restrict,
  email citext not null,
  login_id varchar(64) not null
    check (char_length(login_id) between 6 and 12),
  display_name varchar(200) not null,
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index uq_app_users_email_active
  on public.app_users (email)
  where deleted_at is null;

create unique index uq_app_users_login_active
  on public.app_users (login_id)
  where deleted_at is null;

-- A user can belong to one or more organizations.
create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations(id) on delete cascade,
  user_id uuid not null
    references public.app_users(id) on delete restrict,
  role public.user_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references public.app_users(id) on delete set null,
  updated_by_user_id uuid references public.app_users(id) on delete set null,
  unique (organization_id, user_id)
);

create index ix_memberships_user_org
  on public.organization_memberships(user_id, organization_id);

-- Contact master
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations(id) on delete cascade,
  display_name varchar(200) not null,
  contact_type public.contact_type not null,
  email citext,
  phone varchar(40),
  profile_media_url text,
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references public.app_users(id) on delete set null,
  updated_by_user_id uuid references public.app_users(id) on delete set null
);

create unique index uq_contacts_org_email_active
  on public.contacts(organization_id, email)
  where email is not null and deleted_at is null;

create index ix_contacts_org_name
  on public.contacts(organization_id, display_name);

create index ix_contacts_org_type
  on public.contacts(organization_id, contact_type);

create table public.contact_addresses (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null
    references public.contacts(id) on delete cascade,
  address_type public.address_type not null,
  line1 varchar(200) not null,
  line2 varchar(200),
  city varchar(100),
  state varchar(100),
  postal_code varchar(30),
  country_code char(2),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references public.app_users(id) on delete set null,
  updated_by_user_id uuid references public.app_users(id) on delete set null
);

create index ix_contact_addresses_contact_type
  on public.contact_addresses(contact_id, address_type);

create unique index uq_contact_default_address
  on public.contact_addresses(contact_id, address_type)
  where is_default;

-- Connects a customer/vendor record to a portal user membership.
create table public.contact_portal_accounts (
  contact_id uuid primary key
    references public.contacts(id) on delete cascade,
  membership_id uuid not null unique
    references public.organization_memberships(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Product master
create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations(id) on delete cascade,
  name varchar(120) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references public.app_users(id) on delete set null,
  updated_by_user_id uuid references public.app_users(id) on delete set null,
  unique (organization_id, name)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations(id) on delete cascade,
  category_id uuid
    references public.product_categories(id) on delete set null,
  name varchar(200) not null,
  product_type public.product_type not null,
  sku varchar(80),
  sales_price numeric(18,2) not null default 0
    check (sales_price >= 0),
  cost_price numeric(18,2) not null default 0
    check (cost_price >= 0),
  image_url text,
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references public.app_users(id) on delete set null,
  updated_by_user_id uuid references public.app_users(id) on delete set null
);

create unique index uq_products_org_name_active
  on public.products(organization_id, name)
  where deleted_at is null;

create unique index uq_products_org_sku_active
  on public.products(organization_id, sku)
  where sku is not null and deleted_at is null;

create index ix_products_org_category
  on public.products(organization_id, category_id);

-- Components for products whose product_type is combo.
create table public.product_components (
  combo_product_id uuid not null
    references public.products(id) on delete restrict,
  component_product_id uuid not null
    references public.products(id) on delete restrict,
  quantity numeric(18,4) not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references public.app_users(id) on delete set null,
  updated_by_user_id uuid references public.app_users(id) on delete set null,
  primary key (combo_product_id, component_product_id),
  check (combo_product_id <> component_product_id)
);

-- Inventory
create table public.inventory_locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations(id) on delete cascade,
  name varchar(120) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

-- Chart of accounts and journals
create table public.chart_of_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations(id) on delete cascade,
  account_code varchar(32) not null,
  name varchar(160) not null,
  account_type public.account_type not null,
  is_active boolean not null default true,
  allow_manual_posting boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references public.app_users(id) on delete set null,
  updated_by_user_id uuid references public.app_users(id) on delete set null,
  unique (organization_id, account_code),
  unique (organization_id, name)
);

create index ix_chart_of_accounts_org_type
  on public.chart_of_accounts(organization_id, account_type, is_active);

create table public.journals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations(id) on delete cascade,
  name varchar(120) not null,
  journal_type public.journal_type not null,
  default_account_id uuid
    references public.chart_of_accounts(id) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references public.app_users(id) on delete set null,
  updated_by_user_id uuid references public.app_users(id) on delete set null,
  unique (organization_id, name)
);

create index ix_journals_org_type
  on public.journals(organization_id, journal_type);

create table public.tax_rates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations(id) on delete cascade,
  name varchar(100) not null,
  rate_percent numeric(7,4) not null
    check (rate_percent between 0 and 100),
  sales_tax_account_id uuid
    references public.chart_of_accounts(id) on delete restrict,
  purchase_tax_account_id uuid
    references public.chart_of_accounts(id) on delete restrict,
  effective_from date not null,
  effective_to date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references public.app_users(id) on delete set null,
  updated_by_user_id uuid references public.app_users(id) on delete set null,
  check (effective_to is null or effective_to >= effective_from),
  unique (organization_id, name, effective_from)
);

create table public.analytic_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations(id) on delete cascade,
  name varchar(160) not null,
  analytic_type public.analytic_type not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references public.app_users(id) on delete set null,
  updated_by_user_id uuid references public.app_users(id) on delete set null,
  unique (organization_id, name)
);

-- Orders, invoices, purchase orders, and vendor bills
create table public.commercial_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations(id) on delete cascade,
  document_type public.commercial_document_type not null,
  document_number varchar(64) not null,
  status public.commercial_document_status not null default 'draft',
  contact_id uuid not null
    references public.contacts(id) on delete restrict,
  origin_document_id uuid
    references public.commercial_documents(id) on delete restrict,
  document_date date not null,
  due_date date,
  currency_code char(3) not null
    check (currency_code ~ '^[A-Z]{3}$'),
  journal_id uuid
    references public.journals(id) on delete restrict,
  subtotal_amount numeric(18,2) not null default 0
    check (subtotal_amount >= 0),
  tax_amount numeric(18,2) not null default 0
    check (tax_amount >= 0),
  total_amount numeric(18,2) not null default 0
    check (total_amount >= 0),
  notes text,
  confirmed_at timestamptz,
  posted_at timestamptz,
  cancelled_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references public.app_users(id) on delete set null,
  updated_by_user_id uuid references public.app_users(id) on delete set null,
  unique (organization_id, document_type, document_number),
  check (due_date is null or due_date >= document_date),
  check (origin_document_id is null or origin_document_id <> id)
);

create index ix_documents_org_status_date
  on public.commercial_documents(
    organization_id,
    document_type,
    status,
    document_date
  );

create index ix_documents_contact_due
  on public.commercial_documents(contact_id, status, due_date);

create index ix_documents_origin
  on public.commercial_documents(origin_document_id);

create table public.commercial_document_lines (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null
    references public.commercial_documents(id) on delete cascade,
  line_number integer not null check (line_number > 0),
  product_id uuid
    references public.products(id) on delete restrict,
  description text not null,
  quantity numeric(18,4) not null check (quantity > 0),
  unit_price numeric(18,2) not null check (unit_price >= 0),
  discount_percent numeric(7,4) not null default 0
    check (discount_percent between 0 and 100),
  tax_rate_id uuid
    references public.tax_rates(id) on delete restrict,
  tax_rate_percent numeric(7,4) not null default 0
    check (tax_rate_percent between 0 and 100),
  line_subtotal_amount numeric(18,2) not null
    check (line_subtotal_amount >= 0),
  line_tax_amount numeric(18,2) not null
    check (line_tax_amount >= 0),
  line_total_amount numeric(18,2) not null
    check (line_total_amount >= 0),
  analytic_account_id uuid
    references public.analytic_accounts(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references public.app_users(id) on delete set null,
  updated_by_user_id uuid references public.app_users(id) on delete set null,
  unique (document_id, line_number)
);

create index ix_document_lines_product
  on public.commercial_document_lines(product_id);

create index ix_document_lines_analytic
  on public.commercial_document_lines(analytic_account_id);

-- Customer receipts and vendor payments
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations(id) on delete cascade,
  payment_number varchar(64) not null,
  payment_direction public.payment_direction not null,
  status public.payment_status not null default 'draft',
  contact_id uuid not null
    references public.contacts(id) on delete restrict,
  journal_id uuid not null
    references public.journals(id) on delete restrict,
  payment_account_id uuid not null
    references public.chart_of_accounts(id) on delete restrict,
  payment_date date not null,
  amount numeric(18,2) not null check (amount > 0),
  currency_code char(3) not null
    check (currency_code ~ '^[A-Z]{3}$'),
  external_reference varchar(160),
  posted_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references public.app_users(id) on delete set null,
  updated_by_user_id uuid references public.app_users(id) on delete set null,
  unique (organization_id, payment_number)
);

create index ix_payments_org_status_date
  on public.payments(organization_id, status, payment_date);

create index ix_payments_contact_date
  on public.payments(contact_id, payment_date);

create table public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null
    references public.payments(id) on delete cascade,
  document_id uuid not null
    references public.commercial_documents(id) on delete restrict,
  allocated_amount numeric(18,2) not null
    check (allocated_amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references public.app_users(id) on delete set null,
  updated_by_user_id uuid references public.app_users(id) on delete set null,
  unique (payment_id, document_id)
);

create index ix_payment_allocations_document
  on public.payment_allocations(document_id);

-- Immutable general ledger
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations(id) on delete cascade,
  journal_id uuid not null
    references public.journals(id) on delete restrict,
  entry_number varchar(64) not null,
  entry_date date not null,
  status public.journal_entry_status not null default 'draft',
  reference varchar(160),
  description text,
  commercial_document_id uuid
    references public.commercial_documents(id) on delete restrict,
  payment_id uuid
    references public.payments(id) on delete restrict,
  posted_at timestamptz,
  reversed_at timestamptz,
  reversal_of_entry_id uuid
    references public.journal_entries(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references public.app_users(id) on delete set null,
  updated_by_user_id uuid references public.app_users(id) on delete set null,
  unique (organization_id, entry_number),
  check (
    not (
      commercial_document_id is not null
      and payment_id is not null
    )
  )
);

create unique index uq_posted_entry_document
  on public.journal_entries(commercial_document_id)
  where commercial_document_id is not null and status = 'posted';

create unique index uq_posted_entry_payment
  on public.journal_entries(payment_id)
  where payment_id is not null and status = 'posted';

create index ix_journal_entries_org_date
  on public.journal_entries(organization_id, entry_date, status);

create table public.journal_entry_lines (
  id uuid primary key default gen_random_uuid(),
  journal_entry_id uuid not null
    references public.journal_entries(id) on delete cascade,
  line_number integer not null check (line_number > 0),
  account_id uuid not null
    references public.chart_of_accounts(id) on delete restrict,
  partner_contact_id uuid
    references public.contacts(id) on delete restrict,
  analytic_account_id uuid
    references public.analytic_accounts(id) on delete restrict,
  debit_amount numeric(18,2) not null default 0
    check (debit_amount >= 0),
  credit_amount numeric(18,2) not null default 0
    check (credit_amount >= 0),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references public.app_users(id) on delete set null,
  updated_by_user_id uuid references public.app_users(id) on delete set null,
  unique (journal_entry_id, line_number),
  check (
    (debit_amount > 0 and credit_amount = 0)
    or
    (credit_amount > 0 and debit_amount = 0)
  )
);

create index ix_journal_entry_lines_account
  on public.journal_entry_lines(account_id, journal_entry_id);

create index ix_journal_entry_lines_analytic
  on public.journal_entry_lines(analytic_account_id, journal_entry_id);

-- Budgets
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations(id) on delete cascade,
  name varchar(160) not null,
  period_start date not null,
  period_end date not null,
  responsible_membership_id uuid
    references public.organization_memberships(id) on delete set null,
  status public.budget_status not null default 'draft',
  currency_code char(3) not null
    check (currency_code ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references public.app_users(id) on delete set null,
  updated_by_user_id uuid references public.app_users(id) on delete set null,
  unique (organization_id, name, period_start, period_end),
  check (period_end >= period_start)
);

create index ix_budgets_org_period
  on public.budgets(organization_id, status, period_start, period_end);

create table public.budget_lines (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null
    references public.budgets(id) on delete cascade,
  analytic_account_id uuid not null
    references public.analytic_accounts(id) on delete restrict,
  account_id uuid not null
    references public.chart_of_accounts(id) on delete restrict,
  planned_amount numeric(18,2) not null
    check (planned_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references public.app_users(id) on delete set null,
  updated_by_user_id uuid references public.app_users(id) on delete set null,
  unique (budget_id, analytic_account_id, account_id)
);

-- Stock ledger
create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations(id) on delete cascade,
  product_id uuid not null
    references public.products(id) on delete restrict,
  location_id uuid not null
    references public.inventory_locations(id) on delete restrict,
  movement_type public.inventory_movement_type not null,
  quantity_delta numeric(18,4) not null
    check (quantity_delta <> 0),
  occurred_at timestamptz not null,
  source_document_line_id uuid
    references public.commercial_document_lines(id) on delete set null,
  created_at timestamptz not null default now(),
  created_by_user_id uuid references public.app_users(id) on delete set null
);

create index ix_inventory_movements_balance
  on public.inventory_movements(
    organization_id,
    product_id,
    location_id,
    occurred_at
  );

-- Append-only audit history
create table public.audit_log (
  id bigint generated always as identity primary key,
  organization_id uuid
    references public.organizations(id) on delete set null,
  actor_user_id uuid
    references public.app_users(id) on delete set null,
  occurred_at timestamptz not null default now(),
  entity_table text not null,
  entity_id uuid not null,
  action public.audit_action not null,
  before_data jsonb,
  after_data jsonb,
  request_id uuid,
  ip_address inet
);

create index ix_audit_log_entity
  on public.audit_log(entity_table, entity_id, occurred_at desc);

create index ix_audit_log_organization_time
  on public.audit_log(organization_id, occurred_at desc);