import { z } from 'zod';
import { JobType, ApplicationStatus, JobApprovalStatus } from '@prisma/client';

export const createJobSchema = z.object({
  title: z.string().min(3, 'Job Title must be at least 3 characters'),
  description: z.string().min(10, 'Job Description must be at least 10 characters'),
  company: z.string().min(2, 'Company Name must be at least 2 characters'),
  companyLogo: z.string().url('Invalid Company Logo URL').optional().nullable().or(z.literal('')),
  location: z.string().min(2, 'Location is required').optional().nullable(),
  salary: z.string().min(1, 'Salary or Stipend details are required').optional().nullable(),
  jobType: z.nativeEnum(JobType),
  skillsRequired: z.array(z.string()).min(1, 'At least one skill is required'),
  deadline: z.string().or(z.date()).transform((val) => new Date(val)).optional().nullable(),
  
  responsibilities: z.string().min(5, 'Responsibilities must be at least 5 characters').optional().nullable(),
  eligibility: z.string().min(5, 'Eligibility criteria must be at least 5 characters').optional().nullable(),
  benefits: z.string().optional().nullable(),
  selectionProcess: z.string().optional().nullable(),
  applicationLink: z.string().url('Invalid Application URL').optional().nullable().or(z.literal('')),
});

export const editJobSchema = createJobSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const applyJobSchema = z.object({
  coverLetter: z.string().max(1000, 'Cover letter cannot exceed 1000 characters').optional().nullable(),
  resumeUrl: z.string().url('Invalid Resume URL'),
});

export const updateApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
});

export const updateJobApprovalSchema = z.object({
  approvalStatus: z.nativeEnum(JobApprovalStatus),
  remarks: z.string().optional().nullable(),
});
