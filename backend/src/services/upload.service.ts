// src/services/upload.service.ts
import cloudinary, { isCloudinaryConfigured } from '../lib/cloudinary';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Root folder on Cloudinary. Every upload lands under alumniconnect/<folder>/ */
const CLOUD_ROOT = 'alumniconnect';

/**
 * Canonical subfolder names.
 * Use these constants in callers so the folder paths stay consistent.
 *
 *   FOLDERS.avatars     → profile photos   (image)
 *   FOLDERS.resumes     → PDF resumes      (raw)
 *   FOLDERS.events      → event banners    (image)
 *   FOLDERS.attachments → chat files       (auto)
 */
export const FOLDERS = {
  avatars:     'avatars',
  resumes:     'resumes',
  events:      'events',
  attachments: 'attachments',
} as const;

/**
 * Absolute path to local fallback storage root.
 * Express static middleware serves: GET /uploads/<folder>/<filename>
 */
export const LOCAL_UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UploadResult {
  /** Public CDN URL (Cloudinary secure_url or backend /uploads URL) */
  url: string;
  /**
   * Opaque identifier needed for deletion.
   * - Cloudinary: e.g. "alumniconnect/avatars/abc123"
   * - Local:      e.g. "local/avatars/1234567890_123456789.jpg"
   */
  publicId: string;
}

// ---------------------------------------------------------------------------
// Core upload function
// ---------------------------------------------------------------------------

/**
 * Upload a Buffer to Cloudinary (or local filesystem as fallback).
 *
 * @param buffer        - Raw file buffer from multer memoryStorage
 * @param folder        - Destination subfolder. Use `FOLDERS` constants.
 * @param resourceType  - Cloudinary resource_type: 'image' | 'raw' | 'auto'
 *                        • 'image' for JPEG/PNG/WebP
 *                        • 'raw'   for PDF/binary documents
 *                        • 'auto'  lets Cloudinary detect (default)
 * @param originalname  - Original filename (used only for local file extension)
 */
export async function uploadBuffer(
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' | 'auto' = 'auto',
  originalname = 'file'
): Promise<UploadResult> {
  // ── Cloudinary path ──────────────────────────────────────────────────────
  if (isCloudinaryConfigured) {
    logger.debug(`[UploadService] Uploading to Cloudinary → ${CLOUD_ROOT}/${folder}`);

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder:        `${CLOUD_ROOT}/${folder}`,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error || !result) {
            logger.error(`[UploadService] Cloudinary upload failed: ${error?.message ?? 'no result'}`);
            return reject(error ?? new Error('Cloudinary upload returned no result'));
          }
          logger.info(`[UploadService] Cloudinary upload OK — public_id=${result.public_id}`);
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(stream);
    });
  }

  // ── Local filesystem fallback ────────────────────────────────────────────
  logger.debug(`[UploadService] Cloudinary not configured — writing locally to uploads/${folder}/`);

  const folderDir = path.join(LOCAL_UPLOADS_DIR, folder);
  if (!fs.existsSync(folderDir)) {
    fs.mkdirSync(folderDir, { recursive: true });
  }

  const ext      = path.extname(originalname) || '';
  const filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
  const filePath = path.join(folderDir, filename);

  await fs.promises.writeFile(filePath, buffer);

  const backendUrl = process.env.BACKEND_URL ?? `http://localhost:${process.env.PORT ?? 5002}`;
  const publicId   = `local/${folder}/${filename}`;
  const url        = `${backendUrl}/uploads/${folder}/${filename}`;

  logger.info(`[UploadService] Local upload OK — path=${filePath}`);
  return { url, publicId };
}

// ---------------------------------------------------------------------------
// Convenience wrapper — accepts Express.Multer.File directly
// ---------------------------------------------------------------------------

/**
 * Upload an Express Multer file object.
 * Preferred over `uploadBuffer` when you already have `req.file`.
 */
export async function uploadFile(
  file: Express.Multer.File,
  folder: string,
  resourceType: 'image' | 'raw' | 'auto' = 'auto'
): Promise<UploadResult> {
  return uploadBuffer(file.buffer, folder, resourceType, file.originalname);
}

// ---------------------------------------------------------------------------
// Deletion
// ---------------------------------------------------------------------------

/**
 * Delete a previously uploaded file by its publicId.
 *
 * Local files use publicId format:  "local/<folder>/<filename>"
 * Cloudinary files use format:      "alumniconnect/<folder>/<cloudinary_id>"
 *
 * Safe to call with a non-existent publicId (logs a warning, does not throw).
 */
export async function deleteFile(publicId: string): Promise<void> {
  // Local file
  if (!isCloudinaryConfigured || publicId.startsWith('local/')) {
    if (publicId.startsWith('local/')) {
      const relativePath = publicId.slice('local/'.length); // "<folder>/<filename>"
      const filePath     = path.join(LOCAL_UPLOADS_DIR, relativePath);
      try {
        await fs.promises.unlink(filePath);
        logger.info(`[UploadService] Deleted local file: ${filePath}`);
      } catch {
        logger.warn(`[UploadService] Could not delete local file (may not exist): ${filePath}`);
      }
    }
    return;
  }

  // Cloudinary file
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`[UploadService] Deleted Cloudinary file: ${publicId}`);
  } catch (err) {
    logger.warn(
      `[UploadService] Failed to delete Cloudinary file "${publicId}": ` +
      `${err instanceof Error ? err.message : String(err)}`
    );
  }
}
