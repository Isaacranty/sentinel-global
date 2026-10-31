# Migrating Sentinel Global to Supabase

Three pieces: **Database** (done in code, needs your action to run),
**Storage** (client ready, needs a bucket + a feature to wire it into),
**Auth** (deliberately NOT started yet — see bottom).

## 1. Create the Supabase project
1. Go to https://supabase.com/dashboard and create a new project.
2. Save the database password you set — you'll need it below.

## 2. Get your connection strings
Settings > Database > Connection string:
- Copy the **Transaction pooler** string (port 6543) → this is `DATABASE_URL`
- Copy the **Session pooler** or direct string (port 5432) → this is `DIRECT_URL`

Settings > API:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret — server only)

Fill all of these into your real `.env` (see `.env.example` for the shape).

## 3. Install dependencies and generate the client
```
npm install
```
(This pulls in `@supabase/supabase-js`, `@supabase/ssr`, and regenerates
the Prisma client for Postgres via the `postinstall` hook.)

## 4. Push the schema to Supabase
**First, delete the old SQLite migration history** — it's still stamped
`provider = "sqlite"` in `prisma/migrations/migration_lock.toml`, which
will hard-error against a `postgresql` datasource no matter which
Postgres you point at (Supabase or the local Docker one):
```
rm -rf prisma/migrations
```
(Windows: delete the `prisma/migrations` folder in Explorer, or
`rmdir /s /q prisma\migrations` in Command Prompt.)

Then, since this is a fresh Postgres database (not a SQLite → Postgres
data migration), generate a brand new baseline:
```
npx prisma migrate dev --name init_supabase
```
This creates every table (User, Thread, Reply, Report, Team, etc.) on
your Supabase project. Check the Supabase dashboard's Table Editor
afterward to confirm they appeared.

## 5. (Optional) Bring over existing local data
If you have real data in the old `prisma/dev.db` SQLite file you want
to keep, that needs a data export/import pass (not just a schema
migration) — ask and we'll script it. If this is a fresh start, skip
this step.

## 6. Storage — create a bucket
Supabase dashboard > Storage > New bucket, name it to match
`SUPABASE_STORAGE_BUCKET` in your `.env` (default: `sentinel-uploads`).
Make it **public** — avatars, write-up attachments, and report evidence
are all served back via public URLs (`getPublicUrl`), not signed URLs.

Already wired and live:
- **Profile avatars** — `components/AvatarUpload.tsx` on `/profile`,
  uploads via `POST /api/profile/avatar`, stored at `avatars/{userId}.{ext}`,
  saved to `User.avatarUrl`, shown in the header (`AuthStatus.tsx`) and
  on the profile page.
- **Write-up attachments** — `components/WriteUpForm.tsx` now sends
  `FormData` with an optional `attachment` file to
  `POST /api/ctf/writeups/submit`, stored at
  `writeups/{userId}/{timestamp}.{ext}`, saved to `WriteUp.attachmentUrl`,
  shown as a "View Attachment" link in the admin dashboard.
- **Report evidence** — `components/ReportButton.tsx` now sends
  `FormData` with an optional `evidence` file to the thread/reply report
  routes, stored at `reports/{userId}/{timestamp}.{ext}`, saved to
  `Report.evidenceUrl`, shown as a "View Evidence" link in the admin
  dashboard.

All three re-use `uploadFile()` from `lib/storage.ts`. Limits: avatars
5MB (image types only), attachments/evidence 10MB (images, PDF, or
plain text).

## 7. Verify
```
npm run dev
```
Register a new account, post a thread, start a CTF instance — confirm
rows show up in Supabase's Table Editor instead of the old SQLite file.

## 8. Auth (not done yet, on purpose)
Your current login system (NextAuth email/password, `lib/auth.ts`) will
keep working unchanged against the new Supabase Postgres database —
Supabase Auth and Supabase-as-Postgres are independent features.

Swapping to Supabase Auth means replacing session handling in:
`lib/auth.ts`, `types/next-auth.d.ts`, `app/providers.tsx`,
`components/AuthStatus.tsx`, the register/login pages, and every API
route that currently calls `getServerSession()` (admin routes, thread
routes, CTF instance routes, and more). That's a focused follow-up —
flag when you're ready and we'll go through it file by file so nothing
silently breaks.
