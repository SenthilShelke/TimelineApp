import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BUCKET = process.env.SUPABASE_BUCKET ?? "event-images";

// Allowed image types (mirrors the bucket's MIME restrictions).
export const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
export const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export const isStorageConfigured = () => Boolean(SUPABASE_URL && SERVICE_KEY);

// Lazily create the client so the server still boots if storage isn't configured.
let client: ReturnType<typeof createClient> | null = null;
function getClient() {
  if (!client) {
    if (!isStorageConfigured()) {
      throw new Error("Supabase storage is not configured (missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)");
    }
    client = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false },
    });
  }
  return client;
}

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

/**
 * Upload image bytes to Supabase Storage, scoped under the owning user's id.
 * Returns the public URL to store in event_images.url.
 */
export async function uploadImage(
  userId: string,
  bytes: Buffer,
  contentType: string
): Promise<string> {
  const ext = EXT_BY_MIME[contentType] ?? "bin";
  const path = `${userId}/${randomUUID()}.${ext}`;

  const { error } = await getClient()
    .storage.from(BUCKET)
    .upload(path, bytes, { contentType, upsert: false });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data } = getClient().storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
