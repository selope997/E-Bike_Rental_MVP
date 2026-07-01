# Plan: Per-Booking Duration-Based Pricing

## Context
The platform currently requires users to buy a recurring Stripe subscription ($49/week or $149/month) before they can book a bike, with a hardcoded 1-day rental duration. The new model replaces this with per-booking charges based on rental duration:
- < 4 weeks → $95/week
- ≥ 4 weeks → $70/week

Users must also be able to see the total cost before confirming, on the BikeDetail page.

---

## Step 1 — Database Migration
**New file:** `supabase/migrations/002_booking_pricing.sql`

Add 3 columns to `bookings`. `subscription_id` is already nullable, no change needed.

```sql
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS duration_weeks            INT           NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS amount_paid               NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id  TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_bookings_stripe_payment_intent
  ON bookings (stripe_payment_intent_id);
```

Run: `supabase db push`

---

## Step 2 — New Edge Function: `create-booking-session`
**New file:** `supabase/functions/create-booking-session/index.ts`

Mirrors the structure of `create-checkout-session`. Key points:
- Accepts: `{ bikeId, userId, durationWeeks, successUrl, cancelUrl }`
- **Server-side** price calculation: `weeks < 4 ? weeks * 9500 : weeks * 7000` (cents)
- Creates Stripe session with `mode: 'payment'` and inline `price_data` (no pre-created Stripe price needed)
- Passes `{ userId, bikeId, durationWeeks }` in `metadata` for webhook
- Returns `{ url }`

Deploy: `supabase functions deploy create-booking-session`

---

## Step 3 — `src/lib/stripe.js`
Add a new export below the existing `redirectToCheckout`. Keep the old function intact (Subscribe.jsx still uses it).

```js
export async function redirectToBookingCheckout({ bikeId, userId, durationWeeks, successUrl, cancelUrl }) {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-booking-session`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ bikeId, userId, durationWeeks, successUrl, cancelUrl }),
    }
  )
  const { url, error } = await response.json()
  if (error) throw new Error(error)
  window.location.href = url
}
```

---

## Step 4 — `src/pages/BikeDetail.jsx`
**Major changes** to the booking section (lines 1–62 and 121–141):

**Remove:**
- `useSubscription` import and `{ isActive, subscription }` usage (line 5, 15)
- Subscription guard `if (!isActive) return navigate('/subscribe')` (line 36)
- "You need an active subscription" message (lines 128–132)
- `disabled={!user || !isActive}` on the button (line 137)
- Direct Supabase INSERT into `bookings` and bike status UPDATE (lines 44–60)

**Add:**
- `useState` for `durationWeeks` (default: `1`)
- Computed `rate = durationWeeks < 4 ? 95 : 70` and `totalCost = rate * durationWeeks`
- Import `redirectToBookingCheckout` from `../lib/stripe`

**New `handleBook`:**
```js
async function handleBook() {
  if (!user) return navigate('/login')
  setBooking(true)
  setError('')
  try {
    await redirectToBookingCheckout({
      bikeId: bike.id,
      userId: user.id,
      durationWeeks,
      successUrl: `${window.location.origin}/dashboard?booked=true`,
      cancelUrl: window.location.href,
    })
  } catch (err) {
    setError(err.message)
    setBooking(false)
  }
}
```

**New JSX booking section** (replaces lines 121–144):
- +/- stepper to select weeks (1–12)
- Pricing summary box: `X weeks × $Y/week = $Z total`
- Tip message when < 4 weeks: "Book 4+ weeks to drop to $70/week — save $Z"
- Confirmation message when ≥ 4 weeks: "Bulk rate applied — $70/week"
- `Book Now — $Z` button (disabled only when `!user`)

---

## Step 5 — `supabase/functions/stripe-webhook/index.ts`
The existing `handleCheckoutCompleted` (line 67) already ignores `mode: 'payment'` sessions via `if (session.mode !== 'subscription') return`. Add a branch in the switch case to route booking payments to a new handler.

**Change in switch (line 30–33):**
```ts
case 'checkout.session.completed': {
  const session = event.data.object as Stripe.Checkout.Session
  if (session.metadata?.bikeId) {
    await handleBookingCheckoutCompleted(session)
  } else {
    await handleCheckoutCompleted(session)
  }
  break
}
```

**New function to append:**
```ts
async function handleBookingCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, bikeId, durationWeeks: dStr } = session.metadata!
  const durationWeeks = parseInt(dStr, 10)
  if (!userId || !bikeId || isNaN(durationWeeks)) return

  const ratePerWeek = durationWeeks < 4 ? 95 : 70
  const amountPaid = (ratePerWeek * durationWeeks).toFixed(2)
  const startTime = new Date()
  const expectedReturn = new Date(startTime)
  expectedReturn.setDate(expectedReturn.getDate() + durationWeeks * 7)

  await supabase.from('bookings').insert({
    user_id: userId,
    bike_id: bikeId,
    duration_weeks: durationWeeks,
    amount_paid: amountPaid,
    stripe_payment_intent_id: session.payment_intent as string,
    start_time: startTime.toISOString(),
    expected_return: expectedReturn.toISOString(),
    status: 'active',
  })

  await supabase.from('bikes').update({ status: 'rented' }).eq('id', bikeId)
}
```

The `UNIQUE` constraint on `stripe_payment_intent_id` (Step 1) prevents duplicate bookings from replayed Stripe events.

Deploy: `supabase functions deploy stripe-webhook`

---

## Step 6 — `src/pages/Dashboard.jsx`
Small updates:

1. **Success banner** (line 20): add `justBooked` for `?booked=true` param alongside existing `justSubscribed`
2. **Booking info block** (lines 121–123): add `duration_weeks` and `amount_paid` display
3. **"Find a Bike" button** (line 137): remove the `isActive &&` condition — any logged-in user can browse

---

## Deployment Sequence

1. `supabase db push` (migration must land before webhook can insert `duration_weeks`)
2. `supabase functions deploy create-booking-session`
3. `supabase functions deploy stripe-webhook`
4. Deploy frontend (Vercel) with updated `stripe.js`, `BikeDetail.jsx`, `Dashboard.jsx`

---

## Verification

1. Browse to `/bikes/:id` as a logged-in user — see duration stepper and live price update
2. Select 2 weeks → should show `2 × $95 = $190` + bulk-rate tip
3. Select 4 weeks → should show `4 × $70 = $280` + "Bulk rate applied"
4. Click "Book Now" → redirected to Stripe Checkout with correct line item amount
5. Complete test payment → webhook fires → booking row inserted with correct `duration_weeks`, `amount_paid`, and `expected_return`; bike status set to `rented`
6. `/dashboard` shows rental with duration, amount paid, and return date
7. "Return Bike" still works: marks booking `completed`, bike back to `available`
