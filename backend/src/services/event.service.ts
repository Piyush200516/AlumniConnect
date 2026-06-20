import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/error';
import { createEventSchema, editEventSchema, updateEventApprovalSchema } from '../validators/event.validator';
import { EventStatus, EventApprovalStatus, EventRegistrationStatus, Role, PortalApplicationStatus } from '@prisma/client';
import { sendEventRegistrationConfirmation } from '../utils/email';
import crypto from 'crypto';

export class EventService {
  /**
   * Helper to generate unique registration ID
   */
  private async generateUniqueRegId(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let isUnique = false;
    let regId = '';
    
    while (!isUnique) {
      regId = 'AC-';
      for (let i = 0; i < 6; i++) {
        regId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const existing = await prisma.eventRegistration.findUnique({
        where: { registrationId: regId }
      });
      if (!existing) {
        isUnique = true;
      }
    }
    
    return regId;
  }

  /**
   * Get all events with filters (Student/Alumni view)
   */
  async getEvents(filters: {
    search?: string;
    category?: string;
    mode?: string;
    tab?: 'all' | 'upcoming' | 'registered' | 'past';
  }, userId?: string) {
    const now = new Date();
    const whereClause: any = {
      isActive: true,
    };

    // If student/alumni is browsing, they only see approved events
    // CDC/Admin can see pending ones, but let's restrict student view to APPROVED only
    whereClause.approvalStatus = EventApprovalStatus.APPROVED;
    whereClause.status = EventStatus.PUBLISHED;

    if (filters.search) {
      whereClause.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { venue: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.category && filters.category !== 'ALL') {
      whereClause.category = filters.category;
    }

    if (filters.mode && filters.mode !== 'ALL') {
      whereClause.mode = filters.mode;
    }

    // Tab logic
    if (filters.tab === 'upcoming') {
      whereClause.eventDate = { gte: now };
    } else if (filters.tab === 'past') {
      whereClause.eventDate = { lt: now };
    } else if (filters.tab === 'registered' && userId) {
      whereClause.registrations = {
        some: {
          userId,
          status: { in: [EventRegistrationStatus.REGISTERED, EventRegistrationStatus.ATTENDED] }
        }
      };
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: { eventDate: 'asc' },
      include: {
        createdBy: {
          select: {
            role: true,
            email: true,
            studentProfile: { select: { fullName: true } },
            alumniProfile: { select: { fullName: true } },
            cdcProfile: { select: { collegeName: true, department: true } }
          }
        },
        registrations: userId ? {
          where: { userId }
        } : false
      }
    });

    return events;
  }

  /**
   * Get event details by ID
   */
  async getEventById(id: string, userId?: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            role: true,
            email: true,
            studentProfile: { select: { fullName: true } },
            alumniProfile: { select: { fullName: true } },
            cdcProfile: { select: { collegeName: true, department: true } }
          }
        },
        registrations: userId ? {
          where: { userId }
        } : {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                studentProfile: { select: { fullName: true, branch: true, enrollmentNumber: true } }
              }
            }
          }
        }
      }
    });

    if (!event) {
      throw new ApiError(404, 'Event not found');
    }

    return event;
  }

  /**
   * CDC: Create Event
   */
  async createEvent(creatorId: string, payload: any) {
    const creator = await prisma.user.findUnique({
      where: { id: creatorId }
    });

    if (!creator || creator.role !== Role.CDC) {
      throw new ApiError(403, 'Only CDC can create events');
    }

    const validated = createEventSchema.parse(payload);
    const hostedByAlumniName = validated.hostedByAlumniName?.trim() || '';
    const hostedByAlumniEmail = validated.hostedByAlumniEmail?.trim().toLowerCase() || '';

    let eventOwnerId = creatorId;
    let hostedAlumni: { id: string; email: string; alumniProfile: { fullName: string } | null } | null = null;

    if (hostedByAlumniName || hostedByAlumniEmail) {
      if (!hostedByAlumniName || !hostedByAlumniEmail) {
        throw new ApiError(400, 'Both alumni name and email are required when assigning an event to an alumni');
      }

      const alumniUser = await prisma.user.findUnique({
        where: { email: hostedByAlumniEmail },
        select: {
          id: true,
          email: true,
          role: true,
          alumniProfile: {
            select: {
              fullName: true
            }
          }
        }
      });

      if (!alumniUser || alumniUser.role !== Role.ALUMNI || !alumniUser.alumniProfile) {
        throw new ApiError(404, 'Alumni user not found for the provided email');
      }

      if (alumniUser.alumniProfile.fullName.trim().toLowerCase() !== hostedByAlumniName.toLowerCase()) {
        throw new ApiError(400, 'Alumni name and email do not match the selected alumni profile');
      }

      eventOwnerId = alumniUser.id;
      hostedAlumni = alumniUser;
    }

    // CDC events auto-approved.
    const approvalStatus = EventApprovalStatus.APPROVED;

    const event = await prisma.event.create({
      data: {
        createdById: eventOwnerId,
        title: validated.title,
        description: validated.description,
        bannerUrl: validated.bannerUrl || null,
        category: validated.category,
        mode: validated.mode,
        eventDate: validated.eventDate,
        eventTime: validated.eventTime,
        duration: validated.duration,
        venue: validated.venue,
        googleMapsLocation: validated.googleMapsLocation || null,
        totalSeats: validated.totalSeats,
        availableSeats: validated.totalSeats, // starts fully open
        registrationDeadline: validated.registrationDeadline,
        status: validated.status,
        approvalStatus,
        agenda: validated.agenda || null,
        keyBenefits: validated.keyBenefits,
        eligibilityCriteria: validated.eligibilityCriteria || null,
        requiredDocuments: validated.requiredDocuments,
        // Flat speaker fields in event model
        speakerName: validated.speakerName,
        speakerDesignation: validated.speakerDesignation || null,
        speakerCompany: validated.speakerCompany || null
      }
    });

    // Notify students when CDC creates it (since it's auto-approved)
    if (approvalStatus === EventApprovalStatus.APPROVED && event.status === EventStatus.PUBLISHED) {
      await this.notifyStudentsOfNewEvent(event);
    }

    // If CDC attached the event to an alumni portal, notify that alumni as well.
    if (hostedAlumni) {
      try {
        await prisma.notification.create({
          data: {
            userId: hostedAlumni.id,
            type: 'EVENT_CREATED',
            title: `Event created for your portal: ${event.title}`,
            message: `The CDC has published "${event.title}" under your alumni portal. Students can now view and register for it.`,
            linkUrl: '/alumni/dashboard'
          }
        });
      } catch (err) {
        console.error('Failed to notify alumni about event creation:', err);
      }
    }

    return event;
  }

  /**
   * CDC / Alumni: Edit Event
   */
  async editEvent(eventId: string, userId: string, payload: any) {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new ApiError(404, 'Event not found');
    }

    // Verify ownership or CDC role
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (event.createdById !== userId && user?.role !== Role.CDC) {
      throw new ApiError(403, 'Not authorized to modify this event');
    }

    const validated = editEventSchema.parse(payload);
    
    // If updating total seats, calculate seats delta and adjust available seats
    let updatedAvailableSeats = event.availableSeats;
    if (validated.totalSeats !== undefined && validated.totalSeats !== event.totalSeats) {
      const seatsDelta = validated.totalSeats - event.totalSeats;
      updatedAvailableSeats = Math.max(0, event.availableSeats + seatsDelta);
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: validated.title ?? undefined,
        description: validated.description ?? undefined,
        bannerUrl: validated.bannerUrl ?? undefined,
        category: validated.category ?? undefined,
        mode: validated.mode ?? undefined,
        eventDate: validated.eventDate ?? undefined,
        eventTime: validated.eventTime ?? undefined,
        duration: validated.duration ?? undefined,
        venue: validated.venue ?? undefined,
        googleMapsLocation: validated.googleMapsLocation ?? undefined,
        totalSeats: validated.totalSeats ?? undefined,
        availableSeats: updatedAvailableSeats,
        registrationDeadline: validated.registrationDeadline ?? undefined,
        status: validated.status ?? undefined,
        agenda: validated.agenda ?? undefined,
        keyBenefits: validated.keyBenefits ?? undefined,
        eligibilityCriteria: validated.eligibilityCriteria ?? undefined,
        requiredDocuments: validated.requiredDocuments ?? undefined,
        speakerName: validated.speakerName ?? undefined,
        speakerDesignation: validated.speakerDesignation ?? undefined,
        speakerCompany: validated.speakerCompany ?? undefined
      }
    });

    return updated;
  }

  /**
   * Student: Register for Event
   */
  async registerForEvent(studentId: string, eventId: string) {
    // 1. Verify eligibility criteria
    // Rule: Profile Completed, Application Submitted, Resume Uploaded
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentId }
    });
    const studentApp = await prisma.studentApplication.findUnique({
      where: { userId: studentId }
    });

    const isProfileComplete = !!(studentProfile && studentProfile.phone && studentProfile.profileImage);
    const isAppSubmitted = !!(studentApp && studentApp.status === PortalApplicationStatus.APPROVED);
    const isResumeUploaded = !!(studentApp && studentApp.resumeUrl);

    if (!isProfileComplete || !isAppSubmitted || !isResumeUploaded) {
      let missingMsg = 'You are not eligible to register. Missing requirements:';
      if (!isProfileComplete) missingMsg += ' Profile is incomplete;';
      if (!isAppSubmitted) missingMsg += ' Application must be verified & approved by CDC;';
      if (!isResumeUploaded) missingMsg += ' Resume has not been uploaded;';
      throw new ApiError(400, missingMsg);
    }

    // 2. Query event details
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new ApiError(404, 'Event not found');
    }

    if (event.approvalStatus !== EventApprovalStatus.APPROVED || event.status !== EventStatus.PUBLISHED) {
      throw new ApiError(400, 'Registrations are not open for this event');
    }

    // Date check
    if (new Date() > new Date(event.registrationDeadline)) {
      throw new ApiError(400, 'Registration deadline has passed');
    }

    // Seats check
    if (event.availableSeats <= 0) {
      throw new ApiError(400, 'Event registration seats are full');
    }

    // Existing registration check
    const existing = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: { eventId, userId: studentId }
      }
    });

    if (existing && existing.status !== EventRegistrationStatus.CANCELLED) {
      throw new ApiError(400, 'You have already registered for this event');
    }

    // 3. Create/reactivate registration in transaction
    const regId = await this.generateUniqueRegId();
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${regId}`;
    const eventPassUrl = `/student/events/pass/${regId}`;

    const registration = await prisma.$transaction(async (tx) => {
      // Decrement seats
      await tx.event.update({
        where: { id: eventId },
        data: {
          availableSeats: { decrement: 1 }
        }
      });

      // Create/upsert registration
      return tx.eventRegistration.upsert({
        where: {
          eventId_userId: { eventId, userId: studentId }
        },
        create: {
          registrationId: regId,
          eventId,
          userId: studentId,
          status: EventRegistrationStatus.REGISTERED,
          qrCodeUrl,
          eventPassUrl
        },
        update: {
          registrationId: regId,
          status: EventRegistrationStatus.REGISTERED,
          qrCodeUrl,
          eventPassUrl,
          createdAt: new Date()
        },
        include: {
          event: true,
          user: true
        }
      });
    });

    // 4. Send Confirmation Email (Async/Fire-and-forget or try-catch)
    try {
      await sendEventRegistrationConfirmation(registration.user.email, registration.event.title, regId);
    } catch (err) {
      console.error('Failed to send registration confirmation email:', err);
    }

    return registration;
  }

  /**
   * Student: Cancel Registration
   */
  async cancelRegistration(studentId: string, eventId: string) {
    const existing = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: { eventId, userId: studentId }
      },
      include: { event: true }
    });

    if (!existing || existing.status === EventRegistrationStatus.CANCELLED) {
      throw new ApiError(400, 'Active registration not found');
    }

    // Deadline check (within 24 hours before the event)
    const eventDate = new Date(existing.event.eventDate);
    const timeLimit = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
    if (new Date() > timeLimit) {
      throw new ApiError(400, 'Cancellations are only allowed up to 24 hours before the event');
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Increment seats
      await tx.event.update({
        where: { id: eventId },
        data: {
          availableSeats: { increment: 1 }
        }
      });

      return tx.eventRegistration.update({
        where: { id: existing.id },
        data: { status: EventRegistrationStatus.CANCELLED }
      });
    });

    return updated;
  }

  /**
   * Student: Get registrations list
   */
  async getMyRegistrations(studentId: string) {
    const registrations = await prisma.eventRegistration.findMany({
      where: { userId: studentId },
      include: {
        event: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return registrations;
  }

  /**
   * Student: Get earned certificates
   */
  async getMyCertificates(studentId: string) {
    const certificates = await prisma.eventCertificate.findMany({
      where: { studentId },
      include: {
        event: true
      },
      orderBy: { issuedAt: 'desc' }
    });
    return certificates;
  }

  /**
   * CDC / Alumni / Admin: Get Registrants List for an Event
   */
  async getEventRegistrations(eventId: string) {
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            studentProfile: {
              select: {
                fullName: true,
                branch: true,
                enrollmentNumber: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    return registrations;
  }

  /**
   * CDC / Alumni: Scan pass & Mark Attendance
   */
  async markAttendance(eventId: string, registrationId: string, markerUserId: string) {
    // Verify marker role and registration info
    const marker = await prisma.user.findUnique({ where: { id: markerUserId } });
    if (!marker || marker.role === Role.STUDENT) {
      throw new ApiError(403, 'Students are not authorized to mark attendance');
    }

    const registration = await prisma.eventRegistration.findUnique({
      where: { registrationId },
      include: { event: true, user: { select: { id: true, fullName: true } } }
    });

    if (!registration || registration.eventId !== eventId) {
      throw new ApiError(404, 'Registration pass not found for this event');
    }

    if (registration.status === EventRegistrationStatus.CANCELLED) {
      throw new ApiError(400, 'Registration was cancelled by student');
    }

    if (registration.status === EventRegistrationStatus.ATTENDED) {
      return registration; // already marked
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update status
      const updatedReg = await tx.eventRegistration.update({
        where: { id: registration.id },
        data: {
          status: EventRegistrationStatus.ATTENDED,
          attendanceMarkedAt: new Date()
        }
      });

      // 2. Issue Certificate automatically
      const certId = crypto.randomUUID();
      const certificateUrl = `/api/events/certificate/${certId}/download`;

      await tx.eventCertificate.create({
        data: {
          id: certId,
          registrationId: registration.id,
          studentId: registration.userId,
          eventId: registration.eventId,
          certificateUrl
        }
      });

      return updatedReg;
    });

    return updated;
  }

  /**
   * CDC / Admin: Approve/Reject Alumni Event
   */
  async approveOrRejectEvent(eventId: string, approvalStatus: EventApprovalStatus, remarks?: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new ApiError(404, 'Event not found');
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        approvalStatus,
        remarks: remarks || null,
        // If approved, verify status is PUBLISHED to go live
        status: approvalStatus === EventApprovalStatus.APPROVED ? EventStatus.PUBLISHED : event.status
      }
    });

    // Notify students on new approved event
    if (approvalStatus === EventApprovalStatus.APPROVED && updated.status === EventStatus.PUBLISHED) {
      await this.notifyStudentsOfNewEvent(updated);
    }

    return updated;
  }

  /**
   * CDC / Admin: Get all events (Admin view)
   */
  async getAllEventsForAdmin() {
    const events = await prisma.event.findMany({
      include: {
        createdBy: {
          select: {
            role: true,
            email: true,
            alumniProfile: { select: { fullName: true } },
            cdcProfile: { select: { collegeName: true, department: true } }
          }
        },
        _count: {
          select: { registrations: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return events;
  }

  /**
   * Helper: Notify students of a newly published event
   */
  private async notifyStudentsOfNewEvent(event: any) {
    try {
      const students = await prisma.user.findMany({
        where: { role: Role.STUDENT }
      });

      if (students.length > 0) {
        await prisma.notification.createMany({
          data: students.map(s => ({
            userId: s.id,
            type: 'EVENT_CREATED',
            title: `New Event: ${event.title}`,
            message: `A new ${event.category} by ${event.speakerName} has been scheduled. Register now before seats run out!`,
            linkUrl: `/student/events/${event.id}`
          }))
        });
      }
    } catch (err) {
      console.error('Failed to create bulk student notifications for new event:', err);
    }
  }
}

export default EventService;
