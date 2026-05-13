# Deployment guide — ARIA Autolavaggio (Vercel)

**Production URL:** [https://aria-autolavaggio.vercel.app](https://aria-autolavaggio.vercel.app)

## Vercel setup

1. Create or select a Vercel **Team** for LIORA.
2. **Import** the Git repository `aria-autolavaggio` (GitHub/GitLab/Bitbucket).
3. Framework preset: **Next.js** (auto-detected).
4. **Root directory:** repository root (default).
5. **Build & Output:** defaults from Next.js unless customized later.

## Environment variables

Add every key from **`.env.example`** that the running app needs:

- Production: **Production** environment in Vercel.
- Pull requests: **Preview** environment (may use separate Supabase or read-only keys—policy decision).

After changes, trigger a **redeploy** so serverless bundles pick up new values.

## Build command

Default Vercel Next.js build:

```bash
npm run build
```

(Vercel runs this automatically.)

## Install command

```bash
npm install
```

(Vercel runs this before build.)

## Production URL

- Default Vercel hostname: `https://aria-autolavaggio.vercel.app`
- Custom domain: configure in Vercel → Domains → follow DNS instructions at registrar (document registrar in `docs/ACCESS_MAP.md`).

## Preview vs production

| | Production | Preview |
|---|------------|---------|
| Branch | typically `main` | PR branches |
| Env vars | Production set | Preview set (may mirror with test keys) |
| Data | Real Supabase when connected | **Strongly recommend** isolated staging project |

Never point Preview at production database without understanding wipe/PII risk.

## Rollback process

1. Vercel → **Deployments** → select last known-good deployment → **Promote to Production** (instant rollback to prior artifact).
2. If rollback due to **bad secrets**, fix env vars first, then redeploy current `main` or promote as appropriate.
3. If database migrations were applied, coordinate **forward fix** or restore from Supabase backup (when enabled)—not automatic on Vercel rollback alone.

## Deployment verification checklist

- [ ] Deployment status **Ready** in Vercel  
- [ ] `/` loads without 500  
- [ ] `/reservation` loads; test submission returns success JSON (or expected validation errors)  
- [ ] `/aria/login` loads; staff path redirects when logged out  
- [ ] After login, `/aria/agenda` loads data (mock or Cal-backed)  
- [ ] No secrets visible in client bundle (search network responses for stray keys)  
- [ ] Check Vercel **Function logs** for unexpected errors post-deploy  

For disaster recovery from scratch see `docs/RECOVERY_RUNBOOK.md`.
