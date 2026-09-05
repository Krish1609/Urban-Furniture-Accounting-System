-- ============================================================
-- URBAN FURNITURE
-- ROW LEVEL SECURITY
-- ============================================================

-- ------------------------------------------------------------
-- 1. Enable RLS
-- ------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.app_users enable row level security;
alter table public.organization_memberships enable row level security;

alter table public.contacts enable row level security;
alter table public.contact_addresses enable row level security;
alter table public.contact_portal_accounts enable row level security;

alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_components enable row level security;

alter table public.inventory_locations enable row level security;
alter table public.inventory_movements enable row level security;

alter table public.chart_of_accounts enable row level security;
alter table public.journals enable row level security;
alter table public.tax_rates enable row level security;
alter table public.analytic_accounts enable row level security;

alter table public.commercial_documents enable row level security;
alter table public.commercial_document_lines enable row level security;

alter table public.payments enable row level security;
alter table public.payment_allocations enable row level security;

alter table public.journal_entries enable row level security;
alter table public.journal_entry_lines enable row level security;

alter table public.budgets enable row level security;
alter table public.budget_lines enable row level security;

alter table public.audit_log enable row level security;


-- ============================================================
-- 2. Helper: Is current user a member of organization?
-- ============================================================

create or replace function public.is_organization_member(
    target_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.organization_memberships om
        where om.organization_id = target_organization_id
          and om.user_id = auth.uid()
          and om.is_active = true
    );
$$;


-- ============================================================
-- 3. Helper: Get current user's role in organization
-- ============================================================

create or replace function public.get_organization_role(
    target_organization_id uuid
)
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
    select om.role
    from public.organization_memberships om
    where om.organization_id = target_organization_id
      and om.user_id = auth.uid()
      and om.is_active = true
    limit 1;
$$;


-- ============================================================
-- 4. Helper: Admin/accountant access
-- ============================================================

create or replace function public.can_manage_organization(
    target_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.organization_memberships om
        where om.organization_id = target_organization_id
          and om.user_id = auth.uid()
          and om.is_active = true
          and om.role in ('admin', 'accountant')
    );
$$;


-- ============================================================
-- 5. Helper: Admin only
-- ============================================================

create or replace function public.is_organization_admin(
    target_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.organization_memberships om
        where om.organization_id = target_organization_id
          and om.user_id = auth.uid()
          and om.is_active = true
          and om.role = 'admin'
    );
$$;


-- ============================================================
-- 6. ORGANIZATIONS
-- ============================================================

create policy "members can view organization"
on public.organizations
for select
to authenticated
using (
    public.is_organization_member(id)
);


create policy "admins can update organization"
on public.organizations
for update
to authenticated
using (
    public.is_organization_admin(id)
)
with check (
    public.is_organization_admin(id)
);


-- ============================================================
-- 7. APP USERS
-- ============================================================

create policy "users can view own profile"
on public.app_users
for select
to authenticated
using (
    id = auth.uid()
);


create policy "users can update own profile"
on public.app_users
for update
to authenticated
using (
    id = auth.uid()
)
with check (
    id = auth.uid()
);


-- ============================================================
-- 8. ORGANIZATION MEMBERSHIPS
-- ============================================================

create policy "members can view memberships"
on public.organization_memberships
for select
to authenticated
using (
    public.is_organization_member(organization_id)
);


create policy "admins can create memberships"
on public.organization_memberships
for insert
to authenticated
with check (
    public.is_organization_admin(organization_id)
);


create policy "admins can update memberships"
on public.organization_memberships
for update
to authenticated
using (
    public.is_organization_admin(organization_id)
)
with check (
    public.is_organization_admin(organization_id)
);


-- ============================================================
-- 9. CONTACTS
-- ============================================================

create policy "members can view contacts"
on public.contacts
for select
to authenticated
using (
    public.is_organization_member(organization_id)
);


create policy "accountants can create contacts"
on public.contacts
for insert
to authenticated
with check (
    public.can_manage_organization(organization_id)
);


create policy "accountants can update contacts"
on public.contacts
for update
to authenticated
using (
    public.can_manage_organization(organization_id)
)
with check (
    public.can_manage_organization(organization_id)
);


-- ============================================================
-- 10. CONTACT ADDRESSES
-- ============================================================

create policy "members can view contact addresses"
on public.contact_addresses
for select
to authenticated
using (
    exists (
        select 1
        from public.contacts c
        where c.id = contact_addresses.contact_id
          and public.is_organization_member(c.organization_id)
    )
);


create policy "accountants can manage contact addresses"
on public.contact_addresses
for all
to authenticated
using (
    exists (
        select 1
        from public.contacts c
        where c.id = contact_addresses.contact_id
          and public.can_manage_organization(c.organization_id)
    )
)
with check (
    exists (
        select 1
        from public.contacts c
        where c.id = contact_addresses.contact_id
          and public.can_manage_organization(c.organization_id)
    )
);


-- ============================================================
-- 11. PRODUCT CATEGORIES
-- ============================================================

create policy "members can view product categories"
on public.product_categories
for select
to authenticated
using (
    public.is_organization_member(organization_id)
);


create policy "accountants can manage product categories"
on public.product_categories
for all
to authenticated
using (
    public.can_manage_organization(organization_id)
)
with check (
    public.can_manage_organization(organization_id)
);


-- ============================================================
-- 12. PRODUCTS
-- ============================================================

create policy "members can view products"
on public.products
for select
to authenticated
using (
    public.is_organization_member(organization_id)
);


create policy "accountants can manage products"
on public.products
for all
to authenticated
using (
    public.can_manage_organization(organization_id)
)
with check (
    public.can_manage_organization(organization_id)
);


-- ============================================================
-- 13. PRODUCT COMPONENTS
-- ============================================================

create policy "members can view product components"
on public.product_components
for select
to authenticated
using (
    exists (
        select 1
        from public.products p
        where p.id = product_components.combo_product_id
          and public.is_organization_member(p.organization_id)
    )
);


create policy "accountants can manage product components"
on public.product_components
for all
to authenticated
using (
    exists (
        select 1
        from public.products p
        where p.id = product_components.combo_product_id
          and public.can_manage_organization(p.organization_id)
    )
)
with check (
    exists (
        select 1
        from public.products p
        where p.id = product_components.combo_product_id
          and public.can_manage_organization(p.organization_id)
    )
);


-- ============================================================
-- 14. INVENTORY LOCATIONS
-- ============================================================

create policy "members can view inventory locations"
on public.inventory_locations
for select
to authenticated
using (
    public.is_organization_member(organization_id)
);


create policy "accountants can manage inventory locations"
on public.inventory_locations
for all
to authenticated
using (
    public.can_manage_organization(organization_id)
)
with check (
    public.can_manage_organization(organization_id)
);


-- ============================================================
-- 15. INVENTORY MOVEMENTS
-- ============================================================

create policy "members can view inventory movements"
on public.inventory_movements
for select
to authenticated
using (
    public.is_organization_member(organization_id)
);


create policy "accountants can create inventory movements"
on public.inventory_movements
for insert
to authenticated
with check (
    public.can_manage_organization(organization_id)
);


-- ============================================================
-- 16. CHART OF ACCOUNTS
-- ============================================================

create policy "members can view chart of accounts"
on public.chart_of_accounts
for select
to authenticated
using (
    public.is_organization_member(organization_id)
);


create policy "accountants can manage chart of accounts"
on public.chart_of_accounts
for all
to authenticated
using (
    public.can_manage_organization(organization_id)
)
with check (
    public.can_manage_organization(organization_id)
);


-- ============================================================
-- 17. JOURNALS
-- ============================================================

create policy "members can view journals"
on public.journals
for select
to authenticated
using (
    public.is_organization_member(organization_id)
);


create policy "accountants can manage journals"
on public.journals
for all
to authenticated
using (
    public.can_manage_organization(organization_id)
)
with check (
    public.can_manage_organization(organization_id)
);


-- ============================================================
-- 18. TAX RATES
-- ============================================================

create policy "members can view tax rates"
on public.tax_rates
for select
to authenticated
using (
    public.is_organization_member(organization_id)
);


create policy "accountants can manage tax rates"
on public.tax_rates
for all
to authenticated
using (
    public.can_manage_organization(organization_id)
)
with check (
    public.can_manage_organization(organization_id)
);


-- ============================================================
-- 19. ANALYTIC ACCOUNTS
-- ============================================================

create policy "members can view analytic accounts"
on public.analytic_accounts
for select
to authenticated
using (
    public.is_organization_member(organization_id)
);


create policy "accountants can manage analytic accounts"
on public.analytic_accounts
for all
to authenticated
using (
    public.can_manage_organization(organization_id)
)
with check (
    public.can_manage_organization(organization_id)
);


-- ============================================================
-- 20. COMMERCIAL DOCUMENTS
-- ============================================================

create policy "members can view commercial documents"
on public.commercial_documents
for select
to authenticated
using (
    public.is_organization_member(organization_id)
);


create policy "accountants can manage commercial documents"
on public.commercial_documents
for all
to authenticated
using (
    public.can_manage_organization(organization_id)
)
with check (
    public.can_manage_organization(organization_id)
);


-- ============================================================
-- 21. COMMERCIAL DOCUMENT LINES
-- ============================================================

create policy "members can view document lines"
on public.commercial_document_lines
for select
to authenticated
using (
    exists (
        select 1
        from public.commercial_documents d
        where d.id = commercial_document_lines.document_id
          and public.is_organization_member(d.organization_id)
    )
);


create policy "accountants can manage document lines"
on public.commercial_document_lines
for all
to authenticated
using (
    exists (
        select 1
        from public.commercial_documents d
        where d.id = commercial_document_lines.document_id
          and public.can_manage_organization(d.organization_id)
    )
)
with check (
    exists (
        select 1
        from public.commercial_documents d
        where d.id = commercial_document_lines.document_id
          and public.can_manage_organization(d.organization_id)
    )
);


-- ============================================================
-- 22. PAYMENTS
-- ============================================================

create policy "members can view payments"
on public.payments
for select
to authenticated
using (
    public.is_organization_member(organization_id)
);


create policy "accountants can manage payments"
on public.payments
for all
to authenticated
using (
    public.can_manage_organization(organization_id)
)
with check (
    public.can_manage_organization(organization_id)
);


-- ============================================================
-- 23. PAYMENT ALLOCATIONS
-- ============================================================

create policy "members can view payment allocations"
on public.payment_allocations
for select
to authenticated
using (
    exists (
        select 1
        from public.payments p
        where p.id = payment_allocations.payment_id
          and public.is_organization_member(p.organization_id)
    )
);


create policy "accountants can manage payment allocations"
on public.payment_allocations
for all
to authenticated
using (
    exists (
        select 1
        from public.payments p
        where p.id = payment_allocations.payment_id
          and public.can_manage_organization(p.organization_id)
    )
)
with check (
    exists (
        select 1
        from public.payments p
        where p.id = payment_allocations.payment_id
          and public.can_manage_organization(p.organization_id)
    )
);


-- ============================================================
-- 24. JOURNAL ENTRIES
-- ============================================================

create policy "members can view journal entries"
on public.journal_entries
for select
to authenticated
using (
    public.is_organization_member(organization_id)
);


create policy "accountants can manage journal entries"
on public.journal_entries
for all
to authenticated
using (
    public.can_manage_organization(organization_id)
)
with check (
    public.can_manage_organization(organization_id)
);


-- ============================================================
-- 25. JOURNAL ENTRY LINES
-- ============================================================

create policy "members can view journal entry lines"
on public.journal_entry_lines
for select
to authenticated
using (
    exists (
        select 1
        from public.journal_entries je
        where je.id = journal_entry_lines.journal_entry_id
          and public.is_organization_member(je.organization_id)
    )
);


create policy "accountants can manage journal entry lines"
on public.journal_entry_lines
for all
to authenticated
using (
    exists (
        select 1
        from public.journal_entries je
        where je.id = journal_entry_lines.journal_entry_id
          and public.can_manage_organization(je.organization_id)
    )
)
with check (
    exists (
        select 1
        from public.journal_entries je
        where je.id = journal_entry_lines.journal_entry_id
          and public.can_manage_organization(je.organization_id)
    )
);


-- ============================================================
-- 26. BUDGETS
-- ============================================================

create policy "members can view budgets"
on public.budgets
for select
to authenticated
using (
    public.is_organization_member(organization_id)
);


create policy "accountants can manage budgets"
on public.budgets
for all
to authenticated
using (
    public.can_manage_organization(organization_id)
)
with check (
    public.can_manage_organization(organization_id)
);


-- ============================================================
-- 27. BUDGET LINES
-- ============================================================

create policy "members can view budget lines"
on public.budget_lines
for select
to authenticated
using (
    exists (
        select 1
        from public.budgets b
        where b.id = budget_lines.budget_id
          and public.is_organization_member(b.organization_id)
    )
);


create policy "accountants can manage budget lines"
on public.budget_lines
for all
to authenticated
using (
    exists (
        select 1
        from public.budgets b
        where b.id = budget_lines.budget_id
          and public.can_manage_organization(b.organization_id)
    )
)
with check (
    exists (
        select 1
        from public.budgets b
        where b.id = budget_lines.budget_id
          and public.can_manage_organization(b.organization_id)
    )
);


-- ============================================================
-- 28. AUDIT LOG
-- ============================================================

create policy "admins can view audit log"
on public.audit_log
for select
to authenticated
using (
    organization_id is not null
    and public.is_organization_admin(organization_id)
);