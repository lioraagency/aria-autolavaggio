# Architecture — ARIA Autolavaggio

**Agency:** LIORA · **Client:** ARIA Autolavaggio · **Stack:** Next.js 14 (App Router), TypeScript, Tailwind, iron-session.

## App Router structure

High-level layout under `app/`:

- **Public marketing / home** — `app/page.tsx`, `app/layout.tsx`
- **Reservation funnel** — `app/reservation/` (multi-step flow, confirmation)
- **Staff cockpit** — `app/aria/` (nested layout, pages: login, home, agenda, alertes, reglages)
- **Route handlers** — `app/api/*` for auth, bookings, public bookings, SMS stub

Shared libraries live under `lib/` (auth session config, users, Cal wrapper, mock data, types). Middleware in `middleware.ts` restricts `/aria/*` (except login and auth API) to authenticated sessions.

## Public customer flow

1. Customer lands on public routes (e.g. home, `/reservation`).
2. Reservation steps collect service, vehicle, slot, and contact details (client components under `components/reservation/` as wired in app).
3. Submission hits **`POST /api/public-bookings`** (current implementation), which today mutates in-memory mock structures—**not durable on serverless** until Supabase backs it.
4. Confirmation UI under `/reservation/confirmation` reflects success state as implemented.

**Product goal (documented target, not a guarantee of current code):** each successful reservation should ultimately create **customer**, **reservation**, **alert**, and **system log** rows in the database plus outbound notifications.

## Staff cockpit flow

1. Unauthenticated users hitting `/aria/*` (except login) are redirected to `/aria/login` via middleware.
2. **`POST /api/auth`** validates credentials and establishes an iron-session cookie.
3. Staff pages load agenda/booking data via **`GET /api/bookings`** (session-protected), with underlying data from Cal.com API when configured, otherwise mock data in `lib/cal.ts`.
4. **`POST /api/logout`** clears the session.

## Auth / session flow

- **Library:** `iron-session` with options from `lib/auth.ts` (cookie name, password from env, httpOnly, sameSite, maxAge).
- **Middleware:** reads session for `/aria` matcher; redirects to login if not `isLoggedIn`.
- **Important:** current PIN list is **in source code** for expedience—**not production-secure** (see `docs/SECURITY_NOTES.md`).

## Data flow (current vs planned)

| Concern | Current | Planned |
|---------|---------|---------|
| Public reservations | In-memory mutations via `lib/mock-data.ts` | Supabase `customers`, `reservations`, `alerts`, `system_logs` |
| Staff agenda | `lib/cal.ts` — mock or Cal.com HTTP | Same + optional sync from Supabase as source of truth |
| Session | Encrypted cookie | Unchanged pattern; stronger credential store |
| Notifications | SMS route largely mock / console | Resend + Twilio with idempotency and audit |

## Current mock / in-memory risks

- **Process-local state:** `mock-data` arrays are not a database; parallel invocations and cold starts lose or fork state unpredictably.
- **Dual mock sources:** `lib/cal.ts` (agenda-style bookings) vs `lib/mock-data.ts` (reservation funnel)—contributors must read both; consolidation is a future backend task.
- **No single audit trail** for public submissions until `system_logs` and durable reservations exist.

## Planned Supabase data model (high level)

Tables (names indicative; migrate with SQL in repo when implemented):

- **customers** — identity, contact, visit stats, notes.
- **reservations** — scheduled time, service, price, links to customer/vehicle, status.
- **alerts** — operational signals (new booking, no-show risk, etc.).
- **business_settings** — hours, services, feature flags, notification preferences.
- **system_logs** — append-only technical and business events for support and compliance.

Row Level Security policies must gate anon vs service usage; server mutations that need elevated access use the service role **only** in Route Handlers or Server Actions—never in client bundles.

## Planned notification layer

- **Email:** transactional (confirmation to customer, alert to owner) via Resend (or equivalent).
- **SMS:** customer updates and critical owner pings via Twilio when integrated.
- **Owner channels:** `OWNER_NOTIFICATION_EMAIL` and `OWNER_NOTIFICATION_PHONE` as destinations, not embedded in UI.

## Production-ready vs not production-ready

| Production-ready (with correct env) | Not production-ready |
|-------------------------------------|------------------------|
| Static UI shell and routing as shipped | PIN auth from hardcoded list |
| Next.js build / Vercel deploy pipeline | Durable public reservation storage |
| iron-session pattern *if* `AUTH_SECRET` is strong and unique | Cal API key in query string (see security notes) |
| HTTPS on Vercel | Rate limiting on public APIs |
| | Full notification and monitoring story |

For deployment steps see `docs/DEPLOYMENT_GUIDE.md`. For backend specifics see `docs/BACKEND_MAP.md`.
