# Recovery runbook — ARIA Autolavaggio

Use when a **machine is lost, stolen, or replaced**, or when onboarding a developer on a clean laptop.

## If Mac is lost, broken, or stolen

1. **Assume compromise** of any local `.env.local` and browser sessions that stayed logged in.
2. From a trusted device: **rotate** all secrets listed in `docs/ACCESS_MAP.md` (starting with `AUTH_SECRET`, Supabase, Twilio, Resend, Cal.com).
3. Revoke **GitHub** and **Vercel** sessions for the old machine; review audit logs if available.
4. Notify LIORA lead and client if any production data or third-party access could be affected.

## Clone repo

```bash
git clone <CANONICAL_REPO_URL>
cd aria-autolavaggio
```

Replace `<CANONICAL_REPO_URL>` with the value documented in `docs/ACCESS_MAP.md`.

## Install dependencies

```bash
npm install
```

## Recover secrets from password manager

- Create `.env.local` from `.env.example`.
- Paste values **only** from the vault—never from chat history or screenshots.

## Reconnect Vercel

```bash
npm i -g vercel   # if CLI not installed
vercel login
vercel link       # select team + existing aria-autolavaggio project
```

Confirm project shows latest production deployment in dashboard.

## Reconnect Supabase

- Log into Supabase dashboard → project `aria-autolavaggio-production`.
- Copy **Project URL**, **anon key**, **service role** into Vercel production env and local `.env.local` (service role local-only if needed).

## Add env vars

- Mirror **all** keys from `.env.example` that the app uses in production into Vercel (Production + Preview as appropriate).
- Redeploy after changing env (see `docs/DEPLOYMENT_GUIDE.md`).

## Run local test

```bash
npm run dev
```

- Visit `/reservation` — complete a test booking with fake data.
- Visit `/aria/login` — use **test credentials** documented internally (not in git); remember PIN auth is temporary.

## Run production test

- Open `https://aria-autolavaggio.vercel.app/reservation`.
- Submit a **non-production** test if possible (or coordinate with client to delete test rows once DB exists).

## Verify reservation flow

- End-to-end: funnel → API success → confirmation page as implemented.
- When Supabase is live: confirm rows in `reservations`, `customers`, `alerts`, `system_logs`.

## Verify staff cockpit

- Login, agenda load, logout.
- Confirm middleware still protects `/aria/*`.

## Verify database tables

In Supabase SQL editor or Table Editor: confirm schema matches `docs/BACKEND_MAP.md` after migrations ship.

## Redeploy

- Trigger redeploy from Vercel (Redeploy) or push an empty commit if policy requires git-based deploys.

## Rotate secrets if needed

- Generate new `AUTH_SECRET` (32+ random chars).
- Update Vercel + local; **all users re-login** to staff cockpit.
- Document rotation date in password manager audit field.
