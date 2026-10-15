// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger';

/**
 * True when all three required Cloudinary env vars are present at startup.
 * When false, upload.service.ts falls back to local filesystem storage.
 */
export const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  logger.info('[Cloudinary] Configured — cloud storage active');
} else {
  logger.warn(
    '[Cloudinary] CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET not set — ' +
    'falling back to local filesystem storage (backend/uploads/)'
  );
}

export default cloudinary;
