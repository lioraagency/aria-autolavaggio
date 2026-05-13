# LIORA client operations checklist

Use this for **every** new client engagement and for periodic reviews. Check boxes in your PM tool or copy this into a client workspace doc.

## New client onboarding

- [ ] Signed SOW / MSA and payment terms agreed
- [ ] Client folder and repo created per [CLIENT_ISOLATION_STANDARD.md](./CLIENT_ISOLATION_STANDARD.md)
- [ ] `docs/ACCESS_MAP.md` created (template → filled with account *locations*, not secrets)
- [ ] Primary contacts and escalation path recorded in `docs/SUPPORT.md` style templates

## Discovery

- [ ] Business goals and success metrics captured
- [ ] Current booking flow (tools, pain points, peak hours)
- [ ] Brand assets and legal (privacy policy, consent for SMS/email)
- [ ] Integrations inventory (domain, email, SMS, calendar, payments)

## Proposal / scope

- [ ] In-scope routes and features listed (e.g. public `/reservation`, staff `/aria/*`)
- [ ] Out-of-scope and phase-2 items explicit
- [ ] Pricing confirmed (e.g. setup **$650** + **$147**/month for ARIA-class retainers—adjust per deal)
- [ ] SLAs and response times aligned with `docs/SUPPORT.md`

## Access collection

- [ ] Git hosting org/repo access for LIORA team
- [ ] Vercel team invite or project transfer documented
- [ ] Supabase org/project invite when database phase starts
- [ ] Domain DNS access or delegation instructions
- [ ] Third-party: Cal.com (or booking provider), email (Resend), SMS (Twilio)—**vault entries** created

## Technical setup

- [ ] Clone repo; `npm install`; `.env.local` from `.env.example`
- [ ] Vercel project linked; preview deploy green
- [ ] Production URL or custom domain documented in README and `DEPLOYMENT_GUIDE.md`

## Backend setup

- [ ] Supabase project provisioned (isolated per client)
- [ ] Migrations for `customers`, `reservations`, `alerts`, `business_settings`, `system_logs` (when implemented)
- [ ] RLS policies reviewed; service role used only server-side
- [ ] Reservation submission path writes customer + reservation + alert + system log (target architecture—track until done)

## Testing

- [ ] Local: `npm run dev` — `/reservation` happy path
- [ ] Local: staff cockpit login and agenda load (aware of temporary PIN limitations)
- [ ] Production smoke after each deploy (see `DEPLOYMENT_GUIDE.md` checklist)
- [ ] Notification tests in staging (email/SMS) before announcing to client

## Delivery

- [ ] Client walkthrough scheduled
- [ ] `README.md` and `docs/` accurate for handoff
- [ ] Training on support channel and severity definitions

## Monthly support

- [ ] Dependency / security patch review
- [ ] Uptime and error review (Vercel logs, Supabase, future monitoring)
- [ ] Invoice / retainer reconciliation
- [ ] Update **monthly maintenance log** (see `SUPPORT.md`)

## Upsell review

- [ ] Run `docs/UPSELL_PIPELINE.md` monthly script
- [ ] Log opportunities in CRM or client notes (not in git with PII)
