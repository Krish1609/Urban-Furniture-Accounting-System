-- ============================================================
-- URBAN FURNITURE
-- MASTER DATA SEED
-- ============================================================

do $$
declare
    v_org_id uuid;

    -- Chart of Accounts
    v_cash_account uuid;
    v_bank_account uuid;
    v_ar_account uuid;
    v_inventory_account uuid;
    v_ap_account uuid;
    v_sales_account uuid;
    v_purchase_account uuid;
    v_tax_payable_account uuid;
    v_tax_receivable_account uuid;
    v_expense_account uuid;
    v_equity_account uuid;

    -- Other master data
    v_electronics_category uuid;
    v_furniture_category uuid;
    v_services_category uuid;

begin

    -- ========================================================
    -- 1. GET ORGANIZATION
    -- ========================================================

    select id
    into v_org_id
    from public.organizations
    where name = 'Urban Furniture';

    if v_org_id is null then
        raise exception 'Organization "Urban Furniture" does not exist.';
    end if;


    -- ========================================================
    -- 2. CHART OF ACCOUNTS
    -- ========================================================

    insert into public.chart_of_accounts
    (
        organization_id,
        account_code,
        name,
        account_type,
        is_active,
        allow_manual_posting
    )
    values
        (v_org_id, '1000', 'Cash', 'asset', true, true),
        (v_org_id, '1010', 'Bank', 'asset', true, true),
        (v_org_id, '1100', 'Accounts Receivable', 'asset', true, true),
        (v_org_id, '1200', 'Inventory', 'asset', true, true),

        (v_org_id, '2000', 'Accounts Payable', 'liability', true, true),
        (v_org_id, '2100', 'GST Payable', 'liability', true, true),

        (v_org_id, '2200', 'GST Receivable', 'asset', true, true),

        (v_org_id, '3000', 'Owner Equity', 'equity', true, true),

        (v_org_id, '4000', 'Sales Revenue', 'income', true, true),

        (v_org_id, '5000', 'Purchases', 'expense', true, true),
        (v_org_id, '5100', 'Operating Expenses', 'expense', true, true)

    on conflict (organization_id, account_code)
    do update set
        name = excluded.name,
        account_type = excluded.account_type,
        is_active = excluded.is_active,
        allow_manual_posting = excluded.allow_manual_posting;


    -- ========================================================
    -- 3. GET ACCOUNT IDs
    -- ========================================================

    select id into v_cash_account
    from public.chart_of_accounts
    where organization_id = v_org_id
      and account_code = '1000';

    select id into v_bank_account
    from public.chart_of_accounts
    where organization_id = v_org_id
      and account_code = '1010';

    select id into v_ar_account
    from public.chart_of_accounts
    where organization_id = v_org_id
      and account_code = '1100';

    select id into v_inventory_account
    from public.chart_of_accounts
    where organization_id = v_org_id
      and account_code = '1200';

    select id into v_ap_account
    from public.chart_of_accounts
    where organization_id = v_org_id
      and account_code = '2000';

    select id into v_sales_account
    from public.chart_of_accounts
    where organization_id = v_org_id
      and account_code = '4000';

    select id into v_purchase_account
    from public.chart_of_accounts
    where organization_id = v_org_id
      and account_code = '5000';

    select id into v_tax_payable_account
    from public.chart_of_accounts
    where organization_id = v_org_id
      and account_code = '2100';

    select id into v_tax_receivable_account
    from public.chart_of_accounts
    where organization_id = v_org_id
      and account_code = '2200';

    select id into v_expense_account
    from public.chart_of_accounts
    where organization_id = v_org_id
      and account_code = '5100';

    select id into v_equity_account
    from public.chart_of_accounts
    where organization_id = v_org_id
      and account_code = '3000';


    -- ========================================================
    -- 4. JOURNALS
    -- ========================================================

    insert into public.journals
    (
        organization_id,
        name,
        journal_type,
        default_account_id,
        is_active
    )
    values
        (
            v_org_id,
            'Sales Journal',
            'sales',
            v_ar_account,
            true
        ),
        (
            v_org_id,
            'Purchase Journal',
            'purchase',
            v_ap_account,
            true
        ),
        (
            v_org_id,
            'Cash Journal',
            'cash',
            v_cash_account,
            true
        ),
        (
            v_org_id,
            'Bank Journal',
            'bank',
            v_bank_account,
            true
        ),
        (
            v_org_id,
            'General Journal',
            'general',
            v_expense_account,
            true
        )
    on conflict (organization_id, name)
    do update set
        journal_type = excluded.journal_type,
        default_account_id = excluded.default_account_id,
        is_active = excluded.is_active;


    -- ========================================================
    -- 5. PRODUCT CATEGORIES
    -- ========================================================

    insert into public.product_categories
    (
        organization_id,
        name,
        is_active
    )
    values
        (v_org_id, 'Electronics', true),
        (v_org_id, 'Furniture', true),
        (v_org_id, 'Services', true)
    on conflict (organization_id, name)
    do update set
        is_active = excluded.is_active;


    -- ========================================================
    -- 6. GET CATEGORY IDs
    -- ========================================================

    select id into v_electronics_category
    from public.product_categories
    where organization_id = v_org_id
      and name = 'Electronics';

    select id into v_furniture_category
    from public.product_categories
    where organization_id = v_org_id
      and name = 'Furniture';

    select id into v_services_category
    from public.product_categories
    where organization_id = v_org_id
      and name = 'Services';


    -- ========================================================
    -- 7. PRODUCTS
    -- ========================================================

    insert into public.products
    (
        organization_id,
        category_id,
        name,
        product_type,
        sku,
        sales_price,
        cost_price,
        is_active
    )
    values
        (
            v_org_id,
            v_electronics_category,
            'Air Conditioner',
            'goods',
            'AC-001',
            25000.00,
            15000.00,
            true
        ),
        (
            v_org_id,
            v_electronics_category,
            'Refrigerator',
            'goods',
            'REF-001',
            10000.00,
            7000.00,
            true
        ),
        (
            v_org_id,
            v_furniture_category,
            'Office Chair',
            'goods',
            'CHR-001',
            5000.00,
            3000.00,
            true
        ),
        (
            v_org_id,
            v_furniture_category,
            'Office Table',
            'goods',
            'TBL-001',
            12000.00,
            7500.00,
            true
        ),
        (
            v_org_id,
            v_services_category,
            'Installation Service',
            'service',
            'SRV-001',
            1500.00,
            500.00,
            true
        )
    on conflict (organization_id, sku)
where sku is not null and deleted_at is null
do update set
    category_id = excluded.category_id,
    name = excluded.name,
    product_type = excluded.product_type,
    sales_price = excluded.sales_price,
    cost_price = excluded.cost_price,
    is_active = excluded.is_active;


    -- ========================================================
    -- 8. INVENTORY LOCATION
    -- ========================================================

    insert into public.inventory_locations
    (
        organization_id,
        name,
        is_active
    )
    values
        (v_org_id, 'Main Warehouse', true)
    on conflict (organization_id, name)
    do update set
        is_active = excluded.is_active;


    -- ========================================================
    -- 9. TAX RATE
    -- ========================================================

    insert into public.tax_rates
    (
        organization_id,
        name,
        rate_percent,
        sales_tax_account_id,
        purchase_tax_account_id,
        effective_from,
        is_active
    )
    values
        (
            v_org_id,
            'GST 18%',
            18.0000,
            v_tax_payable_account,
            v_tax_receivable_account,
            current_date,
            true
        )
    on conflict (organization_id, name, effective_from)
    do update set
        rate_percent = excluded.rate_percent,
        sales_tax_account_id = excluded.sales_tax_account_id,
        purchase_tax_account_id = excluded.purchase_tax_account_id,
        is_active = excluded.is_active;


    -- ========================================================
    -- 10. ANALYTIC ACCOUNTS
    -- ========================================================

    insert into public.analytic_accounts
    (
        organization_id,
        name,
        analytic_type,
        is_active
    )
    values
        (v_org_id, 'Sales Department', 'income', true),
        (v_org_id, 'Purchase Department', 'expense', true),
        (v_org_id, 'Operations', 'mixed', true),
        (v_org_id, 'Administration', 'expense', true)
    on conflict (organization_id, name)
    do update set
        analytic_type = excluded.analytic_type,
        is_active = excluded.is_active;


    -- ========================================================
    -- DONE
    -- ========================================================

    raise notice 'Urban Furniture master data seeded successfully. Organization ID: %',
        v_org_id;

end $$;