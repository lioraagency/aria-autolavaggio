# Supabase Setup — ARIA Autolavaggio

## 1. Create Supabase project

Go to https://supabase.com → New project.
- Region: Canada (East) — `ca-central-1`
- Name: `aria-autolavaggio`

## 2. Run migrations

In Supabase dashboard → SQL Editor, run both files in order:

1. `supabase/migrations/20260513120000_sprint1_core_tables.sql`
2. `supabase/migrations/20260513180000_add_status_timestamps.sql`

Copy-paste each file contents into the editor and click **Run**.

## 3. Get your credentials

In your Supabase project → **Settings → API**:

| Env var | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | "Project URL" — looks like `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | "Project API keys" → `anon` / `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | "Project API keys" → `service_role` (keep secret) |

## 4. Set env vars on Vercel

Vercel dashboard → your project → **Settings → Environment Variables**.

Add all three variables above. Select **Production**, **Preview**, and **Development** scopes.

After adding: **Deployments → Redeploy** the latest production deployment.

## 5. Set locally (dev)

Create or update `.env.local` at the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 6. Other required env vars

| Var | Purpose | Default if missing |
|---|---|---|
| `AUTH_SECRET` | iron-session encryption key (≥32 chars) | Insecure fallback — **must set in prod** |
| `ARIA_OWNER_PIN` | Owner login PIN | `1999` |
| `ARIA_DEMO_PIN` | Demo login PIN | `2000` |
| `NEXT_PUBLIC_APP_URL` | Canonical URL for og/twitter metadata | `https://aria-autolavaggio-lioraagencys-projects.vercel.app` |

## 7. Row Level Security (RLS)

The service role key bypasses RLS. For the public reservation API this is intentional.
If you later add customer-facing reads, enable RLS on `reservations` and `customers`:

```sql
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers    ENABLE ROW LEVEL SECURITY;
-- Add policies as needed
```
