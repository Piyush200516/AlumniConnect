// src/utils/token.ts
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { Role } from '@prisma/client';

const EMAIL_VERIFY_SECRET = process.env.EMAIL_VERIFY_SECRET ?? 'email-verify-secret';
const PASSWORD_RESET_SECRET = process.env.PASSWORD_RESET_SECRET ?? 'password-reset-secret';

/** Create email verification token (valid 24h) */
export const createEmailVerificationToken = async (userId: string): Promise<string> => {
  const token = jwt.sign({ userId }, EMAIL_VERIFY_SECRET, { expiresIn: '24h' });
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  await prisma.user.update({ where: { id: userId }, data: { emailVerifyToken: token, emailVerifyExpiry: expiry } });
  return token;
};

/** Verify email token and return userId */
export const verifyEmailToken = async (token: string): Promise<string> => {
  const decoded = jwt.verify(token, EMAIL_VERIFY_SECRET) as { userId: string };
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user || user.emailVerifyToken !== token) throw new Error('Invalid or expired email verification token');
  if (user.emailVerifyExpiry && user.emailVerifyExpiry < new Date()) throw new Error('Email verification token expired');
  await prisma.user.update({ where: { id: user.id }, data: { emailVerifyToken: null, emailVerifyExpiry: null } });
  return user.id;
};

/** Create password reset token (valid 15m) */
export const createPasswordResetToken = async (userId: string): Promise<string> => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 15);

  await prisma.user.update({
    where: { id: userId },
    data: { resetToken: hashedToken, resetTokenExpiry: expiry },
  });

  return resetToken;
};

/** Verify password reset token and return userId */
export const verifyPasswordResetToken = async (token: string): Promise<string> => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findUnique({ where: { resetToken: hashedToken } });
  
  if (!user) throw new Error('Invalid or expired password reset token');
  if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
    await prisma.user.update({ where: { id: user.id }, data: { resetToken: null, resetTokenExpiry: null } });
    throw new Error('Password reset token expired');
  }

  await prisma.user.update({ where: { id: user.id }, data: { resetToken: null, resetTokenExpiry: null } });
  return user.id;
};
