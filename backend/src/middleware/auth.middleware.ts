import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/error';
import { logger } from '../utils/logger';
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.error('Auth Error: Missing or malformed Authorization header');
      throw new ApiError(401, 'Authorization header missing or malformed');
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    logger.info('User ID from JWT payload:', payload.userId);
    // optional: fetch fresh user from DB to ensure still active
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    logger.info('Fetched user from DB:', user);
    if (!user) {
      logger.error('Auth Error: User not found for ID', payload.userId);
      throw new ApiError(401, 'User not found');
    }
    if (user.status !== 'ACTIVE') {
      logger.error('Auth Error: Inactive account for user', user.id);
      throw new ApiError(403, 'Account is not active');
    }
    req.user = { id: user.id, email: user.email, role: user.role };
    logger.info('Auth Middleware: Authenticated user', { userId: user.id, role: user.role });
    next();
  } catch (err) {
    console.error('STUDENT API ERROR:', err);
    console.error(err.stack);
    next(err);
  }
};
