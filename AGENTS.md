# AGENTS.md — contributor instructions (LIORA / ARIA Autolavaggio)

Instructions for **human developers** and **AI coding agents** working on this repository.

## Before you write code

1. Read **`README.md`** first for context, route map, and data warnings.  
2. Read relevant files under **`docs/`**—especially `ARCHITECTURE.md`, `BACKEND_MAP.md`, `SECURITY_NOTES.md`, and `KNOWN_ISSUES.md`.  
3. Do **not** assume production behavior matches demos while mocks are active.

## Hard rules

- **Do not rewrite the application** for style or “cleanup” unless explicitly tasked. Prefer minimal diffs.  
- **Do not change UI** (components, layouts, styling, copy) unless the user or ticket explicitly requests UI work.  
- **Do not change routes** (URL paths) unless explicitly requested—preserve `/reservation`, `/aria/*`, and existing API paths.  
- **Do not mix clients**—this repo is **only** ARIA Autolavaggio per `CLIENT_ISOLATION_STANDARD.md`. No shared secrets with other LIORA clients.  
- **Do not expose secrets** in commits, logs, screenshots, or chat. Never paste `.env.local` contents.  
- **Do not commit** `.env`, `.env.local`, or generated keys. `.env.example` stays without real values.

## Engineering discipline

- **Small commits** with clear messages.  
- **Explain files changed** in PR description or handoff notes.  
- **Prioritize reliability** over design polish when tradeoffs arise—especially reservation and staff flows.  
- **Protect the reservation flow**—test `/reservation` after backend changes.  
- **Preserve ARIA routes** listed in `README.md`.

## Documentation duty

When you change architecture (new database, new env vars, new integrations, auth upgrades), **update docs in the same PR**:

- `README.md` (if behavior or env surface changes)  
- `docs/ARCHITECTURE.md` / `docs/BACKEND_MAP.md` / `docs/DEPLOYMENT_GUIDE.md` as appropriate  
- `docs/KNOWN_ISSUES.md` when fixing or acknowledging gaps  

## Security reminders

- Staff PINs and fallbacks called out in `SECURITY_NOTES.md` are **technical debt**, not patterns to extend.  
- Service role keys stay **server-only**.  
- Add rate limiting and persistence before claiming production-grade booking reliability.

## Questions?

Escalate to LIORA lead if scope touches auth, payments, or PII retention—legal and contractual constraints may apply.
