# Handoff: Voltage Redesign — E-Bike Rental MVP

## Overview
A full visual redesign of the E-Bike Rental platform in a direction called **"Voltage"**:
a dark, high-energy, electric-lime aesthetic aimed at delivery drivers. This package
covers the **Home / landing page** and the **core rider flow** (Browse Bikes, Bike
Detail, Dashboard, Subscribe, Login, Register). Admin screens are **out of scope** and
should keep their current styling unless a follow-up asks otherwise.

## About the Design Files
The files in this bundle (`Home Redesign.dc.html`, `Rider Flow — Voltage.dc.html`) are
**design references created in HTML** — prototypes that show the intended look, layout,
and navigation. They are **not** production code to copy directly. They use an inline-style
prototyping runtime, not React/Tailwind.

Your task is to **recreate these designs inside the existing codebase** — React 18 + Vite +
React Router v6 + Tailwind CSS 3 — using its established patterns (the `Button`, `Badge`,
`Card`, `Modal` UI primitives and the `pages/` + `components/layout/` structure described in
`CLAUDE.md`). Do not introduce a new styling system; extend Tailwind config and reuse the
existing component library.

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, and interactions are final. Recreate
the UI faithfully using Tailwind utilities and the existing components. Exact hex values,
fonts, and radii are listed under **Design Tokens** below.

---

## Global Changes (do these first)

### 1. Tailwind config — replace the green `primary` palette intent with a dark shell + lime accent
The current `tailwind.config.js` defines a green `primary` scale. Keep it if other areas
depend on it, but add the Voltage tokens:

```js
// tailwind.config.js → theme.extend
colors: {
  // ...existing primary (green) scale can remain...
  volt: {
    bg:      '#0d0f0e',  // page background (near-black)
    surface: '#141815',  // cards / raised panels
    border:  '#232825',  // hairline borders on surface
    line:    '#1e2220',  // nav / divider borders on bg
    stroke:  '#2a302c',  // input borders
    outline: '#33393c',  // secondary button outline
    text:    '#f4f6f4',  // primary text
    muted:   '#a9b0ab',  // secondary text / labels
    dim:     '#8b928c',  // tertiary text
    faint:   '#7c837d',  // captions / max-note
  },
  accent: {
    DEFAULT: '#d4ff3f',  // electric lime — CTAs, links, highlights
    600:     '#a8e600',  // gradient end / darker lime
  },
},
fontFamily: {
  display: ['"Space Grotesk"', 'sans-serif'],  // headings, prices, logo, numbers
  sans:    ['"Hanken Grotesk"', 'sans-serif'], // body (make this the default)
},
```

### 2. Fonts
Add to `index.html` `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```
- **Space Grotesk** → all headings, prices, the logo wordmark, stat numbers, step numbers (`font-display`)
- **Hanken Grotesk** → body text (make it the Tailwind default `font-sans`)

### 3. Base body — `src/index.css`
```css
@layer base {
  body { @apply bg-volt-bg text-volt-text font-sans; }
}
```

### 4. Button component — `src/components/ui/Button.jsx`
Update variants to Voltage:
```js
const variants = {
  primary:   'bg-accent text-volt-bg hover:bg-accent-600 font-display font-bold',
  secondary: 'border border-volt-outline text-volt-text hover:bg-volt-surface',
  danger:    'bg-[#e5484d] text-white hover:bg-[#d13b40]',
  ghost:     'text-volt-muted hover:bg-volt-surface',
}
```
Keep the existing size scale and loading spinner (spinner uses `currentColor`, so it works).

### 5. Badge component — `src/components/ui/Badge.jsx`
Restyle the status pills for a dark surface (translucent fill + bright text):
```js
const variants = {
  green:  'bg-accent/15 text-accent',        // available / active
  blue:   'bg-[#7fb0ff]/15 text-[#7fb0ff]',  // rented
  yellow: 'bg-[#ffcf66]/15 text-[#ffcf66]',  // maintenance
  red:    'bg-[#e5484d]/15 text-[#ff8079]',  // canceled / past_due
  gray:   'bg-white/10 text-volt-muted',     // completed
}
```
`statusBadge()` mapping stays the same.

### 6. Card component — `src/components/ui/Card.jsx`
```js
// Card:       bg-volt-surface rounded-2xl border border-volt-border
// CardHeader: px-6 py-4 border-b border-volt-border  (title uses font-display font-semibold)
// CardBody:   px-6 py-4
```

### 7. Navbar — `src/components/layout/Navbar.jsx`
- Shell: `bg-volt-bg/85 backdrop-blur border-b border-volt-line sticky top-0 z-40`
- Logo: `font-display font-bold text-xl` — lime rounded square icon (`w-8 h-8 rounded-lg bg-accent text-volt-bg grid place-items-center`) + `⚡` + `VOLTBIKE`
- Links: `text-volt-muted hover:text-accent text-sm font-medium`; active link `text-accent`
- "Get started": primary Button style (`bg-accent text-volt-bg`)
- "Sign out": `bg-volt-surface border border-volt-stroke text-volt-text px-4 py-2 rounded-lg`

### 8. Footer — `src/components/layout/Footer.jsx`
`bg-volt-bg border-t border-volt-line text-volt-faint` — logo wordmark left, copyright right, `text-sm`.

---

## Screens / Views

> Reference files: `Home Redesign.dc.html` (option **1A** is the chosen direction — ignore 1B/1C),
> and `Rider Flow — Voltage.dc.html` (screens **2A–2F**).

### Home / Landing — `src/pages/Home.jsx`  (ref: 1A)
- **Purpose**: convert visitors → Get started / Browse bikes; check availability by date.
- **Layout**: single-column stacked sections on `bg-volt-bg`: Nav → Hero → Availability → How it works → Pricing → Footer. Content max-width ~1200px, `px-10`.
- **Hero**: 2-col grid (`grid-cols-[1.05fr_.95fr] gap-12 items-center`, stack to 1 col on mobile).
  - Eyebrow pill: `bg-volt-surface border border-volt-stroke text-[#c7ffbe] text-xs font-semibold rounded-full px-3.5 py-1.5`, with a 7px lime dot. Copy: "200+ bikes live across 6 stations".
  - H1: `font-display font-bold text-[66px] leading-[.98] tracking-[-.03em]` — "Power up every **delivery** shift." (`delivery` = `text-accent`).
  - Sub: `text-[19px] leading-relaxed text-volt-muted max-w-[460px]`.
  - CTAs: primary "Get started →" (lime) + secondary "Browse bikes" (outline `border-volt-outline`), `px-7 py-[15px] rounded-xl`.
  - Stat row (3 items, `gap-9`): value `font-display font-bold text-[30px]`, label `text-[13px] text-volt-faint`. Values: `$95/wk` · Starting rate; `60mi` · Range per charge; `24/7` · Roadside swap.
  - Right: image (h-440 rounded-[20px] border border-volt-border) → real bike photo.
- **Availability**: `bg-volt-surface border border-volt-border rounded-[18px] p-7`, `grid-cols-[1fr_1fr_auto] gap-[22px] items-end`. Title "Check availability" (`font-display font-semibold text-xl`) + subtitle "No account needed — pick your dates." Two date inputs (`bg-volt-bg border border-volt-stroke rounded-[10px]`) + lime "Search bikes" button. Wire to existing `handleSearch` → `/bikes?from=&to=`.
- **How it works**: H2 "Rolling in four steps" (`font-display font-bold text-[34px]`). 4-col grid of `bg-volt-surface border border-volt-border rounded-2xl p-6` cards; each has a lime `font-display` number (01–04), title, and description. Reuse the existing `steps` array copy (Register / Subscribe / Ride / Return).
- **Pricing**: H2 "Simple pricing". 2-col grid. Weekly card = surface + outline button ($95/week). Monthly card = **lime gradient** `linear-gradient(160deg,#d4ff3f,#a8e600)` with dark text, a `BEST VALUE` pill (`bg-volt-bg text-accent`), $280/month, dark button. Copy from existing `plans` array.

### Browse Bikes — `src/pages/Bikes.jsx`  (ref: 2A)
- Header row: H1 "Browse bikes" (`font-display font-bold text-[38px]`) + station `<select>` styled `bg-volt-surface border border-volt-stroke rounded-[10px] px-4 py-3`.
- Date-filter chip (when `from`/`to` present): `bg-accent/10 border border-accent/25 text-accent rounded-[10px] px-4 py-2.5` with underlined "Clear".
- Bike grid: `grid-cols-3 gap-[22px]` (→ 2 → 1 responsive). Card = `bg-volt-surface border border-volt-border rounded-2xl overflow-hidden`, hover `hover:border-volt-stroke`. Top: image (h-180, `object-cover`) or emoji fallback. Body `p-[18px]`: name (`font-display font-semibold text-lg`, hover `text-accent`) + status Badge on the same row; type (`text-volt-dim text-sm`); station (`text-volt-faint text-[13px]` with 📍). Whole card links to `/bikes/:id`.
- Loading: lime spinner (`border-b-2 border-accent`). Empty state: `text-volt-dim`, centered.

### Bike Detail — `src/pages/BikeDetail.jsx`  (ref: 2B)
- Back link "← Back to bikes" `text-accent text-sm font-semibold`.
- Card `bg-volt-surface border border-volt-border rounded-[20px] overflow-hidden`: hero image h-300 `object-cover` (emoji fallback on `bg-volt-bg`).
- Body `p-8`: title (`font-display font-bold text-[34px]`) + type (`text-volt-dim`) on the left, status Badge on the right. Station + address row (📍, `text-volt-muted`).
- **Duration stepper**: label "Rental duration (weeks)". − / + buttons `w-10 h-10 rounded-[10px] border border-volt-outline text-volt-muted`; value `font-display font-bold text-[26px]`; "max 12 weeks" note `text-volt-faint`.
- **Pricing summary** box `bg-volt-bg border border-volt-border rounded-[14px] p-[18px]`: "N weeks × $rate/week" + total `font-display font-bold text-[22px]`. Keep existing pricing logic (`rate = weeks < 4 ? 95 : 70`). Tip line `text-accent text-[13px]` (bulk) or `text-accent` prompt to book 4+.
- CTA: full-width primary "Book now — $total".

### Dashboard — `src/pages/Dashboard.jsx`  (ref: 2C)
- H1 "My dashboard" (`font-display font-bold text-[34px]`).
- Success banners (`justSubscribed` / `justBooked`): `bg-accent/10 border border-accent/25 text-accent rounded-xl px-[18px] py-3.5 text-sm`.
- 2-col grid of Cards. **Subscription** card: Active Badge + plan name (`font-display font-semibold`), "Valid until <date>", lime "Manage subscription →" link. Empty → "No active subscription." + "Subscribe now" Button.
- **Current rental** card: 🚴 tile (`w-12 h-12 rounded-[11px] bg-volt-bg border border-volt-border`) + bike name/type/station; meta block `text-volt-dim text-[13px] leading-relaxed` (Started / Return by / Duration / Paid); **danger** "Return bike" Button. Empty → "No active rental." + "Find a bike" Button.

### Subscribe — `src/pages/Subscribe.jsx`  (ref: 2D)
- H1 "Choose your plan" + subtitle "Unlock unlimited bike access with a subscription." (`text-volt-dim`).
- Active-sub notice + error alerts: reuse the accent/red alert patterns.
- 2-col plan grid, same treatment as Home pricing: Weekly = surface + outline "Subscribe with Stripe"; Monthly = lime gradient + `BEST VALUE` pill + dark "Subscribe with Stripe". Price `font-display font-bold text-[44px]`, `plan.duration_days days` caption. Keep `handleSelect` / Stripe flow and the disabled/`loading` states.

### Login — `src/pages/Login.jsx`  (ref: 2E)
- Centered card `max-w-md bg-volt-surface border border-volt-border rounded-[18px] p-8` on `bg-volt-bg`, Navbar on top (no footer).
- H1 "Welcome back" (`font-display font-bold text-[26px]`) + "Sign in to your account." (`text-volt-dim`).
- Inputs: label `text-[13px] font-semibold text-volt-muted`; field `bg-volt-bg border border-volt-stroke rounded-[10px] px-[15px] py-3.5 focus:ring-2 focus:ring-accent`.
- Full-width primary "Sign in". Footer link "Register" `text-accent font-semibold`. Keep red error alert div.

### Register — `src/pages/Register.jsx`  (ref: 2F)
- Same card shell. H1 "Create account" + "Start your e-bike subscription today."
- Fields (existing `form` state): Full name, Email, Password (min 6), Phone, and Delivery platform `<select>` (DoorDash / Uber Eats / Other) styled like inputs with a `▾`.
- Full-width primary "Create account". Footer link "Sign in". Keep the `signUp → /subscribe` flow.

---

## Interactions & Behavior
- **Navigation flows** (unchanged from current app): Home CTAs → `/register`, `/bikes`; availability search → `/bikes?from=&to=`; bike card → `/bikes/:id`; Book now → Stripe booking checkout → `/dashboard?booked=true`; Subscribe → Stripe → `/dashboard?subscribed=true`; Login → `/dashboard`; Register → `/subscribe`; Return bike → updates booking + bike status.
- **Hover states**: nav links `→ text-accent`; bike cards `→ border-volt-stroke`; buttons darken (`bg-accent → bg-accent-600`).
- **Loading**: keep boolean `loading` flags; spinners use `border-accent` / `currentColor`.
- **Error states**: red alert div `bg-[#e5484d]/10 border border-[#e5484d]/25 text-[#ff8079] rounded-lg p-3 text-sm`.
- **Transitions**: `transition-colors duration-150` on interactive elements (already in Button).
- **Responsive**: hero, how-it-works, pricing, bike grid all collapse to fewer columns at `md`/`sm` breakpoints (the mocks show a 340px mobile treatment in `Home Redesign.dc.html`).

## State Management
No changes. All existing hooks/state stay: `useAuth`, `useBikes`, `useSubscription`,
`durationWeeks`, booking/subscription fetches, Stripe redirects. This is a **styling-only**
redesign — do not alter data flow, routes, or Supabase/Stripe logic.

## Design Tokens
**Colors**
- Background `#0d0f0e` · Surface `#141815` · Border(surface) `#232825` · Border(bg) `#1e2220`
- Input border `#2a302c` · Secondary outline `#33393c`
- Text `#f4f6f4` · Muted `#a9b0ab` · Dim `#8b928c` · Faint `#7c837d`
- Accent lime `#d4ff3f` · Accent dark `#a8e600` · Gradient `linear-gradient(160deg,#d4ff3f,#a8e600)`
- Status: rented `#7fb0ff` · maintenance `#ffcf66` · danger `#e5484d`
- Eyebrow text `#c7ffbe`

**Typography** — Space Grotesk (500/600/700) display · Hanken Grotesk (400/500/600/700) body.
Scale used: 66 (hero h1), 44 (price), 38/34 (page h1), 30 (stat), 26 (auth h1), 22 (card price),
20 (logo/section title), 19/18/17/16/15/14/13/12.

**Radius** — pill `999px` · cards `16–20px` · inputs/buttons `9–12px` · icon tiles `9–11px`.

**Shadow** — page cards in mocks use `0 30px 80px -30px rgba(0,0,0,.45)` (mock chrome only; in-app cards just use borders).

## Assets
- **Bike imagery**: the mocks use drag-and-drop image placeholders. Supply real bike photos
  (or keep the current `bike.image_url` from Supabase; the 🚴 emoji fallback remains for
  missing images). No icons beyond the existing emoji set (⚡ logo, 📍 station, 🚴, 📝💳🔄).
- **Fonts**: Google Fonts (Space Grotesk, Hanken Grotesk) — linked, no local files.

## Files
- `Home Redesign.dc.html` — landing page, **option 1A** is the chosen direction (1B/1C are alternates, ignore).
- `Rider Flow — Voltage.dc.html` — screens 2A Browse Bikes, 2B Bike Detail, 2C Dashboard, 2D Subscribe, 2E Login, 2F Register.
- `image-slot.js` — runtime for the placeholder images in the mocks (reference only; not needed in the React app).

## Deploying
Standard existing pipeline: commit and `git push` → Vercel auto-builds (SPA rewrites already
configured in `vercel.json`). Ensure `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and
`VITE_STRIPE_PUBLISHABLE_KEY` are set in the Vercel project settings.
