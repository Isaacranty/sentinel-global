// Rate limiter with two backends:
//
// - REDIS_URL set  -> Redis-backed, shared across every process/
//   instance. Use this the moment you run more than one Node
//   process (multiple dynos, serverless, several containers).
// - REDIS_URL unset -> falls back to the original in-memory fixed
//   window. Fine for a single local dev process, resets on restart,
//   and each process gets its own counters (see the old warning
//   below) — that's the tradeoff you're accepting by not setting
//   REDIS_URL.
//
// Either way the call signature is the same and async, so callers
// don't need to know which backend is active.

import type Redis from "ioredis";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Periodic cleanup so the in-memory Map doesn't grow forever — fine
// as a naive interval for MVP traffic on the fallback path.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 60_000).unref?.();

let redisClient: Redis | null | undefined; // undefined = not attempted yet

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;

  if (!process.env.REDIS_URL) {
    redisClient = null;
    return null;
  }

  try {
    const IORedis = require("ioredis");
    redisClient = new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: false,
    });
    redisClient!.on("error", (err: Error) => {
      console.error("[rateLimit] Redis error, falling back to allow-and-log:", err.message);
    });
  } catch (err) {
    console.error(
      "[rateLimit] REDIS_URL is set but the `ioredis` package isn't installed. " +
        "Run `npm install ioredis` or unset REDIS_URL to use the in-memory limiter."
    );
    redisClient = null;
  }

  return redisClient || null;
}

/**
 * Cleanly shuts down the Redis connection.
 */
export async function shutdownRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = undefined;
  }
}

// Register shutdown handlers
if (typeof process !== "undefined") {
  process.on("SIGTERM", () => shutdownRedis().catch(() => {}));
  process.on("SIGINT", () => shutdownRedis().catch(() => {}));
}

function memoryRateLimit(
  key: string,
  { max, windowMs }: { max: number; windowMs: number }
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: max - 1, resetAt };
  }

  if (existing.count >= max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: max - existing.count, resetAt: existing.resetAt };
}

async function redisRateLimit(
  client: Redis,
  key: string,
  { max, windowMs }: { max: number; windowMs: number }
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const redisKey = `ratelimit:${key}`;

  // INCR + (conditionally) PEXPIRE in a pipeline — atomic enough for
  // this purpose: the count is always correct, the only race is a
  // key that gets its TTL set slightly late, which just makes that
  // one window marginally longer, not shorter (never lets more
  // through than intended in a way that matters at this scale).
  const pipeline = client.multi();
  pipeline.incr(redisKey);
  pipeline.pttl(redisKey);
  const results = await pipeline.exec();

  const count = Number(results?.[0]?.[1] ?? 1);
  let ttl = Number(results?.[1]?.[1] ?? -1);

  if (ttl < 0) {
    await client.pexpire(redisKey, windowMs);
    ttl = windowMs;
  }

  const resetAt = Date.now() + ttl;

  if (count > max) {
    return { allowed: false, remaining: 0, resetAt };
  }
  return { allowed: true, remaining: max - count, resetAt };
}

export async function rateLimit(
  key: string,
  opts: { max: number; windowMs: number }
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const client = getRedis();
  if (!client) return memoryRateLimit(key, opts);

  try {
    return await redisRateLimit(client, key, opts);
  } catch (err) {
    // Redis hiccup shouldn't take down auth/registration/reporting —
    // fail open via the in-memory path for this call rather than
    // 500ing the request.
    console.error("[rateLimit] Redis call failed, falling back to in-memory for this request:", err);
    return memoryRateLimit(key, opts);
  }
}

// Best-effort client identifier from request headers. Not spoof-proof
// (X-Forwarded-For is trivially fakeable unless you're behind a
// trusted proxy that sets it correctly) — good enough to slow down
// casual abuse, not a substitute for a real WAF/CDN rate limit if
// this ever faces real attack traffic.
export function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
