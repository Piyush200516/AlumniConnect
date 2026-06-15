import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
/**
 * Authorize specific user roles.
 * Usage: authorizeRoles('STUDENT', 'ALUMNI')
 */
export declare const authorizeRoles: (...roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
