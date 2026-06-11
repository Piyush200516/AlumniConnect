// src/types/express.d.ts
import { Role } from '../../generated/prisma';
import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export type AuthenticatedRequest = Request & { user: AuthUser };
