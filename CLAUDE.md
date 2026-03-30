# CLAUDE.md — E-Bike Rental MVP

Project memory for Claude Code. Read this at the start of every session.

---

## Project Purpose

Subscription-based e-bike rental platform targeting **delivery drivers** (DoorDash, UberEats, etc.).
Users sign up → subscribe via Stripe → browse and book bikes by station.

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
│   ├── useAuth.js                 # Re-export from AuthContext
│   ├── useBikes.js                # Fetches bikes + stations, supports filtering
│   └── useSubscription.js         # Fetches plans + active user subscription
├── lib/
│   ├── supabase.js                # Supabase client (singleton)
│   └── stripe.js                  # Stripe promise + redirectToCheckout()
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
    ├── BikeDetail.jsx             # Single bike + Book Now button
    ├── Subscribe.jsx              # Choose a subscription plan
    ├── Dashboard.jsx              # Active rental + subscription status
    ├── Profile.jsx                # Edit profile + Stripe billing portal link
    └── admin/
        ├── AdminDashboard.jsx     # KPIs: revenue, rentals, bikes, users
        ├── AdminBikes.jsx         # CRUD bikes (table + modal form)
        ├── AdminUsers.jsx         # View all users + their subscription status
        └── AdminBookings.jsx      # View all bookings, mark returned

supabase/
├── migrations/
│   └── 001_schema.sql             # Full schema + RLS policies + seed data
└── functions/
    ├── create-checkout-session/   # POST → creates Stripe Checkout Session
    ├── create-portal-session/     # POST → creates Stripe Billing Portal session
    └── stripe-webhook/            # Handles Stripe webhook events
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

**subscription_plans**
- `id`, `name`, `price`, `duration_days`, `stripe_price_id`
- Seed: Weekly ($49/7d), Monthly ($149/30d)

**subscriptions**
- `user_id` FK → profiles, `plan_id` FK → subscription_plans
- `stripe_subscription_id` (unique), `stripe_customer_id`
- `status`: `'active'` | `'canceled'` | `'past_due'` | `'unpaid'`
- `period_start`, `period_end`

**bookings**
- `user_id`, `bike_id`, `subscription_id`
- `start_time`, `expected_return`, `actual_return`
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
| `/subscribe` | Subscribe | ProtectedRoute |
| `/dashboard` | Dashboard | ProtectedRoute |
| `/profile` | Profile | ProtectedRoute |
| `/admin` | AdminDashboard | AdminRoute |
| `/admin/bikes` | AdminBikes | AdminRoute |
| `/admin/users` | AdminUsers | AdminRoute |
| `/admin/bookings` | AdminBookings | AdminRoute |
| `*` | Navigate to `/` | — |

---

## Key Data Flows

### Subscription Purchase
1. User picks plan on `/subscribe`
2. Frontend calls Edge Fn `create-checkout-session` → redirects to Stripe hosted page
3. Stripe fires `checkout.session.completed` webhook → Edge Fn `stripe-webhook` → INSERT into `subscriptions`
4. Other webhook events update `subscriptions.status` and period dates

### Bike Booking
1. User with `isActive` subscription visits `/bikes/:id`
2. "Book Now" → INSERT bookings (status=active) + UPDATE bikes (status=rented)
3. Dashboard shows active rental

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
- **statusBadge()**: use this helper from `Badge.jsx` for any status display (bookings, subscriptions, bikes)

---

## Deployment Notes

- Vercel handles SPA routing via `vercel.json` (all paths → `/index.html`)
- Stripe webhook URL: `https://<supabase-project>.supabase.co/functions/v1/stripe-webhook`
- Stripe `stripe_price_id` values must be populated in `subscription_plans` table for checkout to work
- Run `supabase db push` to apply migrations to remote project
- Deploy Edge Functions with `supabase functions deploy <name>`
