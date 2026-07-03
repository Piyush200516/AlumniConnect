// src/services/oauth.service.ts
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { Role } from '@prisma/client';

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

export const createJwtForUser = (user: { id: string; email: string; role: Role }): JwtTokens => {
  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
  return { accessToken, refreshToken };
};
