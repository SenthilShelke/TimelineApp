import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../auth/requireAuth.js";
import {
  uploadImage,
  isStorageConfigured,
  ALLOWED_MIME,
  MAX_BYTES,
} from "../storage/supabase.js";

export const uploadsRouter = Router();

// In-memory storage; we stream the buffer straight to Supabase.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
});

uploadsRouter.use(requireAuth);

/**
 * POST /uploads   (multipart/form-data, field name: "file")
 *   -> { url }  (public Supabase Storage URL)
 *
 * Validates the file's MIME type and size, then stores it under the
 * authenticated user's folder using the Supabase service key.
 */
uploadsRouter.post("/", upload.single("file"), async (req, res) => {
  if (!isStorageConfigured()) {
    return res.status(503).json({ error: "Image storage is not configured on the server" });
  }

  const file = req.file;
  if (!file || !file.buffer || file.size === 0) {
    return res.status(400).json({ error: "No file uploaded (expected form field 'file')" });
  }

  const contentType = (file.mimetype ?? "").split(";")[0].trim().toLowerCase();
  if (!ALLOWED_MIME.has(contentType)) {
    return res.status(415).json({
      error: `Unsupported image type "${contentType}". Allowed: ${[...ALLOWED_MIME].join(", ")}`,
    });
  }

  try {
    const url = await uploadImage(req.userId!, file.buffer, contentType);
    return res.status(201).json({ url });
  } catch (e: any) {
    console.error("Upload failed:", e?.message ?? e);
    return res.status(500).json({ error: "Failed to upload image" });
  }
});
