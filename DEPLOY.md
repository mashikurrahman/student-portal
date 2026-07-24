# Deployment Guide

The app is a Next.js 15 (App Router) server with Prisma + PostgreSQL and
Auth.js. It needs a running Postgres database and a few environment variables.

## Required environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string. On serverless (Vercel) use a **pooled** URL. |
| `NEXTAUTH_SECRET` | ✅ | Strong random value: `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | ✅ | The deployed base URL, e.g. `https://student-portal.onrender.com`. |
| `NODE_VERSION` | recommended | `22` (Next 15 needs Node ≥ 18.18). |
| `STORAGE_*`, `RESEND_API_KEY`, `EMAIL_FROM` | optional | Left empty until Phase 4 (real uploads/email). |

The build runs `prisma generate` automatically (see `build` + `postinstall`
scripts). Database schema is applied with `prisma migrate deploy` using the
committed migration in `prisma/migrations/`.

---

## Option A — Render (recommended, app + DB in one place)

A [`render.yaml`](./render.yaml) blueprint is included.

1. Push this repo to GitHub (done).
2. Render Dashboard → **New → Blueprint** → connect the repo.
3. Render provisions the web service **and** a free Postgres instance, and wires
   `DATABASE_URL` + generates `NEXTAUTH_SECRET` automatically.
4. First deploy runs `npx prisma migrate deploy` (creates all tables) then builds.
5. After it's live, set **`NEXTAUTH_URL`** to the service URL and redeploy.
6. (Optional) Seed demo data once: from the service **Shell**, run `npm run db:seed`.

Manual (non-blueprint) settings, if you prefer:
- Build command: `npm ci && npx prisma migrate deploy && npm run build`
- Start command: `npm start`
- Health check path: `/api/health`

---

## Option B — Vercel (+ Neon Postgres)

Vercel runs serverless functions, so use a **pooled** Postgres connection.

1. Create a database at [neon.tech](https://neon.tech). Copy two URLs:
   - **Pooled** connection string → `DATABASE_URL`
   - **Direct** connection string → used for migrations (see below)
2. Vercel → **Import** the GitHub repo (framework auto-detected as Next.js).
3. Add env vars: `DATABASE_URL` (pooled), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
   (your `https://<project>.vercel.app`), `NODE_VERSION=22`.
4. Deploy. The build runs `prisma generate` automatically.
5. **Apply migrations** (once, and after schema changes). Locally, pointing at the
   direct URL:
   ```bash
   DATABASE_URL="<neon-direct-url>" npx prisma migrate deploy
   ```
   > Migrations must use the **direct** (non-pooled) URL. The app runtime uses the
   > pooled URL. If you want Prisma to manage both automatically, add
   > `directUrl = env("DIRECT_URL")` to the `datasource` block in
   > `prisma/schema.prisma` and set `DIRECT_URL` in Vercel.
6. (Optional) Seed demo data: `DATABASE_URL="<neon-direct-url>" npm run db:seed`.

---

## Post-deploy smoke test

- Visit `/api/health` → should return `{ "success": true, ... }`.
- Sign in with a seeded account (password `Password123!`):
  `student@demo.local`, `agent@demo.local`, `admin@demo.local`, `super@demo.local`.

## Notes & current limitations

- **File uploads** use the stub storage adapter — documents are registered and the
  pipeline advances, but bytes aren't persisted to real object storage yet
  (Phase 4 wires S3/R2 + malware scanning).
- **Email** (verification, notifications) is not delivered yet; invited users get a
  one-time temporary password shown in the admin UI.
- Rotate `NEXTAUTH_SECRET` and any credentials before handling real user data.
