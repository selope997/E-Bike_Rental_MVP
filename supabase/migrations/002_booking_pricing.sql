-- Add per-booking pricing columns to bookings table
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS duration_weeks            INT           NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS amount_paid               NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id  TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_bookings_stripe_payment_intent
  ON bookings (stripe_payment_intent_id);
