-- ============================================================
-- E-Bike Rental App — Database Schema + RLS Policies
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  delivery_platform text check (delivery_platform in ('doordash','ubereats','other')),
  role        text not null default 'customer' check (role in ('customer','admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, role)
  values (new.id, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- STATIONS
-- ─────────────────────────────────────────────────────────────
create table if not exists stations (
  id      uuid primary key default gen_random_uuid(),
  name    text not null,
  address text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- BIKES
-- ─────────────────────────────────────────────────────────────
create table if not exists bikes (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  type       text,
  status     text not null default 'available' check (status in ('available','rented','maintenance')),
  station_id uuid references stations(id) on delete set null,
  image_url  text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- SUBSCRIPTION PLANS
-- ─────────────────────────────────────────────────────────────
create table if not exists subscription_plans (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  duration_days  int not null,
  price          numeric(10,2) not null,
  stripe_price_id text,
  created_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- SUBSCRIPTIONS
-- ─────────────────────────────────────────────────────────────
create table if not exists subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references profiles(id) on delete cascade,
  plan_id               uuid references subscription_plans(id),
  stripe_subscription_id text unique,
  stripe_customer_id    text,
  status                text not null default 'active' check (status in ('active','canceled','past_due','unpaid')),
  period_start          timestamptz,
  period_end            timestamptz,
  created_at            timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- BOOKINGS
-- ─────────────────────────────────────────────────────────────
create table if not exists bookings (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles(id) on delete cascade,
  bike_id          uuid not null references bikes(id) on delete restrict,
  subscription_id  uuid references subscriptions(id),
  start_time       timestamptz not null default now(),
  expected_return  timestamptz,
  actual_return    timestamptz,
  status           text not null default 'active' check (status in ('active','completed','cancelled')),
  created_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────

-- Helper: check if the current user is admin
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- PROFILES
alter table profiles enable row level security;
create policy "Users can view own profile"     on profiles for select using (id = auth.uid());
create policy "Users can update own profile"   on profiles for update using (id = auth.uid());
create policy "Admin can view all profiles"    on profiles for select using (is_admin());
create policy "Admin can update all profiles"  on profiles for update using (is_admin());

-- STATIONS (public read, admin write)
alter table stations enable row level security;
create policy "Anyone can view stations" on stations for select using (true);
create policy "Admin can manage stations" on stations for all using (is_admin());

-- BIKES (public read, admin write)
alter table bikes enable row level security;
create policy "Anyone can view bikes"   on bikes for select using (true);
create policy "Admin can manage bikes"  on bikes for all using (is_admin());
create policy "Auth users can update bike status" on bikes for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- SUBSCRIPTION PLANS (public read, admin write)
alter table subscription_plans enable row level security;
create policy "Anyone can view plans"   on subscription_plans for select using (true);
create policy "Admin can manage plans"  on subscription_plans for all using (is_admin());

-- SUBSCRIPTIONS
alter table subscriptions enable row level security;
create policy "Users can view own subscriptions"   on subscriptions for select using (user_id = auth.uid());
create policy "Admin can view all subscriptions"   on subscriptions for select using (is_admin());
create policy "Admin can manage all subscriptions" on subscriptions for all using (is_admin());
-- Service role (Edge Functions) can insert/update via service key — bypass RLS

-- BOOKINGS
alter table bookings enable row level security;
create policy "Users can view own bookings"    on bookings for select using (user_id = auth.uid());
create policy "Users can insert own bookings"  on bookings for insert with check (user_id = auth.uid());
create policy "Users can update own bookings"  on bookings for update using (user_id = auth.uid());
create policy "Admin can manage all bookings"  on bookings for all using (is_admin());

-- ─────────────────────────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────────────────────────

-- Sample stations
insert into stations (name, address) values
  ('Downtown Hub', '123 Main St, Downtown'),
  ('Westside Station', '456 West Ave, Westside'),
  ('Airport Terminal', '789 Airport Rd')
on conflict do nothing;

-- Sample subscription plans (add your Stripe price IDs later)
insert into subscription_plans (name, duration_days, price, stripe_price_id) values
  ('Weekly',  7,  49.00, null),
  ('Monthly', 30, 149.00, null)
on conflict do nothing;
