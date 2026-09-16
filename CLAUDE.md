# CLAUDE.md — E-Bike Rental MVP

Project memory for Claude Code. Read this at the start of every session.

---

## Project Purpose

Per-booking e-bike rental platform targeting **delivery drivers** (DoorDash, UberEats, etc.).
Users sign up → browse bikes by station → book a bike for 1–12 weeks and pay once via Stripe.
There is no subscription model — all revenue comes from one-time booking payments.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5, React Router v6, Tailwind CSS 3 |
| Backend | Supabase (Postgres, Auth, Edge Functions) |
| Payments | Stripe (Checkout, Billing Portal, Webhooks) |
| Edge Runtime | Deno (Supabase Edge Functions) |
| Deployment | Vercel (SPA rewrite — all routes → /index.html) |

---

## Folder Structure

```
src/
├── App.jsx                        # All routes defined here
├── main.jsx                       # React entry point
├── index.css                      # Tailwind base + custom styles
├── context/
│   └── AuthContext.jsx            # Global auth state: session, user, profile
├── hooks/
│   └── useBikes.js                # Fetches bikes + stations, supports filtering
├── lib/
│   ├── supabase.js                # Supabase client (singleton)
│   └── stripe.js                  # Stripe promise + redirectToBookingCheckout()
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.jsx     # Redirects to /login if not authenticated
│   │   └── AdminRoute.jsx         # Redirects to / if role !== 'admin'
│   ├── layout/
│   │   ├── Navbar.jsx             # Top nav, shows Admin link if role=admin
│   │   ├── Footer.jsx
│   │   └── AdminLayout.jsx        # Sidebar layout for all /admin/* pages
│   └── ui/
│       ├── Button.jsx             # Variants: primary, secondary, danger, ghost
│       ├── Badge.jsx              # statusBadge() helper for consistent status colors
│       ├── Card.jsx               # Card wrapper with header/body slots
│       └── Modal.jsx              # Generic modal dialog
└── pages/
    ├── Home.jsx                   # Hero, how-it-works, pricing teaser
    ├── Login.jsx                  # Email/password signin
    ├── Register.jsx               # Signup + profile fields (phone, delivery platform)
    ├── Bikes.jsx                  # Browse bikes, filter by station
    ├── BikeDetail.jsx             # Single bike, duration + pickup date, Book Now
    ├── Dashboard.jsx              # Current rental
    ├── Profile.jsx                # Edit profile
    └── admin/
        ├── AdminDashboard.jsx     # KPIs: revenue, rentals, bikes, users
        ├── AdminBikes.jsx         # CRUD bikes (table + modal form)
        ├── AdminUsers.jsx         # View all users (name, platform, role)
        └── AdminBookings.jsx      # View all bookings, mark returned

supabase/
├── migrations/
│   ├── 001_schema.sql             # Base schema + RLS policies + seed data
│   ├── 002_booking_pricing.sql    # bookings: duration_weeks, amount_paid, payment intent
│   ├── 003_prevent_role_escalation.sql  # Trigger: only admins can change profiles.role
│   ├── 004_bike_pricing.sql       # bikes: price_per_week + price_per_week_bulk (+ guard)
│   └── 005_remove_subscriptions.sql     # Drops subscriptions + subscription_plans
└── functions/
    ├── create-booking-session/    # POST → Stripe Checkout (mode: payment) for a booking
    └── stripe-webhook/            # Handles checkout.session.completed → creates booking
```

---

## Database Schema

### Tables

**profiles** — extends `auth.users` (auto-created via trigger on signup)
- `id` uuid PK FK → auth.users
- `full_name`, `phone`, `delivery_platform` (doordash | ubereats | other)
- `role` text: `'customer'` (default) | `'admin'`

**stations**
- `id`, `name`, `address`

**bikes**
- `id`, `name`, `type`, `image_url`
- `status`: `'available'` | `'rented'` | `'maintenance'`
- `station_id` FK → stations
- `price_per_week`, `price_per_week_bulk` — admin-editable; bulk rate applies at 4+ weeks
  (a DB trigger blocks non-admins from changing either)

**bookings**
- `user_id`, `bike_id`
- `start_time` (the chosen pickup day), `expected_return`, `actual_return`
- `duration_weeks`, `amount_paid`, `stripe_payment_intent_id` (unique)
- `status`: `'active'` | `'completed'` | `'cancelled'`

### RLS Security Model
- `is_admin()` DB function: checks `profiles.role = 'admin'`
- Every table has RLS enabled
- Users can only read/write their own rows
- Admins can read/write all rows
- `bikes`: public read, auth users can update status (for booking/return)
- Edge Functions use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS when writing webhook data

---

## Routes

| Path | Component | Guard |
|---|---|---|
| `/` | Home | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/bikes` | Bikes | Public |
| `/bikes/:id` | BikeDetail | Public |
| `/dashboard` | Dashboard | ProtectedRoute |
| `/profile` | Profile | ProtectedRoute |
| `/admin` | AdminDashboard | AdminRoute |
| `/admin/bikes` | AdminBikes | AdminRoute |
| `/admin/users` | AdminUsers | AdminRoute |
| `/admin/bookings` | AdminBookings | AdminRoute |
| `*` | Navigate to `/` | — |

---

## Key Data Flows

### Bike Booking (the only payment flow)
1. Signed-in user visits `/bikes/:id`, picks a duration (1–12 weeks) and a pickup date
   (today up to 60 days out)
2. "Book Now" → Edge Fn `create-booking-session` recomputes the price **server-side** from the
   bike's own rates and validates the pickup date, then creates a Stripe Checkout Session
   (`mode: 'payment'`) carrying `userId`, `bikeId`, `durationWeeks`, `pickupDate` in metadata
3. Stripe fires `checkout.session.completed` → `stripe-webhook` → INSERT bookings
   (`amount_paid` from `session.amount_total`, `start_time` from the pickup date) +
   UPDATE bikes (status=rented)
4. Dashboard shows the current rental

**Pricing is always server-authoritative** — the client never sends an amount.

### Bike Return
1. User on `/dashboard` clicks "Return Bike"
2. UPDATE bookings (status=completed, actual_return=now()) + UPDATE bikes (status=available)

---

## Environment Variables

```
# Client (Vite — prefix VITE_)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=

# Server (Supabase Edge Functions — set via Supabase dashboard)
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## Coding Conventions

- **Components**: functional, no class components
- **Styling**: Tailwind utility classes only; custom `primary` color palette (green) defined in `tailwind.config.js`
- **Async**: async/await with try/catch; user-facing errors shown in red alert divs
- **Loading states**: boolean `loading` flag → spinner shown in UI
- **Supabase queries**: done directly in hooks/pages via the singleton client from `src/lib/supabase.js`
- **Admin writes**: always check RLS + `is_admin()` — never bypass from client
- **UI components**: prefer `Button`, `Badge`, `Card`, `Modal` from `src/components/ui/` before creating new ones
- **statusBadge()**: use this helper from `Badge.jsx` for any status display (bookings, bikes)

---

## Deployment Notes

- Vercel handles SPA routing via `vercel.json` (all paths → `/index.html`)
- Stripe webhook URL: `https://<supabase-project>.supabase.co/functions/v1/stripe-webhook`
- Booking prices come from each bike's `price_per_week` / `price_per_week_bulk` columns (no Stripe
  Price objects needed — the Edge Function builds `price_data` on the fly)
- CI: pushing changes under `supabase/**` triggers `.github/workflows/deploy-supabase.yml`, which
  deploys the Edge Functions and runs `supabase db push`
- Run `supabase db push` to apply migrations to remote project
- Deploy Edge Functions with `supabase functions deploy <name>`
