import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/error';
import { logger } from '../utils/logger';
import { Role } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

/**
 * Authenticate user via JWT Bearer token.
 * Attaches `req.user` if valid.
 */
export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    logger.debug(`[AuthMiddleware] ${req.method} ${req.originalUrl} — checking authorization`);
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.error('[AuthMiddleware] Missing or malformed Authorization header');
      throw new ApiError(401, 'Authorization header missing or malformed');
    }
    const token = authHeader.split(' ')[1];
    logger.debug(`[AuthMiddleware] Token present, length=${token.length}`);
    const payload = verifyAccessToken(token);
    logger.info(`[AuthMiddleware] JWT decoded — userId=${payload.userId}, email=${payload.email}, role=${payload.role}`);

    req.user = { id: payload.userId, email: payload.email, role: payload.role };
    logger.info(`[AuthMiddleware] Authenticated successfully — userId=${payload.userId}, role=${payload.role}`);
    next();
  } catch (err: any) {
    logger.error(`[AuthMiddleware] Authentication failed: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    if (err instanceof Error && err.stack) {
      logger.error(`[AuthMiddleware] Stack: ${err.stack}`);
    }
    next(err);
  }
};
