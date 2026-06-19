import { z } from 'zod';
import { EventMode, EventStatus, EventApprovalStatus } from '@prisma/client';

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
  'Career Guidance Session'
];

const baseEventSchema = z.object({
  title: z.string().min(3, 'Event Title must be at least 3 characters'),
  category: z.string().refine((val) => categories.includes(val), {
    message: 'Invalid Event Category'
  }),
  description: z.string().min(10, 'Event Description must be at least 10 characters'),
  bannerUrl: z.string().url('Invalid Banner URL').optional().nullable().or(z.literal('')),
  mode: z.nativeEnum(EventMode),
  eventDate: z.string().or(z.date()).transform((val) => new Date(val)),
  eventTime: z.string().min(2, 'Event Time range is required'),
  duration: z.string().min(1, 'Duration description is required'),
  venue: z.string().min(2, 'Venue is required'),
  googleMapsLocation: z.string().url('Invalid Google Maps link').optional().nullable().or(z.literal('')),
  totalSeats: z.number().int().min(1, 'Seats must be at least 1'),
  registrationDeadline: z.string().or(z.date()).transform((val) => new Date(val)),
  agenda: z.string().optional().nullable(),
  keyBenefits: z.array(z.string()).optional().default([]),
  eligibilityCriteria: z.string().optional().nullable(),
  requiredDocuments: z.array(z.string()).optional().default([]),
  
  // Speaker details nested or flat (flat is simpler)
  speakerName: z.string().min(2, 'Speaker Name is required'),
  speakerDesignation: z.string().optional().nullable(),
  speakerCompany: z.string().optional().nullable(),
  
  status: z.nativeEnum(EventStatus).optional().default(EventStatus.PUBLISHED)
});

export const createEventSchema = baseEventSchema.refine((data) => {
  return data.registrationDeadline <= data.eventDate;
}, {
  message: 'Registration deadline must be on or before the event date',
  path: ['registrationDeadline']
});

export const editEventSchema = baseEventSchema.partial().extend({
  status: z.nativeEnum(EventStatus).optional()
}).refine((data) => {
  if (data.registrationDeadline && data.eventDate) {
    return data.registrationDeadline <= data.eventDate;
  }
  return true;
}, {
  message: 'Registration deadline must be on or before the event date',
  path: ['registrationDeadline']
});

export const updateEventApprovalSchema = z.object({
  approvalStatus: z.nativeEnum(EventApprovalStatus),
  remarks: z.string().optional().nullable()
});

export const markAttendanceSchema = z.object({
  registrationId: z.string().min(1, 'Registration ID is required')
});
