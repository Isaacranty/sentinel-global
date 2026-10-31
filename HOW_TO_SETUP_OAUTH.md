# Setting up Google & GitHub Login

Buttons only appear on `/login` and `/register` when their env vars are
set — leave either pair blank to keep that provider hidden, no code
changes needed either way.

## Google
1. https://console.cloud.google.com/apis/credentials → **Create Credentials
   > OAuth client ID** → Application type: **Web application**.
2. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   (swap the host for your real domain in production).
3. Copy the **Client ID** and **Client Secret** into `.env`:
   ```
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   ```
4. First time, you'll likely need to configure the **OAuth consent screen**
   (just app name + your email is enough for testing/internal use).

## GitHub
1. https://github.com/settings/developers → **New OAuth App**.
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy the **Client ID**, generate a **Client Secret**, into `.env`:
   ```
   GITHUB_CLIENT_ID="..."
   GITHUB_CLIENT_SECRET="..."
   ```

## How account linking works here
There's no separate `Account` table (no Prisma adapter) — OAuth sign-ins
are matched to your existing `User` table by **email address**:
- New email → a `User` row is created automatically, `emailVerified` is
  set immediately (Google/GitHub already verified it), `passwordHash`
  stays `null` (OAuth-only account, can't log in with a password).
- Existing email (e.g. they registered with email/password first, now
  click "Continue with Google" using the same address) → it logs into
  the *same* account. This is convenient, but means anyone who controls
  that email address, either way, can access the account. That's normal
  for this pattern, just worth knowing.
- Banned users are blocked at OAuth sign-in the same way as credentials
  login — they land back on `/login` with a suspension message instead
  of an account being silently created/logged in.

Restart `npm run dev` after editing `.env` — Next.js only reads it on
startup.
