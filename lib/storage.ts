// Reusable Supabase Storage helpers. Uses the service-role admin client,
// so call these ONLY from server code (API routes, server actions) —
// never import this into a "use client" component.
import { getSupabaseAdmin } from "./supabaseAdmin";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "sentinel-uploads";

/**
 * Uploads a file buffer to Supabase Storage and returns its public URL.
 * `path` should be unique, e.g. `avatars/${userId}.png` or
 * `writeups/${writeUpId}/${filename}`.
 */
export async function uploadFile(
  path: string,
  file: Buffer | Blob,
  contentType?: string
) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType, upsert: true });

  if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Deletes one or more files from Storage by path. */
export async function deleteFiles(paths: string[]) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) throw new Error(`Supabase Storage delete failed: ${error.message}`);
}
