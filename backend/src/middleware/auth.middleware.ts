import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/error';
import { AuthenticatedRequest } from '../types/express';
export { AuthenticatedRequest };

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
      throw new ApiError(401, 'Authorization header missing or malformed');
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    // optional: fetch fresh user from DB to ensure still active
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new ApiError(401, 'User not found');
    if (user.status !== 'ACTIVE') throw new ApiError(403, 'Account is not active');

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    next(err);
  }
};
