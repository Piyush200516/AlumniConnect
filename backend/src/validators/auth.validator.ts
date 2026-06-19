// src/validators/auth.validator.ts
import { z } from 'zod';

const normalizedEmail = z
  .string()
  .trim()
  .email()
  .transform((email) => email.toLowerCase());

export const studentSignupSchema = z.object({
  name: z.string().min(1),
  email: normalizedEmail,
  password: z.string().min(8),
  enrollmentNumber: z.string().min(1),
  branch: z.string().min(1),
  course: z.string().min(1),
  graduationYear: z.number().int().positive(),
});

export const alumniSignupSchema = z.object({
  name: z.string().min(1),
  email: normalizedEmail,
  password: z.string().min(8),
  passingYear: z.number().int().positive(),
  currentCompany: z.string().optional(),
  designation: z.string().optional(),
});

export const loginSchema = z.object({
  email: normalizedEmail,
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: normalizedEmail,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});
