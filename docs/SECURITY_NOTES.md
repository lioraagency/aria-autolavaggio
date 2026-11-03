# Security notes — ARIA Autolavaggio

This document describes **known risks** and **mitigation paths** without exposing secret values.

## Hardcoded PIN risk

- **Observation:** Staff authentication may rely on a **fixed PIN list in source** (`lib/users.ts`) for development velocity.
- **Risk:** Anyone with repo access knows valid credentials; brute force on a 4-digit PIN is trivial without lockout.
- **Mitigation path:** Move to hashed passwords, magic links, SSO, or hardware keys; add rate limiting and lockout; never commit production credentials.

## Supabase anon key in the browser (`/aria/dispo`)

- **Observation:** `/aria/dispo` ships `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the browser (first browser-side Supabase usage).
- **Risk:** The anon key is public by design; any table without RLS (or with broad grants to `anon`) becomes readable/writable by anyone.
- **Mitigation in place:** RLS enabled on all public tables; `anon` has no privileges on business tables (`permission denied`); `blocked_dates` grants only `SELECT` to `anon`, writes restricted by RLS to the owner's email. **Any new table must enable RLS and grant explicitly.**

## Owner magic-link login (`/aria/dispo`)

- **Observation:** Login via Supabase Auth magic link; one account (owner's email), sign-ups disabled, `shouldCreateUser: false`. The allowed email is hardcoded in the `blocked_dates` RLS policies.
- **Risk:** Whoever controls the owner's mailbox can block dates; changing the owner's email requires updating both the Auth user and the RLS policies.
- **Notes:** Supabase's built-in SMTP is rate-limited (~2 login emails/hour); a custom SMTP (e.g. Resend) is a planned improvement. Test accounts used during development must be deleted and removed from the policies afterwards.

## AUTH_SECRET fallback risk

- **Observation:** Session encryption password may fall back to a **development default** when `AUTH_SECRET` is unset.
- **Risk:** Predictable cookie encryption in misconfigured deployments.
- **Mitigation path:** Require `AUTH_SECRET` in production builds (fail CI/deploy if missing); generate unique per-environment secrets.

## Query-string API key risk (if present)

- **Observation:** External calendar API calls may pass **`apiKey` as a query parameter** (see `lib/cal.ts`).
- **Risk:** Keys leak via logs, Referer headers, browser history on shared machines, and proxy logs.
- **Mitigation path:** Use header-based auth per vendor docs; restrict key scope; rotate if ever logged.

## PII logging risk

- **Observation:** Mock SMS or debug paths may **log phone numbers or message bodies** to console.
- **Risk:** PII in Vercel logs; retention and access broader than necessary.
- **Mitigation path:** Structured logging with redaction; disable verbose logs in production; short retention where configurable.

## Rate limiting needs

- **Public `POST` endpoints** (e.g. public booking creation) can be abused for spam or cost attacks.
- **Mitigation path:** Edge or server rate limits, CAPTCHA or proof-of-work for abuse waves, request size limits, idempotency keys for writes.

## Staff auth upgrade path

1. Introduce **server-verified** credentials stored in Supabase `business_settings` or auth provider.  
2. **Rate limit** `/api/auth`; add observability on failures.  
3. **Session fixation / CSRF:** follow Next.js + iron-session hardening guidance for cookie apps.  
4. Optional: **role-based** routes for future multi-staff.

## Secret rotation checklist

- [ ] Generate replacement secret in password manager  
- [ ] Update Vercel Production (and Preview if applicable)  
- [ ] Update Supabase if rotating DB or JWT secret per their docs  
- [ ] Update third-party dashboards (Twilio, Resend, Cal.com)  
- [ ] Redeploy application  
- [ ] Invalidate old keys at provider  
- [ ] Record completion date in vault audit note  

## Production readiness checklist

- [ ] No hardcoded production credentials in repo  
- [ ] `AUTH_SECRET` strong and unique  
- [ ] Supabase RLS enabled; service role only server-side  
- [ ] Public write endpoints rate-limited  
- [ ] Email/SMS sending from verified domains/numbers  
- [ ] Error monitoring (e.g. Sentry) considered  
- [ ] `docs/ACCESS_MAP.md` filled with account locations  
- [ ] Incident channel agreed with client (`docs/SUPPORT.md`)  
