// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/error';
import { logger } from '../utils/logger';
import { responseError } from '../utils/response';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Log the full error with stack trace
  logger.error(`[Error] ${err instanceof Error ? err.stack || err.message : JSON.stringify(err)}`);

  if (err instanceof ApiError) {
    // Structured API error
    const { statusCode, message, details } = err;
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
    logger.error(`[Prisma KnownError] Code: ${err.code} | Meta: ${JSON.stringify(err.meta)}`);
    const message =
      err.code === 'P2002'
        ? 'A record with this value already exists.'
        : err.code === 'P2025'
          ? 'Record not found.'
          : err.code === 'P2022'
            ? 'Database column mapping error — schema may be out of sync.'
            : `Database error (${err.code})`;
    return responseError(res, { success: false, message }, 500);
  }

  // Prisma initialization / connection errors
  if (err instanceof Prisma.PrismaClientInitializationError) {
    logger.error(`[Prisma InitError] ${err.message}`);
    return responseError(res, { success: false, message: 'Database connection failed' }, 503);
  }

  // Fallback for unexpected errors
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  return responseError(res, { success: false, message }, status);
};
