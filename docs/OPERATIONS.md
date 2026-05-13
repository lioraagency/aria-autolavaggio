# Operations — ARIA Autolavaggio (LIORA)

## Ownership model

| Asset | Owner of record | Notes |
|-------|-----------------|--------|
| Source code | LIORA (agency) on behalf of ARIA Autolavaggio | Git repository; client may receive access per contract |
| Production deployment | LIORA-managed Vercel project | Production URL: `https://aria-autolavaggio.vercel.app` |
| Domain / DNS | As per contract | May be client registrar with LIORA technical DNS access |
| Supabase project | LIORA + client per agreement | Planned project: `aria-autolavaggio-production` |
| Secrets | **Password manager / Vercel env / Supabase dashboard** — never in chat or git | Rotate on staff change |

## Where code lives

- **Repository:** `aria-autolavaggio` (this repo).
- **Local path (reference workstation):** `/Users/lio/aria-autolavaggio`.
- **Remote:** Git hosting (e.g. GitHub) — URL stored in `git remote -v`; document the canonical remote in `docs/ACCESS_MAP.md` when filled.

## Where deployment lives

- **Platform:** Vercel.
- **Project:** linked CLI metadata is gitignored (`.vercel/`); reconnect via `vercel link` or dashboard per `docs/DEPLOYMENT_GUIDE.md`.

## Where database lives

- **Planned:** Supabase project `aria-autolavaggio-production` — connection strings and keys only in Vercel env and password manager.

## Where secrets should live

1. **Team password manager** — primary source of truth for humans (root passwords, API keys, backup codes).
2. **Vercel** — production and preview environment variables.
3. **Supabase** — database password, service role key (duplicate into password manager).
4. **Never:** git history, screenshots in tickets, email plaintext, shared Notion without access control.

## What happens if the laptop is lost

1. Assume local clones and `.env.local` copies may be compromised if disk was not encrypted.
2. **Rotate** `AUTH_SECRET`, Supabase keys, Cal.com key, Twilio, Resend, any third-party tokens documented in `docs/ACCESS_MAP.md`.
3. Revoke GitHub/Vercel sessions from those services’ security settings.
4. Follow `docs/RECOVERY_RUNBOOK.md` on a clean machine.

## How to hand off to another developer

1. Grant least-privilege access: GitHub repo, Vercel team, Supabase project (viewer vs developer as appropriate).
2. Share **password manager vault** entries or invite to shared vault—do not paste secrets in Slack/email.
3. Point them to **`README.md`** then **`AGENTS.md`** then the rest of `docs/`.
4. Schedule a **30–60 minute walkthrough**: reservation flow, staff login (temporary PIN caveat), deploy pipeline, on-call expectations.
5. Update `docs/ACCESS_MAP.md` with the new person’s role (no secrets in that file).

## Monthly maintenance tasks

- [ ] Review Vercel / Supabase usage and billing alerts.
- [ ] Apply **npm audit** / dependency patches (test `npm run build` after).
- [ ] Confirm production env vars still match password manager (spot-check).
- [ ] Review **support / incident** entries for the month (`docs/SUPPORT.md` templates).
- [ ] Run **upsell pipeline** monthly review (`docs/UPSELL_PIPELINE.md`).
- [ ] Verify backup / RPO expectations for Supabase once live (Supabase dashboard PITR if enabled).

## Client communication

Use the templates in `docs/SUPPORT.md` for tickets and incidents. Keep a single thread per incident where possible.
