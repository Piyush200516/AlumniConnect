import { z } from 'zod';
import { EventMode, EventStatus, EventApprovalStatus } from '@prisma/client';

// Allowed event categories
const categories = [
  'Alumni Talk',
  'Workshop',
  'Placement Drive',
  'Training Program',
  'Networking Event',
  'Webinar',
  'Seminar',
  'Mock Interview',
  'Resume Building Session',
  'Technical Event',
  'Hackathon',
  'Career Guidance Session',
];

// Base object schema without refinements
const baseEventObjectSchema = z.object({
  title: z.string().min(3, 'Event Title must be at least 3 characters'),
  category: z.string(), // refined separately
  description: z.string().min(10, 'Event Description must be at least 10 characters'),
  bannerUrl: z.string().url('Invalid Banner URL').optional().nullable().or(z.literal('')),
  mode: z.nativeEnum(EventMode),
  eventDate: z.string().or(z.date()).transform(val => new Date(val)),
  eventTime: z.string().min(2, 'Event Time range is required'),
  duration: z.string().min(1, 'Duration description is required'),
  venue: z.string().min(2, 'Venue is required'),
  googleMapsLocation: z.string().url('Invalid Google Maps link').optional().nullable().or(z.literal('')),
  totalSeats: z.number().int().min(1, 'Seats must be at least 1'),
  registrationDeadline: z.string().or(z.date()).transform(val => new Date(val)),
  agenda: z.string().optional().nullable(),
  keyBenefits: z.array(z.string()).optional().default([]),
  eligibilityCriteria: z.string().optional().nullable(),
  requiredDocuments: z.array(z.string()).optional().default([]),
  // Speaker details
  speakerName: z.string().min(2, 'Speaker Name is required'),
  speakerDesignation: z.string().optional().nullable(),
  speakerCompany: z.string().optional().nullable(),
  status: z.nativeEnum(EventStatus).optional().default(EventStatus.PUBLISHED),
});

// Refine category on top of the base object schema
const baseEventSchema = baseEventObjectSchema.refine(data => categories.includes(data.category), {
  message: 'Invalid Event Category',
  path: ['category'],
});

// Create event schema with date validation
export const createEventSchema = baseEventSchema.refine(data => {
  return data.registrationDeadline <= data.eventDate;
}, {
  message: 'Registration deadline must be on or before the event date',
  path: ['registrationDeadline'],
});

// Edit event schema – all fields optional, keep validations when present
export const editEventSchema = baseEventObjectSchema
  .partial()
  .extend({
    status: z.nativeEnum(EventStatus).optional(),
  })
  .superRefine((data, ctx) => {
    // Validate category if provided
    if (data.category && !categories.includes(data.category)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid Event Category',
        path: ['category'],
      });
    }
    // Validate dates relationship if both are present
    if (data.registrationDeadline && data.eventDate) {
      if (data.registrationDeadline > data.eventDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Registration deadline must be on or before the event date',
          path: ['registrationDeadline'],
        });
      }
    }
  });

export const updateEventApprovalSchema = z.object({
  approvalStatus: z.nativeEnum(EventApprovalStatus),
  remarks: z.string().optional().nullable(),
});

export const markAttendanceSchema = z.object({
  registrationId: z.string().min(1, 'Registration ID is required'),
});
