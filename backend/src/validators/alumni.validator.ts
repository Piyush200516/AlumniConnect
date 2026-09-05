import { z } from 'zod';

export const sendConnectionSchema = z.object({
  receiverId: z.string().uuid('Invalid receiver ID format'),
});

export const acceptConnectionSchema = z.object({
  connectionId: z.string().uuid('Invalid connection ID format'),
});

export const sendMessageSchema = z.object({
  receiverId: z.string().uuid('Invalid receiver ID format'),
  content: z.string().min(1, 'Message content cannot be empty'),
  imageUrl: z.string().url('Invalid image attachment URL').optional().or(z.literal('')),
});

export const updateAlumniProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name cannot be empty').optional(),
  rollNumber: z.string().optional().nullable(),
  enrollmentNumber: z.string().optional().nullable(),
  graduationYear: z.number().int().min(1950, 'Graduation year must be 1950 or later').max(2100).optional().nullable(),
  course: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  personalEmail: z.string().email('Invalid personal email format').optional().nullable().or(z.literal('')),
  collegeEmail: z.string().email('Invalid college email format').optional().nullable().or(z.literal('')),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits').optional().nullable().or(z.literal('')),
  alternatePhone: z.string().regex(/^[0-9]{10}$/, 'Alternate phone number must be 10 digits').optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().nullable().or(z.literal('')),
  otherSocialLinks: z.any().optional().nullable(),
  cgpa: z.number().min(0, 'CGPA cannot be negative').max(10, 'CGPA cannot exceed 10.0').optional().nullable(),
  scholarshipsAndAwards: z.array(z.string()).optional(),
  extracurricularActivities: z.array(z.string()).optional(),
  alumniIdNumber: z.string().optional().nullable(),
  idCardUrl: z.string().optional().nullable(),
  degreeCertUrl: z.string().optional().nullable(),
  mentorshipAvailability: z.boolean().optional(),
  bio: z.string().optional().nullable(),
  currentCompany: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  experience: z.number().optional().nullable(),
  skills: z.array(z.string()).optional(),
  portfolioUrl: z.string().optional().nullable(),
  currentCtc: z.string().optional().nullable(),
});

export const addWorkExperienceSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role / Designation is required'),
  industry: z.string().optional().nullable(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const addDonationSchema = z.object({
  amount: z.number().positive('Donation amount must be greater than 0'),
  purpose: z.string().min(1, 'Purpose is required'),
  transactionId: z.string().optional().nullable(),
});

export const verifyAlumniSchema = z.object({
  verificationStatus: z.enum(['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED']),
});

