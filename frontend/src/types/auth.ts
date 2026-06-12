import { z } from 'zod';
import type { Role } from './user';

export const studentSignupSchema = z.object({
  name: z.string().min(2, 'Full Name is required'),
  email: z.string().email('Invalid email address'),
  enrollmentNumber: z.string().min(1, 'Enrollment Number required'),
  branch: z.string().min(1, 'Branch required'),
  course: z.string().min(1, 'Course is required'),
  graduationYear: z.coerce
    .number({ invalid_type_error: 'Enter a valid year' })
    .int('Enter a valid year')
    .gte(2025, 'Enter a valid year')
    .lte(2029, 'Enter a valid year'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

export const studentLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
});

export const alumniSignupSchema = z.object({
  fullName: z.string().min(2, 'Full Name is required'),
  email: z.string().email('Invalid email address'),
  enrollmentNumber: z.string().min(1, 'Enrollment Number required'),
  passingYear: z.coerce
    .number({ invalid_type_error: 'Enter a valid year' })
    .int('Enter a valid year')
    .gte(2025, 'Enter a valid year')
    .lte(2029, 'Enter a valid year'),
  company: z.string().min(1, 'Company required'),
  designation: z.string().min(1, 'Designation required'),
  linkedinUrl: z.string().url('Invalid LinkedIn URL'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

export const alumniLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
});

export const cdcLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
});

// Types for TypeScript inference
export type StudentSignup = z.infer<typeof studentSignupSchema>;
export type StudentLogin = z.infer<typeof studentLoginSchema>;
export type AlumniSignup = z.infer<typeof alumniSignupSchema>;
export type AlumniLogin = z.infer<typeof alumniLoginSchema>;
export type CdcLogin = z.infer<typeof cdcLoginSchema>;

export type User = {
  role: Role;
  token: string;
};

