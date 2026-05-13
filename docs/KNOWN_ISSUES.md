# Known issues — ARIA Autolavaggio

Acknowledged gaps as of documentation pass (LIORA). Track resolution in issues; update this file when status changes.

| Issue | Impact | Status |
|-------|--------|--------|
| **In-memory data persistence** | Public bookings via `public-bookings` mutate `lib/mock-data.ts`; data **does not survive** serverless cold starts or horizontal scale. | Open — Supabase planned |
| **Hardcoded PIN staff auth** | Trivially guessable credentials for anyone with repo or shoulder-surf access. | Open — see `SECURITY_NOTES.md` |
| **Missing production-grade staff auth** | No MFA, lockout, or central user directory. | Open |
| **Missing rate limits** | Public APIs may be abused for spam or cost. | Open |
| **Supabase not wired to reservation flow** | Target architecture (customer + reservation + alert + log) **not guaranteed** by current code. | Planned / partial |
| **Email/SMS notifications not fully connected** | SMS route is largely mock; Resend/Twilio env vars may be unused until implemented. | Open |
| **Support / monitoring stack** | No documented on-call integration (PagerDuty, etc.); rely on client reports + Vercel logs. | Open |
| **Cal.com API key transport** | If query-string pattern remains, elevated log leakage risk. | Open — see `SECURITY_NOTES.md` |

**Do not** close “Known issues” solely by editing docs—close them with code, infrastructure, or verified configuration changes.
