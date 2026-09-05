create or replace function public.create_app_user_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_login_id text;
begin
  requested_login_id := nullif(
    new.raw_user_meta_data ->> 'login_id',
    ''
  );

  -- Dashboard-created users may not have login_id metadata.
  -- Generate a valid unique fallback ID in that case.
  if requested_login_id is null
     or requested_login_id !~ '^[A-Za-z0-9_]{6,12}$' then
    requested_login_id :=
      'u' || substring(replace(new.id::text, '-', '') from 1 for 10);
  end if;

  if new.email is null then
    raise exception 'Email is required for this application';
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