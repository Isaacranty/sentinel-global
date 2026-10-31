// Run this on a schedule (cron, systemd timer, etc.) — every minute
// is reasonable. Nothing in the Next.js app calls this on its own:
// API routes only run when a request comes in, so an expired
// container needs something external to actually kill it even if no
// one is polling its status.
//
// Usage: npx tsx scripts/reap-expired.ts
// (or compile with tsc and run with node)

import { reapExpired } from "../lib/orchestrator";

reapExpired()
  .then((count) => {
    console.log(`[reap-expired] stopped ${count} expired instance(s)`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("[reap-expired] failed:", err);
    process.exit(1);
  });
