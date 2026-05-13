# ARIA Autolavaggio

**Client:** ARIA Autolavaggio  
**Agency:** LIORA  
**Repository:** `aria-autolavaggio`  
**Local workspace:** `/Users/lio/aria-autolavaggio`  
**Production:** [https://aria-autolavaggio.vercel.app](https://aria-autolavaggio.vercel.app)

## What this project is

ARIA is a **Next.js** application for ARIA Autolavaggio: a **public reservation funnel** where customers book services, plus a **private staff cockpit** for day-of operations (agenda, alerts, settings). The product pairs customer-facing scheduling with internal visibility—not a generic marketing site.

## What LIORA is delivering

LIORA owns **design, implementation, deployment, and ongoing operations** for this client stack under the [client isolation standard](docs/CLIENT_ISOLATION_STANDARD.md):

- Reservation experience (`/reservation` and related confirmation flow).
- Staff cockpit behind authentication (`/aria/*`).
- Planned persistence and notifications (Supabase, email, SMS)—see [Architecture](docs/ARCHITECTURE.md) and [Backend map](docs/BACKEND_MAP.md).

**Commercial framing (indicative):** setup **$650** + **$147/month** maintenance/hosting tier (confirm in contract).

## Project status

| Area | Status |
|------|--------|
| Public reservation UI | In development / iterative |
| Staff cockpit | In development; **PIN-based auth is temporary—not production-secure** |
| Persistence | **In-memory / mock paths present**; data does not survive serverless cold starts until Supabase is wired |
| Supabase | **Planned** — project name: `aria-autolavaggio-production` (configure per [Operations](docs/OPERATIONS.md)) |
| Email / SMS | Partially stubbed (e.g. SMS mock); production providers to be connected |
| Production deploy | Vercel app live at URL above |

For gaps and risks, see [Known issues](docs/KNOWN_ISSUES.md).

## Local setup

**Prerequisites:** Node.js 20+ (LTS recommended), npm.

```bash
cd /Users/lio/aria-autolavaggio
npm install
cp .env.example .env.local
# Edit .env.local — never commit real secrets (see docs/SECURITY_NOTES.md)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use `/reservation` for the public funnel and `/aria/login` for the staff cockpit (see route map below).

## Required environment variables

Copy [`.env.example`](.env.example) to `.env.local`. At minimum for a safe local session:

- `AUTH_SECRET` — required for iron-session in any shared or production environment (see security docs).
- Optional integrations: `CAL_API_KEY`, Supabase keys, Twilio, Resend, etc., as listed in `.env.example`.

Full variable list and meanings: **`.env.example`**.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint |

## Route map

| Path | Audience | Purpose |
|------|----------|---------|
| `/` | Public | Marketing / entry (as implemented) |
| `/reservation` | Public | Reservation funnel |
| `/reservation/confirmation` | Public | Post-booking confirmation |
| `/aria/login` | Staff | Cockpit login |
| `/aria` | Staff | Cockpit home / dashboard |
| `/aria/agenda` | Staff | Agenda view |
| `/aria/alertes` | Staff | Alerts |
| `/aria/reglages` | Staff | Settings |

API routes (current): `app/api/auth`, `app/api/logout`, `app/api/bookings`, `app/api/public-bookings`, `app/api/sms`. Planned REST shape for Supabase-backed flows is documented in [Backend map](docs/BACKEND_MAP.md).

## Data source warning

**Public bookings and related mock data may live in process memory.** On Vercel (serverless), instances spin up and down—**submissions are not durable** until a database (planned: Supabase) backs them. Do not sell or operate this as a sole source of truth for reservations until persistence and notifications are implemented and verified.

## Deployment summary

Hosted on **Vercel**. Environment variables must be set in the Vercel project dashboard for production and preview. See [Deployment guide](docs/DEPLOYMENT_GUIDE.md).

## Recovery summary

If hardware is lost or a new developer joins: clone this repo, restore secrets from the team password manager, reconnect Vercel and Supabase, populate env vars, run local and production verification. Step-by-step: [Recovery runbook](docs/RECOVERY_RUNBOOK.md).

## Documentation index

| Document | Purpose |
|----------|---------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, flows, production vs not-ready |
| [docs/BACKEND_MAP.md](docs/BACKEND_MAP.md) | APIs, mocks, planned Supabase model |
| [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | Vercel, env, rollback, verification |
| [docs/OPERATIONS.md](docs/OPERATIONS.md) | Ownership, handoff, monthly tasks |
| [docs/CLIENT_ISOLATION_STANDARD.md](docs/CLIENT_ISOLATION_STANDARD.md) | LIORA one-client-one-stack rule |
| [docs/CLIENT_OPERATIONS_CHECKLIST.md](docs/CLIENT_OPERATIONS_CHECKLIST.md) | Onboarding through support |
| [docs/ACCESS_MAP.md](docs/ACCESS_MAP.md) | Where accounts and secrets live (template) |
| [docs/SUPPORT.md](docs/SUPPORT.md) | Support and incident templates |
| [docs/UPSELL_PIPELINE.md](docs/UPSELL_PIPELINE.md) | Expansion and review cadence |
| [docs/RECOVERY_RUNBOOK.md](docs/RECOVERY_RUNBOOK.md) | Disaster and handoff procedures |
| [docs/SECURITY_NOTES.md](docs/SECURITY_NOTES.md) | Threats, checklists, auth upgrade path |
| [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md) | Acknowledged gaps |
| [AGENTS.md](AGENTS.md) | Instructions for AI and human contributors |

---

*Maintained by LIORA for ARIA Autolavaggio.*
