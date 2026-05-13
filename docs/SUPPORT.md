# Support — ARIA Autolavaggio (LIORA)

## Support request template

Copy into your ticket tool (Linear, email, etc.). Remove sections that do not apply.

```
Title: [ARIA] <short description>
Severity: S1 / S2 / S3 / S4 (see below)
Reporter: <name, role>
Time (timezone): <ISO or local with TZ>
Environment: Production / Preview / Local
URL / route: e.g. https://aria-autolavaggio.vercel.app/reservation
Steps to reproduce:
1.
2.
Expected:
Actual:
Screenshots: (avoid PII in attachments)
Customer impact: (none / some / all users)
```

## Incident log template

```
Incident ID: ARIA-YYYY-MM-DD-##
Started: 
Detected: 
Resolved: 
Severity: 
Summary: 
Root cause (5 Whys / short): 
Customer communication: (what we told the client)
Remediation: 
Follow-ups: (issues filed, docs updated)
Owner: 
```

## Severity levels

| Level | Definition | Response expectation (indicative) |
|-------|------------|----------------------------------|
| **S1** | Production down or data loss/exposure suspected | Immediate page; work until mitigated |
| **S2** | Major feature broken (e.g. cannot complete reservation) | Same business day |
| **S3** | Degraded UX, workaround exists | Within agreed SLA (e.g. 2 business days) |
| **S4** | Cosmetic, copy, nice-to-have | Backlog prioritization |

Confirm exact SLAs in the client contract.

## Response expectations

- Acknowledge receipt within **contracted window** (default: 4 business hours for S2+).
- For S1, use phone or agreed escalation channel if email is slow.
- Post-incident: update `docs/KNOWN_ISSUES.md` if user-visible behavior changes.

## Monthly maintenance log

| Month | Performed by | npm audit / patches | Env review | Uptime notes | Upsell notes |
|-------|--------------|---------------------|------------|--------------|--------------|
| YYYY-MM | | | | | |

## Client communication log

Use for significant non-incident touchpoints (training, scope changes, renewals). Do not store secrets.

| Date | Channel | Topic | Outcome | Owner |
|------|---------|-------|---------|-------|
| | | | | |
