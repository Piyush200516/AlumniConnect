// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/error';
import { logger } from '../utils/logger';
import { responseError } from '../utils/response';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Log the error
  logger.error(`Error: ${err instanceof Error ? err.message : JSON.stringify(err)}`);

  if (err instanceof ApiError) {
    // Structured API error
    const { statusCode, message, details } = err;
    return responseError(res, { success: false, message, errors: details }, statusCode);
  }

  // Fallback for unexpected errors
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  return responseError(res, { success: false, message }, status);
};
