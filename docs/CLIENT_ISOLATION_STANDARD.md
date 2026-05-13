# LIORA client isolation standard

LIORA builds and operates **one vertical stack per client**. This reduces blast radius, simplifies compliance, and makes handoffs predictable.

## The rule (1:1)

| Principle | Meaning |
|-----------|---------|
| **1 client = 1 folder** | Each client has a dedicated directory on disk; no shared “mega repo” for unrelated clients unless an explicit monorepo policy exists and is documented. |
| **1 client = 1 repo** | Git history, CI, issues, and releases are scoped to that client. |
| **1 client = 1 database** | No shared logical database across clients; no multi-tenant row hack as the only boundary. |
| **1 client = 1 deployment** | Production project (e.g. Vercel) maps 1:1 to the client; domains and env vars are not mixed. |
| **1 client = 1 access map** | `docs/ACCESS_MAP.md` (filled per client) lists accounts and **where** secrets live—not the secrets themselves. |
| **1 client = 1 support log** | Support and incidents use templates in `docs/SUPPORT.md`; history is not mixed with other clients. |
| **1 client = 1 upsell pipeline** | Expansion and renewals tracked per account (`docs/UPSELL_PIPELINE.md`). |

## Why LIORA uses one-client-one-stack

- **Security:** A bug or leaked key in Client A must not expose Client B’s data or infrastructure.
- **Clarity:** Developers and AI agents always know which URLs, env vars, and databases apply.
- **Recovery:** Disaster runbooks and access maps are per repo—no guessing.
- **Commercial:** Usage, hosting, and support line items map cleanly to one client P&L.

## What must never be shared between clients

- Database instances, schemas, or connection strings.
- Vercel projects, environment variable namespaces, or analytics properties.
- API keys for email, SMS, Cal.com, payment, or maps.
- Password manager vault items (each client gets distinct entries).
- Support threads, incident timelines, or upsell notes (use separate docs or CRM objects per client).

## Naming conventions

| Artifact | Convention (example: ARIA) |
|----------|----------------------------|
| Local folder | `aria-autolavaggio` or `client-aria-autolavaggio` |
| Git repo | `aria-autolavaggio` (match deploy name when practical) |
| Supabase project | `aria-autolavaggio-production` (and `-staging` if needed) |
| Vercel project | Align with repo name, e.g. `aria-autolavaggio` |
| Branching | `main` = production-eligible; feature branches per change |

Adjust slug for client brand; **keep names grep-friendly** and consistent across DNS, Vercel, and Supabase.

## How to create a new client project from the ARIA model

1. **Copy repo** — Duplicate `aria-autolavaggio` as a new private repo (do not fork into a public chain unless intended).
2. **Rename** — `package.json` name, README titles, `CLIENT_NAME` / `NEXT_PUBLIC_CLIENT_NAME`.
3. **Strip client-specific constants** — Replace hardcoded booking links, phone placeholders, and demo users with env-driven or empty template values in code **when implementing** (documentation-only phase may leave code unchanged).
4. **New Supabase** — Create a dedicated project; never reuse ARIA’s.
5. **New Vercel** — New project; connect new repo; set env from `.env.example` template.
6. **New secrets** — Generate new `AUTH_SECRET` and all third-party keys; store in password manager.
7. **Docs** — Copy `docs/` structure; update `ACCESS_MAP.md`, `OPERATIONS.md`, URLs, and pricing rows.
8. **Access map** — Fill `docs/ACCESS_MAP.md` with accounts (no secret values).
9. **Verify isolation** — Confirm no env var or dashboard still points at ARIA assets.

This repository (**ARIA Autolavaggio**) is the reference implementation for the funnel + cockpit pattern under LIORA.
