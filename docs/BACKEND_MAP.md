# Backend map — ARIA Autolavaggio

**Scope:** Current server behavior and **planned** Supabase-backed API surface. Application code is not refactored by this document—this is the source of truth for intent until implementation catches up.

## Current backend reality

| Surface | File(s) | Behavior |
|---------|---------|----------|
| Staff session login | `app/api/auth/route.ts` | Validates PIN → iron-session cookie |
| Staff session logout | `app/api/logout/route.ts` | Clears session |
| Staff bookings read | `app/api/bookings/route.ts` | Session required; reads from `lib/cal.ts` |
| Public reservation submit | `app/api/public-bookings/route.ts` | **No session**; mutates `lib/mock-data.ts` in memory |
| Public booking lookup | `GET` on same route | Reads mock store by id |
| SMS stub | `app/api/sms/route.ts` | Mock response / console logging pattern |
| Auth gate | `middleware.ts` | Protects `/aria/*` except login and auth API |

## Existing mock or in-memory behavior

- **`lib/mock-data.ts`** — Seed customers, vehicles, bookings; **mutated at runtime** by `public-bookings` POST. **Not replicated** across serverless instances; **lost** on cold start.
- **`lib/cal.ts`** — Mock booking arrays and optional Cal.com HTTP fetch when `CAL_API_KEY` is set. Two code paths must stay mentally in sync with future DB writes.

## Cal.com / API integration

- When `CAL_API_KEY` is present and not a placeholder, `getBookingsForDate` / `getBookingsForWeek` attempt Cal.com **v1** list endpoints.
- Transform logic maps remote payloads into internal `Booking` shape; failures fall back to mock data.
- **Security note:** query-string API key pattern is called out in `docs/SECURITY_NOTES.md`.

## Planned Supabase tables

| Table | Purpose |
|-------|---------|
| **customers** | Identity, contact preferences, visit stats, notes |
| **reservations** | Scheduled service, price, status, links to customer and vehicle records |
| **alerts** | Operational notifications (new booking, SLA breach, equipment) |
| **business_settings** | Hours, services, feature flags, notification endpoints |
| **system_logs** | Append-only audit trail for API and integration events |

Schema migrations should live in repo when implemented (SQL or Supabase migration tool)—not only in dashboard.

## Planned HTTP endpoints (target shape)

These names describe the **desired REST surface** for persistence. Today, analogous behavior partially lives under different paths (see “Current” above). Implementations should preserve existing routes until an intentional migration.

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/reservations` | Create reservation (+ side effects: customer upsert, alert, system log) |
| `GET` | `/api/reservations` | List/filter reservations (auth + RLS) |
| `PATCH` | `/api/reservations/[id]/status` | Update operational or payment status |
| `GET` | `/api/alerts` | Staff fetch of open alerts |
| `PATCH` | `/api/alerts/[id]/read` | Mark alert consumed |

**Migration note:** `POST /api/public-bookings` remains the current public entry point in code; a future task may proxy, rename, or internally delegate to `/api/reservations` without breaking the `/reservation` UI contract.

## Product integrity warning

> **Public booking data must persist in a real database before this product is sold or operated as a reliable system of record.** Until then, treat reservations as **demonstrations** or **best-effort** only. Confirm backups, RLS, and monitoring before marketing durability to the client’s customers.

## Backend goal (recap)

Every reservation submitted from **`/reservation`** should ultimately create:

1. **Customer** record (or link existing),  
2. **Reservation** record,  
3. **Alert** for staff,  
4. **System log** entry for traceability,  

plus outbound notifications when the notification layer is connected.
