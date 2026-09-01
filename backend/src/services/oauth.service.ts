// src/services/oauth.service.ts
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { Role } from '@prisma/client';

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

export const createJwtForUser = async (user: { id: string; email: string; role: Role }): Promise<JwtTokens> => {
  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = await generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
  return { accessToken, refreshToken };
};
