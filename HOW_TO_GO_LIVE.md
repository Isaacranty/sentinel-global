# Making Sentinel Global Live (Publicly Reachable)

This is different from `HOW_TO_SHARE_AND_RUN.md`, which just gets it
running on someone's own machine. This gets it reachable by anyone,
anywhere, at a real URL.

## Why not Vercel/Netlify/Railway-style hosts?
The CTF sandbox orchestrator (`lib/orchestrator.ts` via `dockerode`)
needs direct access to a real Docker daemon on the host machine to spin
up per-user challenge containers (`/var/run/docker.sock` in
`docker-compose.yml`). Simple one-click app hosts run *your* container
for you but don't hand you the host's own Docker socket — for good
security reasons, since that socket effectively grants root on the
host. You need a machine you actually control: a VPS.

## 1. Get a VPS
Any provider works (DigitalOcean, Hetzner, Linode/Akamai, AWS Lightsail).
For this app's footprint, a 2 vCPU / 4GB RAM box is a reasonable
starting point — CTF containers add up under load, so watch memory as
usage grows. Pick Ubuntu 22.04 or 24.04 as the OS.

Since the docker.sock mount effectively gives the app container
root-equivalent control over the host, use a **dedicated** VPS for
this — don't share it with unrelated sensitive services.

## 2. Point a domain at it
Buy a domain anywhere (Namecheap, Cloudflare, Google Domains, etc.).
In its DNS settings, add an **A record**: `@` (or a subdomain like
`app`) → your VPS's public IP address. Give DNS a few minutes to
propagate before step 6.

## 3. Install Docker on the VPS
SSH into the server, then:
```
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# log out and back in for the group change to apply
```
Confirm: `docker --version` and `docker compose version`.

## 4. Open the firewall
```
sudo ufw allow 22/tcp    # SSH — don't lock yourself out
sudo ufw allow 80/tcp    # HTTP (Caddy needs this for the cert challenge)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```
Note port 4000 is deliberately NOT opened — that's `sentinel-app`'s
direct port, only reachable from inside the server/Docker network.
Public traffic should only ever reach Caddy on 80/443.

## 5. Clone the repo and configure `.env`
```
git clone <your-repo-url>
cd secplatform
cp .env.example .env
```
Edit `.env` — at minimum:
- `NEXTAUTH_URL="https://yourdomain.com"` (real domain, https, no trailing slash)
- `DOMAIN="yourdomain.com"` (no https://, just the bare domain — Caddy needs this exact format)
- `NEXTAUTH_SECRET` — a real secret, not the placeholder
- If using Google/GitHub OAuth: update each provider's **redirect/callback
  URL** in their dashboard to `https://yourdomain.com/api/auth/callback/google`
  (and `/github`) — the localhost ones won't work anymore

Also **delete the stale SQLite migration folder** if you haven't yet
(see `HOW_TO_MIGRATE_TO_SUPABASE.md` — this blocks everything, same as before):
```
rm -rf prisma/migrations
```

## 6. Build and start
```
docker compose up -d --build
```
Caddy will automatically request and install a Let's Encrypt
certificate for `DOMAIN` the first time it starts — this needs port 80
reachable from the internet (step 4) and DNS already pointed at this
server (step 2), or it'll fail to verify ownership.

## 7. Create the database tables (first time only)
```
docker compose exec sentinel-app npx prisma migrate deploy
```

## 8. Verify
Visit `https://yourdomain.com` — you should see a valid padlock (Caddy
handled the cert automatically) and the app running.

Check logs if anything looks wrong:
```
docker compose logs sentinel-proxy   # Caddy / cert issues
docker compose logs sentinel-app     # app errors
```

## Keeping it running
- `docker compose logs -f sentinel-app` — tail logs
- `docker compose down` / `docker compose up -d` — stop/start (data persists)
- To deploy a code update: `git pull` then `docker compose up -d --build`
- Consider setting up automated backups of the `postgres_data` volume
  (a cron job running `docker compose exec sentinel-db pg_dump ...` to
  a file, copied off the server periodically) — nothing does this for
  you currently.

## Security notes worth knowing, not necessarily blockers
- The `docker.sock` mount is powerful — it's how the CTF feature works,
  but it does mean a bug in the orchestrator code is a bigger deal here
  than on a normal web app. Keep that code path reviewed carefully.
- Rotate `SUPABASE_SERVICE_ROLE_KEY` and `NEXTAUTH_SECRET` if this repo
  or `.env` is ever exposed publicly by accident.
