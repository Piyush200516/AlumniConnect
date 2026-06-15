import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
export { AuthenticatedRequest };
/**
 * Authenticate user via JWT Bearer token.
 * Attaches `req.user` if valid.
 */
export declare const authenticateUser: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
