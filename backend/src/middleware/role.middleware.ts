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
      const userRole = String(req.user.role || '').toUpperCase();
      const allowedRoles = roles.map((r) => r.toUpperCase());
      if (!allowedRoles.includes(userRole)) {
        throw new ApiError(403, 'Forbidden: insufficient role');
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
