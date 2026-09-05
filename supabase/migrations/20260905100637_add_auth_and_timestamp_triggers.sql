-- Keeps updated_at correct whenever a mutable row is changed.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create an app profile whenever a Supabase Auth user is created.
-- This implementation supports email/password sign-up.
create or replace function public.create_app_user_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_login_id text;
begin
  requested_login_id := new.raw_user_meta_data ->> 'login_id';

  if new.email is null then
    raise exception 'Email is required for this application';
  end if;

  if requested_login_id is null
     or requested_login_id !~ '^[A-Za-z0-9_]{6,12}$' then
    raise exception
      'login_id must contain 6-12 letters, digits, or underscores';
  end if;

  insert into public.app_users (
    id,
    email,
    login_id,
    display_name
  )
  values (
    new.id,
    new.email,
    requested_login_id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      requested_login_id
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.create_app_user_for_auth_user();

-- Timestamp triggers for mutable tables.
create trigger set_updated_at_organizations
before update on public.organizations
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_app_users
before update on public.app_users
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_organization_memberships
before update on public.organization_memberships
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_contacts
before update on public.contacts
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_contact_addresses
before update on public.contact_addresses
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_contact_portal_accounts
before update on public.contact_portal_accounts
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_product_categories
before update on public.product_categories
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_products
before update on public.products
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_product_components
before update on public.product_components
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_inventory_locations
before update on public.inventory_locations
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_chart_of_accounts
before update on public.chart_of_accounts
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_journals
before update on public.journals
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_tax_rates
before update on public.tax_rates
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_analytic_accounts
before update on public.analytic_accounts
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_commercial_documents
before update on public.commercial_documents
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_commercial_document_lines
before update on public.commercial_document_lines
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_payments
before update on public.payments
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_payment_allocations
before update on public.payment_allocations
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_journal_entries
before update on public.journal_entries
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_journal_entry_lines
before update on public.journal_entry_lines
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_budgets
before update on public.budgets
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_budget_lines
before update on public.budget_lines
for each row execute procedure public.set_updated_at();