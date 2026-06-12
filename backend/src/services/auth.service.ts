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

class AuthService {
  /** Student signup */
  async studentSignup(payload: any) {
    const data = studentSignupSchema.parse(payload);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new Error('Email already in use');

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        role: Role.STUDENT,
        studentProfile: {
          create: {
            fullName: data.name,
            enrollmentNo: data.enrollmentNumber,
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
    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
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
    const data = loginSchema.parse(payload);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new Error('Invalid credentials');
    if (forcedRole && user.role !== forcedRole) throw new Error('Invalid role for this endpoint');
    if (!user.isEmailVerified) throw new Error('Email not verified');
    if (user.status !== 'ACTIVE') throw new Error('Account not active');
    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new Error('Invalid credentials');

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = await generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
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
