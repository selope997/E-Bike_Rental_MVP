-- Prevent privilege escalation via profiles.role
--
-- The "Users can update own profile" RLS policy scopes updates by row (id = auth.uid())
-- but not by column, so any authenticated user could set their own role to 'admin'.
-- This trigger blocks any role change unless the caller is already an admin (is_admin())
-- or the service role (Edge Functions), which bypasses this via SECURITY DEFINER context.

create or replace function prevent_role_change()
returns trigger language plpgsql security definer as $$
begin
  if new.role is distinct from old.role and not is_admin() then
    raise exception 'Only admins can change a profile role';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_role_change on profiles;
create trigger enforce_role_change
  before update on profiles
  for each row execute function prevent_role_change();
