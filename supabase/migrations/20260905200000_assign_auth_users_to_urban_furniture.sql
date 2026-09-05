-- Give new authenticated users access to the seeded organization so RLS can expose their data.
create or replace function public.create_app_user_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_login_id text;
  target_organization_id uuid;
begin
  requested_login_id := nullif(new.raw_user_meta_data ->> 'login_id', '');
  if requested_login_id is null or requested_login_id !~ '^[A-Za-z0-9_]{6,12}$' then
    requested_login_id := 'u' || substring(replace(new.id::text, '-', '') from 1 for 10);
  end if;

  insert into public.app_users (id, email, login_id, display_name)
  values (new.id, new.email, requested_login_id, coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), requested_login_id))
  on conflict (id) do nothing;

  select id into target_organization_id
  from public.organizations
  where name = 'Urban Furniture';

  if target_organization_id is not null then
    insert into public.organization_memberships (organization_id, user_id, role)
    values (
      target_organization_id,
      new.id,
      case when lower(new.raw_user_meta_data ->> 'role') = 'user' then 'contact_portal'::public.user_role else 'admin'::public.user_role end
    )
    on conflict (organization_id, user_id) do nothing;
  end if;

  return new;
end;
$$;

-- Grant the seeded organization to accounts that existed before this migration.
insert into public.organization_memberships (organization_id, user_id, role)
select o.id, au.id, case when lower(au.raw_user_meta_data ->> 'role') = 'user' then 'contact_portal'::public.user_role else 'admin'::public.user_role end
from auth.users au
cross join public.organizations o
where o.name = 'Urban Furniture'
on conflict (organization_id, user_id) do nothing;