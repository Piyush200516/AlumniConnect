// src/services/auth.service.ts
import bcrypt from 'bcryptjs';
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

class AuthService {
  /** Student signup */
  async studentSignup(payload: any) {
    try {
      const data = studentSignupSchema.parse(payload);
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) throw new ApiError(409, 'Email already in use');

      const hashed = await bcrypt.hash(data.password, 12);
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashed,
          role: Role.STUDENT,
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
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new Error('Email already in use');

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        role: Role.ALUMNI,
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
      
      // Log DATABASE_URL status
      logger.info(`Login service check: DATABASE_URL exists = ${!!process.env.DATABASE_URL}`);

      // Log Prisma connection status
      try {
        await prisma.$connect();
        logger.info("Database connection active and verified.");
      } catch (connError) {
        logger.error(`Database connection verification failed: ${connError instanceof Error ? connError.message : connError}`);
        throw new ApiError(500, 'Database connection error');
      }

      // Log User lookup
      logger.info(`Attempting user lookup for email: ${loginData.email}`);
      const user = await prisma.user.findUnique({ where: { email: loginData.email } });
      if (!user) {
        logger.warn(`User lookup failed: no user found with email: ${loginData.email}`);
        throw new ApiError(401, 'Invalid email or password');
      }
      logger.info(`User lookup successful: found user with ID: ${user.id}, role: ${user.role}`);

      if (forcedRole && user.role !== forcedRole) {
        logger.warn(`Role verification failed. Expected: ${forcedRole}, got: ${user.role}`);
        throw new ApiError(401, 'Invalid email or password');
      }
      if (!user.isEmailVerified) {
        logger.warn(`Email verification check failed for user ID: ${user.id}`);
        throw new ApiError(401, 'Email not verified');
      }
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
      const match = await bcrypt.compare(
        loginData.password,
        user.password
      );
      logger.info(`Password comparison completed. Result match: ${match}`);

      if (!match) {
        logger.warn(`Invalid credentials provided for user: ${loginData.email}`);
        throw new ApiError(401, 'Invalid email or password');
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
    const user = await prisma.user.findUnique({ where: { email: parsed.email } });
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
