// src/middleware/upload.ts
import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/error';
import { responseError } from '../utils/response';
import { logger } from '../utils/logger';

// ---------------------------------------------------------------------------
// Allowed MIME type sets
// ---------------------------------------------------------------------------
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const PDF_MIME_TYPES   = ['application/pdf'] as const;
const ATTACHMENT_MIME_TYPES = [...IMAGE_MIME_TYPES, ...PDF_MIME_TYPES] as const;

type AllowedMime = (typeof ATTACHMENT_MIME_TYPES)[number];

// ---------------------------------------------------------------------------
// fileFilter factory — rejects unknown types with a descriptive ApiError
// ---------------------------------------------------------------------------
function makeFileFilter(allowed: readonly string[], label: string) {
  return (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if ((allowed as string[]).includes(file.mimetype)) {
      cb(null, true);
    } else {
      logger.warn(
        `[UploadMiddleware] Rejected file "${file.originalname}" — ` +
        `mimetype "${file.mimetype}" not in allowed set for ${label} (${allowed.join(', ')})`
      );
      // Passing an Error (not null) causes multer to forward it as-is to next().
      // The global errorHandler will catch it as a plain Error → 400 response.
      cb(
        new ApiError(
          400,
          `Invalid file type. Allowed types for ${label}: ${allowed.join(', ')}. Received: ${file.mimetype}`
        ) as unknown as null,
        false
      );
    }
  };
}

// ---------------------------------------------------------------------------
// 3 named multer instances
// ---------------------------------------------------------------------------

/**
 * uploadImage — JPEG / PNG / WebP only, max 2 MB.
 * Use: uploadImage.single('profileImage') or uploadImage.array('photos', n)
 */
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: makeFileFilter(IMAGE_MIME_TYPES, 'image'),
});

/**
 * uploadDocument — PDF only, max 5 MB.
 * Use: uploadDocument.single('resume')
 */
export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: makeFileFilter(PDF_MIME_TYPES, 'document'),
});

/**
 * uploadAttachment — Image (JPEG/PNG/WebP) + PDF, max 5 MB.
 * Use: uploadAttachment.single('file')
 */
export const uploadAttachment = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: makeFileFilter(ATTACHMENT_MIME_TYPES, 'attachment'),
});

// ---------------------------------------------------------------------------
// Multer error-handling middleware
// Plug this AFTER routes that use multer (or globally after all routes),
// BEFORE the main errorHandler.
//
// Why separate from errorHandler.ts?
//   multer.MulterError is a runtime dependency of multer; keeping it isolated
//   prevents circular deps and keeps errorHandler.ts framework-agnostic.
// ---------------------------------------------------------------------------

/**
 * Human-readable labels for multer error codes.
 */
const MULTER_ERROR_MESSAGES: Record<string, string> = {
  LIMIT_FILE_SIZE:      'File is too large. Check the size limit for this endpoint.',
  LIMIT_FILE_COUNT:     'Too many files uploaded at once.',
  LIMIT_FIELD_KEY:      'Form field name is too long.',
  LIMIT_FIELD_VALUE:    'Form field value is too long.',
  LIMIT_FIELD_COUNT:    'Too many form fields in the request.',
  LIMIT_UNEXPECTED_FILE:'Unexpected field name. Make sure the multipart field matches the expected name.',
  LIMIT_PART_COUNT:     'Too many parts in the multipart request.',
};

/**
 * handleUploadErrors — Express 5 compatible error-handling middleware.
 * Must have exactly 4 parameters so Express recognises it as an error handler.
 *
 * Usage in server.ts / router (add AFTER route registration):
 *   app.use(handleUploadErrors);
 *   app.use(errorHandler);   // keep existing handler last
 */
export const handleUploadErrors = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // multer.MulterError — catches LIMIT_* codes
  if (err instanceof multer.MulterError) {
    const humanMessage =
      MULTER_ERROR_MESSAGES[err.code] ??
      `Upload error: ${err.message}`;

    logger.warn(
      `[UploadMiddleware] MulterError on ${req.method} ${req.originalUrl} — ` +
      `code=${err.code}, field=${err.field ?? 'n/a'}, message=${err.message}`
    );

    responseError(
      res,
      {
        success: false,
        message: humanMessage,
        errors: [{ code: err.code, field: err.field ?? null }],
      },
      400
    );
    return;
  }

  // ApiError thrown from fileFilter (wrong mimetype)
  if (err instanceof ApiError) {
    logger.warn(
      `[UploadMiddleware] ApiError on ${req.method} ${req.originalUrl} — ` +
      `status=${err.statusCode}, message=${err.message}`
    );

    responseError(
      res,
      { success: false, message: err.message, errors: err.details },
      err.statusCode
    );
    return;
  }

  // Not an upload error — pass to the next handler (global errorHandler)
  next(err);
};
