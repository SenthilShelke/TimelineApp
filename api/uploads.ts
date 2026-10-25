import * as FileSystem from "expo-file-system/legacy";
import { BASE_URL } from "./client";
import { getAccessToken } from "./tokenStore";

// Infer a MIME type from a local file URI extension.
function guessMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".heic")) return "image/heic";
  if (lower.endsWith(".heif")) return "image/heif";
  return "image/jpeg"; // default (expo-image-picker commonly yields jpeg)
}

// True if already a remote URL (already uploaded) vs a local file URI.
export function isRemoteUrl(uri: string): boolean {
  return /^https?:\/\//i.test(uri);
}

/**
 * Upload a single local image (file:// URI) to the backend using
 * expo-file-system's native multipart upload. This avoids RN's FormData
 * limitations (which reject the classic file-object shape under SDK 58).
 * Already-remote URLs are returned unchanged.
 */
export async function uploadImageIfLocal(uri: string): Promise<string> {
  if (isRemoteUrl(uri)) return uri;

  const mimeType = guessMimeType(uri);
  const token = await getAccessToken();

  const res = await FileSystem.uploadAsync(`${BASE_URL}/uploads`, uri, {
    httpMethod: "POST",
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: "file",
    mimeType,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (res.status < 200 || res.status >= 300) {
    let msg = `Image upload failed (${res.status})`;
    try {
      const data = JSON.parse(res.body);
      if (data?.error) msg = data.error;
    } catch {
      /* body wasn't JSON */
    }
    throw new Error(msg);
  }

  const data = JSON.parse(res.body);
  return data.url as string;
}

// Upload all local images in an array, preserving order; pass through remote URLs.
export async function uploadImages(uris: string[]): Promise<string[]> {
  return Promise.all((uris ?? []).map((u) => uploadImageIfLocal(u)));
}
