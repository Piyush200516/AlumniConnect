import * as jwt from 'jsonwebtoken';
import { Role } from '../../prisma';

const JWT_SECRET = process.env.JWT_SECRET ?? 'super-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export interface JwtPayloadData {
  userId: string;
  email: string;
  role: Role;
}

export const generateAccessToken = (payload: JwtPayloadData): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const generateRefreshToken = async (payload: JwtPayloadData): Promise<string> => {
  // In production, you'd store a hash; here we just sign
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
};

export const verifyAccessToken = (token: string): JwtPayloadData => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return {
      userId: decoded.userId as string,
      email: decoded.email as string,
      role: decoded.role as Role,
    };
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};
