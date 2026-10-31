# Sharing Sentinel Global with someone else (to run locally)

This covers: they get the code, run it on their own machine, see it at
`http://localhost:4000`. That's different from "deploying" it so it's
reachable by other people over the internet — that's a separate step,
ask if you want to get there next.

## What you send them
Push the repo to GitHub (`.gitignore` already excludes `node_modules`,
`.env`, `.next`, and the old SQLite `.db` files — none of your secrets
or local build artifacts will be committed). They `git clone` it.

## What they need installed
- **Docker Desktop** (Mac/Windows) or Docker Engine (Linux) — this is
  the only real requirement. It runs Postgres, Redis, nginx, and your
  app all in one command, so they don't need Node.js, Postgres, or
  Redis installed separately.
- On Windows: Docker Desktop with the WSL2 backend (the default in
  recent versions) — the CTF sandbox feature needs a real Docker socket,
  which WSL2 provides properly; older Hyper-V-only setups can be flaky
  for this specific use.

## Steps for them, after cloning
1. Copy the env template and fill it in:
   ```
   cp .env.example .env
   ```
   At minimum they need `NEXTAUTH_SECRET` (generate with
   `openssl rand -base64 32`, or any long random string). Everything
   else (OAuth keys, SMTP, Supabase Storage keys) is optional — those
   features just won't work until filled in, nothing breaks.

2. Build and start everything:
   ```
   docker-compose up --build
   ```
   First run will take a few minutes (installing deps, building the
   Next.js app, pulling the Postgres/Redis/nginx images).

3. **First time only** — the Postgres container starts empty, so the
   tables need to be created:
   ```
   docker-compose exec sentinel-app npx prisma migrate deploy
   ```

4. Open `http://localhost:4000`.

## To stop / restart later
```
docker-compose down        # stop everything (data persists in the postgres_data volume)
docker-compose up          # start again, no --build needed unless code changed
```

## Heads up on what "sharing" means here
This runs the app **on their machine only** — nobody else can reach
`http://localhost:4000` except them, sitting at that computer. If the
goal is "other people on the internet can use this," that's actual
deployment (a VPS or a Docker-friendly host), which is a different,
bigger conversation — the `docker.sock` mount for CTF sandboxing in
particular means most simple one-click hosts (Vercel, Netlify) won't
work, you'd need something that gives you a real host machine.
