-- Per-bike rental pricing
--
-- Replaces the hardcoded global $95/$70 two-tier rate with two admin-editable
-- prices stored on each bike. NOT NULL defaults backfill existing rows to the
-- current values (standard $95/week, discounted $70/week at 4+ weeks).

alter table bikes
  add column if not exists price_per_week      numeric(10,2) not null default 95,
  add column if not exists price_per_week_bulk numeric(10,2) not null default 70;

-- Protect prices from non-admins.
-- The "Auth users can update bike status" policy lets any authenticated user
-- update bikes (intended for status flips during booking/return). This trigger
-- ensures only admins (or the service role, where is_admin() is evaluated in the
-- caller's context) can change the price columns. Booking/return flows only touch
-- `status`, so they pass through unaffected.
create or replace function prevent_bike_price_change()
returns trigger language plpgsql security definer as $$
begin
  if (new.price_per_week is distinct from old.price_per_week
      or new.price_per_week_bulk is distinct from old.price_per_week_bulk)
     and not is_admin() then
    raise exception 'Only admins can change bike prices';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_bike_price_change on bikes;
create trigger enforce_bike_price_change
  before update on bikes
  for each row execute function prevent_bike_price_change();
