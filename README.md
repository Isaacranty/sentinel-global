# Sentinel Global

**Sentinel Global** is a cybersecurity learning and threat-intelligence platform built for the East African security community. It combines automated news feeds, curated learning paths, a community forum, and a containerized CTF system.

> Built by [Isaac Kirenga](https://github.com/Isaacranty), cybersecurity student at ISBAT, Uganda.

---

## Features

### 1. Academy & Tactical Labs
- **Interactive lessons** on OSINT, network recon and more, hosted on the platform.
- **Terminal labs**: web-based shells for practicing commands (for example Nmap) in the browser.
- **Quizzes**: pass a lesson quiz to earn XP.
- **Certificates**: a generated "Service Record" with a unique verification hash on course completion.

### 2. Tactical Operations (CTF)
- **Containerized sandboxes**: each challenge runs in an isolated Docker container with resource limits and no egress.
- **Hints**: multi-stage hints unlocked with earned XP.
- **Write-ups**: unlocked only after you solve the challenge.
- **Skill radar**: expertise across Web, Network, Forensics, Crypto and OSINT.

### 3. Intelligence Feed & Community
- **Signal ticker**: RSS aggregation from security sources (CISA, Krebs, BleepingComputer and others).
- **Discussions**: forum threads tied to news items or learning resources.
- **Verification**: admins can verify community intel and award XP.
- **Reactions**: Signal, Alert and Upvote.

### 4. Squads & Social
- **Squads**: create or join teams with invite codes.
- **Shared feed**: see your squad's recent activity.
- **Notifications**: replies, verified signals, earned certificates.
- **Leaderboard**: ranked by operator tier.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router), TypeScript |
| Database | Prisma with SQLite for local dev; Supabase Postgres for production |
| Auth | NextAuth.js (credentials, Google, GitHub) |
| Styling | Tailwind CSS |
| CTF orchestration | Dockerode, optional gVisor |
| Cache / rate limiting | Redis (ioredis) |
| Email | Nodemailer (SMTP) |
| Proxy / HTTPS | Caddy |

---

## Getting Started

### Prerequisites
- Node.js 18 or newer
- Docker (only needed for CTF challenges)
- Redis (optional locally)

### Run locally

```bash
git clone https://github.com/Isaacranty/sentinel-global.git
cd sentinel-global

npm install
cp .env.example .env        # then edit .env (see below)
npx prisma db push
npx prisma generate
npm run dev
```

Open http://localhost:3000.

### Environment variables

Copy `.env.example` to `.env` and fill in your own values. Never commit `.env`.

| Variable | Purpose |
|----------|---------|
| `NEXTAUTH_URL` | Base URL of the app |
| `NEXTAUTH_SECRET` | JWT secret. Generate with `openssl rand -base64 32` |
| `DATABASE_URL` / `DIRECT_URL` | Database connection strings |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google login |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Optional GitHub login |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase project (production) |
| `REDIS_URL` | Rate limiting cache |
| `CTF_USE_GVISOR` | `true` for production-grade sandbox isolation (Linux only) |
| `CTF_MAX_CONCURRENT_INSTANCES` | Max simultaneous challenge containers |
| `SMTP_*` | Email settings for verification and alerts |
| `SIGNAL_SOURCES` | Comma-separated RSS feeds |
| `DOMAIN` | Public domain used by Caddy for HTTPS |

---

## Useful Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build and start |
| `npm run ctf:build-images` | Build CTF challenge images |
| `npm run ctf:scheduler` | Run the challenge scheduler |
| `npm run ctf:reap` | Remove expired challenge containers |
| `npm run ctf:install-gvisor` | Install gVisor (Linux) |
| `npm run ctf:test-sandbox` | Test sandbox isolation |
| `npm run admin:promote` | Promote a user to admin |
| `npm run intel:brief` | Generate the daily intel brief |

## Docker

```bash
docker compose up --build
```

See `HOW_TO_GO_LIVE.md`, `HOW_TO_MIGRATE_TO_SUPABASE.md`, `HOW_TO_SETUP_OAUTH.md` and `HOW_TO_SHARE_AND_RUN.md` for deployment guides.

---

## Project Structure

```
app/          Pages and API routes (admin, community, courses, ctf, feed, squads...)
components/   Shared UI components
lib/          Helpers (auth, db, rate limiting, CTF orchestration)
prisma/       Database schema
challenges/   CTF challenge definitions
infra/        Infrastructure config
scripts/      CTF, admin and intel scripts
docs/         Documentation
```

---

## Security Notes

- CTF challenges run in isolated containers with no outbound network access. Use gVisor in production.
- Keep `.env` private. Only `.env.example` belongs in the repository.
- Rotate any secret that was ever committed by mistake.
- Challenges are for education. Only practice on systems you own or have permission to test.

## Roadmap

- East African focused learning paths and local CTF events
- More lab environments
- Public API for the intel feed

## Contributing

Issues and pull requests are welcome. Please open an issue first for major changes.

## License

Add a license of your choice (MIT is common) before making the repo public.
