// src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import {
  createEmailVerificationToken,
  verifyEmailToken,
  createPasswordResetToken,
  verifyPasswordResetToken,
} from '../utils/token';
import {
  studentSignupSchema,
  alumniSignupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';
import { Role } from '@prisma/client';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/error';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const isBcryptHash = (value: string) => /^\$2[aby]\$\d{2}\$/.test(value);
const isLegacyMd5Hash = (value: string) => /^[a-f0-9]{32}$/i.test(value);

const verifyStoredPassword = async (plainPassword: string, storedPassword: string) => {
  if (isBcryptHash(storedPassword)) {
    return {
      matched: await bcrypt.compare(plainPassword, storedPassword),
      needsUpgrade: false,
    };
  }

  if (isLegacyMd5Hash(storedPassword)) {
    const md5 = crypto.createHash('md5').update(plainPassword).digest('hex');
    return {
      matched: md5 === storedPassword.toLowerCase(),
      needsUpgrade: md5 === storedPassword.toLowerCase(),
    };
  }

  return {
    matched: plainPassword === storedPassword,
    needsUpgrade: plainPassword === storedPassword,
  };
};

class AuthService {
  /** Student signup */
  async studentSignup(payload: any) {
    try {
      const data = studentSignupSchema.parse(payload);
      const email = normalizeEmail(data.email);
      const existing = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
      });
      if (existing) throw new ApiError(409, 'Email already in use');

      const hashed = await bcrypt.hash(data.password, 12);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashed,
          role: Role.STUDENT,
          isEmailVerified: true,
          studentProfile: {
            create: {
              fullName: data.name,
              enrollmentNumber: data.enrollmentNumber,
              branch: data.branch,
              course: data.course,
              graduationYear: data.graduationYear,
            },
          },
        },
      });

      const verificationToken = await createEmailVerificationToken(user.id);
      await sendVerificationEmail(user.email, verificationToken);
      const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
      const refreshToken = await generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
      logger.info(`Student signup successful: ${user.email}`);
      return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
    } catch (err: any) {
      logger.error(`Student signup failed: ${err instanceof Error ? err.message : err}`);
      if (err instanceof ApiError) throw err;
      // Zod validation errors
      if (err && typeof err === 'object' && 'issues' in err) {
        throw new ApiError(400, 'Invalid signup data', err);
      }
      throw new ApiError(500, 'Internal server error');
    }
  }

  /** Alumni signup */
  async alumniSignup(payload: any) {
    const data = alumniSignupSchema.parse(payload);
    const email = normalizeEmail(data.email);
    const existing = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (existing) throw new ApiError(409, 'Email already in use');

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: Role.ALUMNI,
        isEmailVerified: true,
        alumniProfile: {
          create: {
            fullName: data.name,
            passingYear: data.passingYear,
            currentCompany: data.currentCompany,
            designation: data.designation,
          },
        },
      },
    });

    const verificationToken = await createEmailVerificationToken(user.id);
    await sendVerificationEmail(user.email, verificationToken);
    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = await generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
  }

  /** Login (generic) */
  async login(payload: any, forcedRole?: Role) {
    try {
      const loginData = loginSchema.parse(payload);
      const email = normalizeEmail(loginData.email);
      
      // Log DATABASE_URL status
      logger.info(`Login service check: DATABASE_URL exists = ${!!process.env.DATABASE_URL}`);

      // Removed explicit prisma.$connect() to rely on existing connection established at server start.
      // This prevents opening a new connection per request which can cause timeouts.

      // Log User lookup
      logger.info(`Attempting user lookup for email: ${email}`);
      const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
      });
      if (!user) {
        logger.warn(`User lookup failed: no user found with email: ${email}`);
        throw new ApiError(401, 'Invalid email or password');
      }
      logger.info(`User lookup successful: found user with ID: ${user.id}, role: ${user.role}`);

      if (forcedRole && user.role !== forcedRole) {
        logger.warn(`Role verification failed. Expected: ${forcedRole}, got: ${user.role}`);
        throw new ApiError(401, 'Invalid email or password');
      }
      // Email verification check removed to allow login without verifying email
      // if (!user.isEmailVerified) {
      //   logger.warn(`Email verification check failed for user ID: ${user.id}`);
      //   throw new ApiError(401, 'Email not verified');
      // }
      if (user.status !== 'ACTIVE') {
        logger.warn(`User status is not active: ${user.status} for user ID: ${user.id}`);
        throw new ApiError(403, 'Account not active');
      }

      // Log Password comparison
      logger.info(`Comparing password for user email: ${loginData.email}`);
      if (typeof user.password !== 'string') {
        logger.error(`Password stored in DB is not a string for user ID: ${user.id}`);
        throw new ApiError(500, 'Internal server error');
      }
      const passwordCheck = await verifyStoredPassword(loginData.password, user.password);
      logger.info(`Password comparison completed. Result match: ${passwordCheck.matched}`);

      if (!passwordCheck.matched) {
        logger.warn(`Invalid credentials provided for user: ${email}`);
        throw new ApiError(401, 'Invalid email or password');
      }

      if (passwordCheck.needsUpgrade) {
        try {
          const upgradedPassword = await bcrypt.hash(loginData.password, 12);
          await prisma.user.update({
            where: { id: user.id },
            data: { password: upgradedPassword },
          });
          logger.info(`Upgraded legacy password hash for user ${email}`);
        } catch (upgradeError) {
          logger.warn(`Failed to upgrade legacy password hash for user ${email}: ${upgradeError instanceof Error ? upgradeError.message : upgradeError}`);
        }
      }

      const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
      const refreshToken = await generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
      logger.info(`Login successful: user logged in with ID ${user.id}`);
      return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      // Zod validation errors
      if (err && typeof err === 'object' && 'issues' in err) {
        throw new ApiError(400, 'Invalid login data', err);
      }
      // Handle other Prisma or system errors
      logger.error(`Login failed: ${err instanceof Error ? err.message : err}`);
      throw new ApiError(500, err instanceof Error ? err.message : 'Internal server error');
    }
  }

  /** Verify email */
  async verifyEmail(token: string) {
    const userId = await verifyEmailToken(token);
    await prisma.user.update({ where: { id: userId }, data: { isEmailVerified: true } });
  }

  /** Forgot password */
  async forgotPassword(email: string) {
    const parsed = forgotPasswordSchema.parse({ email });
    const normalized = normalizeEmail(parsed.email);
    const user = await prisma.user.findFirst({
      where: { email: { equals: normalized, mode: 'insensitive' } },
    });
    if (!user) throw new Error('User not found');
    const resetToken = await createPasswordResetToken(user.id);
    await sendPasswordResetEmail(user.email, resetToken);
  }

  /** Reset password */
  async resetPassword(token: string, newPassword: string) {
    const parsed = resetPasswordSchema.parse({ token, newPassword });
    const userId = await verifyPasswordResetToken(parsed.token);
    const hashed = await bcrypt.hash(parsed.newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  }
}

export default AuthService;
