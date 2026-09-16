-- Remove the subscription system — the app is bookings-only.
--
-- All revenue now comes from per-bike one-time booking payments (see
-- create-booking-session + the bookings table). The subscription tables,
-- their RLS policies, and the unused bookings.subscription_id FK are dropped.
--
-- Order matters: the FK on bookings must go before the table it references.
-- RLS policies are dropped automatically along with their tables.

alter table bookings drop column if exists subscription_id;

drop table if exists subscriptions;
drop table if exists subscription_plans;
