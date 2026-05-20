# Supabase End-to-End Integration — Design Spec
Date: 2026-05-14

## Problem

Reservations submitted through /reservation are stored nowhere because:
1. Supabase env vars are missing from .env.local — all code silently falls back to mock data
2. /api/alerts reads from an in-memory module (lib/store.ts), never Supabase
3. lib/supabase/data.ts line 155 falls back to mock data when Supabase returns 0 rows — a fresh empty DB always shows fake data

## Architecture

The existing code already has the correct shape:
- StepConfirm POSTs to /api/reservations (no change needed)
- /api/reservations/route.ts inserts into customers + reservations + alerts + system_logs (no change needed)
- /aria/agenda calls getCockpitData() which queries the reservations table (minor fix needed)
- /aria/alertes calls /api/alerts (fix needed: switch source from store to Supabase)

## Schema

Four tables, run once in the Supabase SQL editor.

### customers
| column              | type        | notes                        |
|---------------------|-------------|------------------------------|
| id                  | uuid PK     | gen_random_uuid()            |
| created_at          | timestamptz | default now()                |
| updated_at          | timestamptz | default now()                |
| first_name          | text        | not null                     |
| last_name           | text        | not null                     |
| phone               | text        | not null                     |
| phone_normalized    | text        | not null, unique             |
| email               | text        | nullable                     |
| total_visits        | integer     | default 0                    |
| total_spent_cents   | integer     | default 0                    |
| notes               | text        | nullable                     |

### reservations
| column                       | type        | notes                      |
|------------------------------|-------------|----------------------------|
| id                           | uuid PK     | gen_random_uuid()          |
| created_at                   | timestamptz | default now()              |
| customer_id                  | uuid FK     | references customers       |
| service_type                 | text        | exterior/interior/complete |
| scheduled_at                 | timestamptz | not null                   |
| estimated_duration_minutes   | integer     | default 60                 |
| operational_status           | text        | default 'scheduled'        |
| payment_status               | text        | default 'unpaid'           |
| price_cents                  | integer     | default 0                  |
| notes                        | text        | nullable                   |
| vehicle_make                 | text        |                            |
| vehicle_model                | text        |                            |
| vehicle_year                 | integer     |                            |
| vehicle_color                | text        |                            |
| vehicle_type                 | text        |                            |
| vehicle_notes                | text        | nullable                   |
| supplements                  | text[]      |                            |
| sms_opt_in                   | boolean     | default true               |
| is_first_visit               | boolean     | default false              |
| arrived_at                   | timestamptz | nullable                   |
| started_at                   | timestamptz | nullable                   |
| completed_at                 | timestamptz | nullable                   |
| picked_up_at                 | timestamptz | nullable                   |

### alerts
| column         | type        | notes                    |
|----------------|-------------|--------------------------|
| id             | uuid PK     | gen_random_uuid()        |
| created_at     | timestamptz | default now()            |
| reservation_id | uuid FK     | references reservations  |
| alert_type     | text        | e.g. new_reservation     |
| title          | text        | not null                 |
| body           | text        | not null                 |
| is_read        | boolean     | default false            |

### system_logs
| column         | type        | notes                    |
|----------------|-------------|--------------------------|
| id             | uuid PK     | gen_random_uuid()        |
| created_at     | timestamptz | default now()            |
| level          | text        | info/warn/error          |
| event_type     | text        | e.g. reservation.created |
| message        | text        |                          |
| metadata       | jsonb       | nullable                 |
| reservation_id | uuid FK     | references reservations  |
| customer_id    | uuid FK     | references customers     |

## Code Changes

### 1. /api/alerts/route.ts — GET handler

Query the Supabase `alerts` table ordered by `created_at desc`.
Fallback to `lib/store.getAlerts()` when env vars are absent.

Fallback pattern: wrap `getServiceSupabase()` in try/catch; if it throws
`SupabaseConfigError`, fall through to the in-memory store — same pattern
used by /api/reservations/route.ts.

Response shape (unchanged from current contract, alertes/page.tsx expects this):
```
{
  success: true,
  alerts: [{
    id: string,
    type: AlertType,          // mapped from alert_type (see mapping table below)
    title: string,
    body: string,
    isRead: boolean,          // mapped from is_read
    reservationId: string | null,   // mapped from reservation_id
    createdAt: string,        // ISO string from created_at
  }]
}
```

### alert_type → UI AlertType mapping
| DB alert_type      | UI AlertType |
|--------------------|--------------|
| new_reservation    | rdv          |
| cancellation       | annulation   |
| reminder           | rappel       |
| slot_available     | vide         |
| special_request    | demande      |
| (anything else)    | rdv          |

### 2. /api/alerts/route.ts — PATCH handler

**markRead** (body.action === 'markRead', body.id is a string):
```
supabase.from('alerts').update({ is_read: true }).eq('id', body.id)
```
Fall back to `markAlertRead(id)` from lib/store on SupabaseConfigError.

**markAllRead** (body.action === 'markAllRead'):
```
supabase.from('alerts').update({ is_read: true }).eq('is_read', false)
```
The filter `.eq('is_read', false)` is required — Supabase's PostgREST client
rejects unbounded updates by default.
Fall back to `markAllRead()` from lib/store on SupabaseConfigError.

### 3. lib/supabase/data.ts — line 155 only

Remove ONLY this guard:
```ts
if (bookings.length === 0) return mockData(filter)
```

Leave untouched:
- Lines 136–139: `if (error || !data) { return mockData(filter) }` — legitimate
  error-path fallback, must stay.
- Lines 158–161: the catch block that falls back to mockData on thrown exceptions —
  must stay.

### 4. .env.local (local dev)

Add:
```
NEXT_PUBLIC_SUPABASE_URL=<from Supabase dashboard → Settings → API>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase dashboard → Settings → API>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase dashboard → Settings → API>
```

Note: the variable name is `SUPABASE_SERVICE_ROLE_KEY`, not `SUPABASE_SERVICE_KEY`.

### 5. Vercel environment variables (production)

Add the same three variables in:
Vercel dashboard → Project → Settings → Environment Variables

Set scope to "Production" and "Preview" as needed. After adding, redeploy.

## Known Open Issues (out of scope for this change)

**Timezone bug in /api/reservations/route.ts line 86:**
```ts
const scheduledAt = new Date(y, mo - 1, d, h, mi, 0, 0)
```
`new Date(y, m, d, h, m)` uses the Node process's local timezone. On Vercel (UTC),
appointments stored in Supabase will be in UTC, which is correct only if the business
is also in UTC. For EST/EDT businesses, times will be offset by 4–5 hours. Fix
requires using UTC construction: `new Date(Date.UTC(y, mo-1, d, h, mi))` or passing
the timezone from the client. This should be addressed as a follow-up.

## Out of scope
- StepConfirm — already correct, no changes
- /aria/agenda/page.tsx — no changes
- /aria/alertes/page.tsx — no changes
- Authentication / RLS policies — separate concern
- SMS / email notifications — separate concern
