// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/error';
import { logger } from '../utils/logger';
import { responseError } from '../utils/response';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  // Log the full error with stack trace
  logger.error(`[ErrorHandler] ${req.method} ${req.originalUrl} — ${err instanceof Error ? err.stack || err.message : JSON.stringify(err)}`);

  if (err instanceof ApiError) {
    // Structured API error — includes 404s from student profile not found
    const { statusCode, message, details } = err;
    logger.info(`[ErrorHandler] ApiError ${statusCode}: ${message}`);
    return responseError(res, { success: false, message, errors: details }, statusCode);
  }

  if (err instanceof ZodError) {
    const message = err.issues[0]?.message || 'Validation failed';
    return responseError(
      res,
      {
        success: false,
        message,
        errors: err.issues,
      },
      400
    );
  }

  // Prisma known request errors (e.g. column not found, unique constraint)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error(`[Prisma KnownError] Code: ${err.code} | Meta: ${JSON.stringify(err.meta)} | Message: ${err.message}`);
    if (err.code === 'P2002') {
      // Unique constraint violation — map to 409 Conflict
      const fields = (err.meta?.target as string[] | undefined)?.join(', ') || 'field';
      const message = `An account with this ${fields.includes('enrollmentNo') ? 'enrollment number' : fields.includes('email') ? 'email' : fields} already exists.`;
      return responseError(res, { success: false, message }, 409);
    }
    const message =
      err.code === 'P2025'
        ? 'Record not found.'
        : err.code === 'P2022'
          ? 'Database column mapping error — schema may be out of sync.'
          : `Database error (${err.code})`;
    const status = err.code === 'P2025' ? 404 : 500;
    return responseError(res, { success: false, message }, status);
  }

  // Prisma validation errors (e.g. unknown field passed to query)
  if (err instanceof Prisma.PrismaClientValidationError) {
    logger.error(`[Prisma ValidationError] ${err.name}: ${err.message}\nStack: ${err.stack}`);
    return responseError(res, {
      success: false,
      message: err.message,
    }, 500);
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    logger.error(`[Prisma InitError] ${err.message}`);
    return responseError(res, { success: false, message: 'Database connection failed' }, 503);
  }

  // Fallback for unexpected errors
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return responseError(res, { success: false, message }, status);
};

