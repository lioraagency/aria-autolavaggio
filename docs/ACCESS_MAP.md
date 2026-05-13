# Access map — ARIA Autolavaggio (template)

**Purpose:** Single place to see **which systems exist** and **where credentials are stored**.  
**Do not** paste passwords, API keys, tokens, recovery codes, or private client PII into this file.

| System | URL / identifier | Where secrets live | Who has access | Notes |
|--------|------------------|--------------------|----------------|--------|
| Git repository | *(e.g. github.com/org/aria-autolavaggio)* | SSH keys / GitHub PAT in developer keychains | LIORA: *names* · Client: *as contract* | Branch protection on `main` |
| Vercel | Project linked to this repo | Vercel → Project → Settings → Environment Variables | LIORA: *roles* | Production + Preview envs |
| Supabase | Project: `aria-autolavaggio-production` | Supabase dashboard + duplicated in password manager | LIORA: *roles* | Service role **never** in client JS |
| Domain / DNS | *(registrar name)* | Registrar account in password manager | LIORA / Client per agreement | Points to Vercel |
| Cal.com (or booking) | *(team / event URL)* | Cal.com → API keys in password manager | LIORA + owner delegate | Staff agenda integration |
| Email (Resend or other) | *(domain verified in provider)* | Provider API key in Vercel env + vault | LIORA | Transactional only first |
| SMS (Twilio) | *(subaccount SID label only)* | Twilio console + Vercel env + vault | LIORA | Subaccount per client preferred |
| Password manager | *(vault name)* | N/A | LIORA core team | Source of truth for humans |
| Client admin accounts | *(roles: owner, staff)* | Client-managed passwords | Client | LIORA does not store client personal passwords unless contracted |

## Rotation triggers

- Staff offboarding  
- Suspected leak or lost device  
- Vendor breach notice  
- Quarterly optional rotation for high-risk keys  

After rotation, update Vercel/Supabase envs and confirm deploy per `docs/RECOVERY_RUNBOOK.md`.
