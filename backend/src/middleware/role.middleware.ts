// src/middleware/role.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ApiError } from '../utils/error';

/**
 * Authorize specific user roles.
 * Usage: authorizeRoles('STUDENT', 'ALUMNI')
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthenticated');
      if (!roles.includes(req.user.role)) {
        throw new ApiError(403, 'Forbidden: insufficient role');
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
