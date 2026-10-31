// A small, dependency-free persistent process that calls
// reapExpired() on a timer, so expired CTF containers actually get
// torn down without you having to remember to run
// `npm run ctf:reap` by hand or wire up cron/systemd yourself.
//
// Run it as a long-lived process however you already run background
// workers — pm2, systemd, a Docker sidecar container, `screen`/
// `tmux` for a quick local test, etc:
//
//   npm run ctf:scheduler
//
// It runs one pass immediately on start, then every INTERVAL_MS.
// Ctrl+C (SIGINT) or SIGTERM stop it cleanly.

import { reapExpired } from "../lib/orchestrator";

const INTERVAL_MS = Number(process.env.CTF_REAP_INTERVAL_MS ?? 60_000);

let running = false;
let stopped = false;

async function tick() {
  if (running) return; // don't overlap if a pass is still in flight
  running = true;
  try {
    const count = await reapExpired();
    if (count > 0) {
      console.log(`[scheduler] reaped ${count} expired instance(s)`);
    }
  } catch (err) {
    console.error("[scheduler] reap pass failed:", err);
  } finally {
    running = false;
  }
}

console.log(`[scheduler] starting — reaping expired CTF instances every ${INTERVAL_MS}ms`);
tick();
const handle = setInterval(tick, INTERVAL_MS);

function shutdown(signal: string) {
  if (stopped) return;
  stopped = true;
  console.log(`[scheduler] received ${signal}, shutting down`);
  clearInterval(handle);
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
