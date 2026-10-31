# CTF Challenge Sandboxing — Design

This module is different from everything else in the platform: it
runs untrusted user interaction against real infrastructure. Get the
isolation wrong and a "learning platform" becomes an attack surface
against your own server, your other users, or the wider internet.
This doc is the plan to build against — write the orchestrator only
after this shape is agreed on.

## Threat model (what we're defending against)

1. **Container breakout** — a challenge solver escapes their sandbox
   and reaches the host or other challenge instances.
2. **Lateral movement** — one user's challenge instance is used to
   attack another user's instance, or the platform's own database.
3. **Egress abuse** — a challenge container is used as a proxy to
   attack third parties (e.g., SSRF out to the open internet, spam,
   scanning).
4. **Resource exhaustion** — someone spins up unlimited instances or
   fork-bombs a container to DoS the host.
5. **Flag leakage** — flags are guessable, shared between users, or
   extractable from container images/logs instead of the actual bug.

## Isolation strategy

**Each challenge instance is its own container, one per user session,
never shared.**

- Base isolation: Docker with a **non-default runtime** —
  [gVisor](https://gvisor.dev/) (`runsc`) or Firecracker microVMs if
  you can run them, instead of the default `runc`. Default `runc`
  shares the host kernel; a container escape there is a host escape.
  gVisor intercepts syscalls and gives you a second layer even if a
  container-level bug exists.
- No privileged containers, ever. `--cap-drop=ALL`, add back only
  what a specific challenge genuinely needs.
- Read-only root filesystem on the challenge container
  (`--read-only`), with a small `tmpfs` mount for anything that needs
  to write (`--tmpfs /tmp:size=64m`).
- Resource limits on every instance: CPU (`--cpus=0.5`), memory
  (`--memory=256m`), PIDs (`--pids-limit=64` — stops fork bombs),
  and disk via the tmpfs size cap above.
- **Network**: each instance gets its own Docker network with
  **no egress to the internet and no route to other challenge
  networks or the platform's own database/API containers.** The only
  path in is the reverse proxy routing the user's browser to their
  specific instance's exposed port. If a challenge genuinely needs
  outbound access (rare), allowlist specific destinations at the
  firewall, not "internet access."
- **Time-boxed**: every instance has a hard lifetime (e.g., 30–60
  min), enforced by the orchestrator killing the container on a
  timer — not something the challenge or user can extend by talking
  to the container itself.

## Flag handling

- Flags are generated **per-instance**, not baked into the challenge
  image. Format: `SENTINEL{<random-uuid-or-token>}`.
- The flag is injected into the container at instance-start time (env
  var or generated file), and the **checker never trusts the
  container to self-report success** — the orchestrator independently
  records which flag it issued to which user/instance, and validates
  submissions against that record server-side, not against a shared
  static flag list.
- Container images and their build layers must not contain any
  other user's flag or any staging/debug flag — treat images as
  public even if you don't intend to publish them.

## Orchestration flow

1. User clicks "Start challenge" on a challenge page.
2. API creates a DB row: `{ userId, challengeId, flag, startedAt,
   expiresAt, status: "starting" }`.
3. Orchestrator launches the container from the challenge's image,
   on an isolated network, with the flag injected, applying the
   resource/isolation flags above. Records the container ID and the
   instance's routed URL/port back on the DB row.
4. Reverse proxy: **implemented as an in-app route, not a separate
   proxy process.** Challenge containers publish no host port at
   all — they sit on their `Internal: true` network, reachable only
   by IP from the host itself (Docker still routes host→bridge even
   on an internal network; only container→outside is blocked). The
   Next.js server (`app/api/ctf/instance/[id]/proxy/[[...path]]`)
   fetches from that internal IP and streams the response back, so
   the browser only ever talks to the app's own origin. This means:
   nothing to expose in a firewall, one fewer moving part (no
   Traefik/nginx needed), and per-instance isolation is enforced by
   the network itself rather than by proxy routing logic.
   **Known limitation**: this is a path-prefix proxy, so a challenge
   whose HTML uses root-absolute links (`href="/style.css"`) will
   break — the browser requests those from the app's own origin, not
   the proxied instance. Fine for single-page, form-only challenges
   like `example-sqli`. A challenge with multiple pages or static
   assets needs either link-rewriting in the proxy or a real
   subdomain-per-instance setup (wildcard DNS + Traefik) instead.
5. Background job checks `expiresAt` every minute; force-stops and
   removes any expired container, frees the port/network, marks the
   DB row `expired`.
6. Flag submission hits its own API route, checks against the DB
   row for that user's active instance — not against the container.

## What NOT to do

- Don't run challenge containers on the same Docker host as your
  main app/database containers without network segmentation — a
  compromised challenge instance should never be able to route to
  your Postgres.
- Don't reuse one long-lived container across multiple users to save
  resources — that's how one user's foothold becomes everyone's.
- Don't let the challenge container validate its own "solved" state
  and report it back — that's trivially spoofable from inside the
  sandbox.
- Don't skip the resource limits "for now" — a single fork bomb or
  crypto-miner in an unconstrained container takes down shared infra.

## Build order for this module

1. Get **one** challenge running by hand with the full isolation
   stack (gVisor/Firecracker, network isolation, resource limits,
   per-instance flag) before writing any orchestration code — prove
   the sandbox is real first.
2. Build the orchestrator for that one challenge (start/stop/expire/
   flag-check API).
3. Generalize to a `challenge.yml` format so new challenges are
   "drop a folder in, not write new orchestrator code."
4. Add the UI (challenge list, start button, embedded terminal or
   iframe to the instance, countdown timer, flag submission form).

`challenges/example-sqli/` in this project is a minimal example
challenge shaped for that flow — a deliberately vulnerable practice
app (login bypass via SQL injection) to build the orchestrator
against, not a production challenge to publish yet.
