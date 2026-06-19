import { z } from 'zod';

export const requestMentorshipSchema = z.object({
  alumniId: z.string().uuid('Invalid Alumni User ID'),
  message: z.string().max(500, 'Message cannot exceed 500 characters').optional().nullable(),
});

export const acceptMentorshipSchema = z.object({
  requestId: z.string().uuid('Invalid Mentorship Request ID'),
  note: z.string().max(500, 'Note cannot exceed 500 characters').optional().nullable(),
});

export const rejectMentorshipSchema = z.object({
  requestId: z.string().uuid('Invalid Mentorship Request ID'),
  note: z.string().max(500, 'Note cannot exceed 500 characters').optional().nullable(),
});

export const createMeetingSchema = z.object({
  connectionId: z.string().uuid('Invalid Mentorship Connection ID'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional().nullable(),
  scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid meeting date-time format',
  }),
  duration: z.number().int().min(5, 'Duration must be at least 5 minutes'),
  meetingLink: z.string().url('Invalid meeting Link URL').optional().nullable().or(z.literal('')),
});

export const createResourceSchema = z.object({
  connectionId: z.string().uuid('Invalid Mentorship Connection ID'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional().nullable(),
  fileUrl: z.string().url('Invalid file URL').optional().nullable().or(z.literal('')),
  linkUrl: z.string().url('Invalid resource link URL').optional().nullable().or(z.literal('')),
});
