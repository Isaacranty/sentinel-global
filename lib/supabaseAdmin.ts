// Server-only Supabase client using the service role key.
// This BYPASSES Row Level Security — never import this file from a
// client component, and never send SUPABASE_SERVICE_ROLE_KEY to the browser.
// Use this for: server-side Storage uploads, admin-level DB operations,
// and (if you move to Supabase Auth) server-side user management.
import { createClient } from "@supabase/supabase-js";

let cached: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env"
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
