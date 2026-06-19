import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { MentorshipService } from '../services/mentorship.service';
import { responseSuccess } from '../utils/response';
import { ApiError } from '../utils/error';
import {
  requestMentorshipSchema,
  acceptMentorshipSchema,
  rejectMentorshipSchema,
  createMeetingSchema,
  createResourceSchema
} from '../validators/mentorship.validator';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { PrivacySetting } from '@prisma/client';

const mentorshipService = new MentorshipService();

export class MentorshipController {
  async requestMentorship(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthenticated');
      const studentId = req.user.id;
      
      const payload = requestMentorshipSchema.parse(req.body);
      const request = await mentorshipService.sendMentorshipRequest(
        studentId,
        payload.alumniId,
        payload.message
      );

      return responseSuccess(res, 'Mentorship request sent successfully', request);
    } catch (err) {
      next(err);
    }
  }

  async acceptMentorship(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthenticated');
      const alumniId = req.user.id;

      const payload = acceptMentorshipSchema.parse(req.body);
      const connection = await mentorshipService.acceptMentorshipRequest(
        alumniId,
        payload.requestId,
        payload.note
      );

      return responseSuccess(res, 'Mentorship request accepted successfully', connection);
    } catch (err) {
      next(err);
    }
  }

  async rejectMentorship(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthenticated');
      const alumniId = req.user.id;

      const payload = rejectMentorshipSchema.parse(req.body);
      const request = await mentorshipService.rejectMentorshipRequest(
        alumniId,
        payload.requestId,
        payload.note
      );

      return responseSuccess(res, 'Mentorship request rejected successfully', request);
    } catch (err) {
      next(err);
    }
  }

  async getMyMentors(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthenticated');
      const studentId = req.user.id;
      const mentors = await mentorshipService.getMyMentors(studentId);
      return responseSuccess(res, 'Fetched connected mentors successfully', mentors);
    } catch (err) {
      next(err);
    }
  }

  async getMyMentees(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthenticated');
      const alumniId = req.user.id;
      const mentees = await mentorshipService.getMyMentees(alumniId);
      return responseSuccess(res, 'Fetched connected mentees successfully', mentees);
    } catch (err) {
      next(err);
    }
  }

  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthenticated');
      const dashboardData = await mentorshipService.getDashboardMetrics(req.user.id, req.user.role);
      return responseSuccess(res, 'Fetched mentorship dashboard data successfully', dashboardData);
    } catch (err) {
      next(err);
    }
  }

  async scheduleMeeting(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthenticated');
      const payload = createMeetingSchema.parse(req.body);
      const meeting = await mentorshipService.scheduleMeeting(req.user.id, payload);
      return responseSuccess(res, 'Meeting scheduled successfully', meeting);
    } catch (err) {
      next(err);
    }
  }

  async shareResource(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthenticated');
      const payload = createResourceSchema.parse(req.body);
      const resource = await mentorshipService.shareResource(req.user.id, payload);
      return responseSuccess(res, 'Resource shared successfully', resource);
    } catch (err) {
      next(err);
    }
  }

  async updateAlumniPrivacy(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new ApiError(401, 'Unauthenticated');
      const schema = z.object({
        privacySetting: z.nativeEnum(PrivacySetting),
        phone: z.string().optional().nullable(),
        portfolioUrl: z.string().url().optional().nullable().or(z.literal('')),
        currentCtc: z.string().optional().nullable(),
      });
      const payload = schema.parse(req.body);
      const updated = await prisma.alumniProfile.update({
        where: { userId: req.user.id },
        data: {
          privacySetting: payload.privacySetting,
          phone: payload.phone,
          portfolioUrl: payload.portfolioUrl === '' ? null : payload.portfolioUrl,
          currentCtc: payload.currentCtc,
        }
      });
      return responseSuccess(res, 'Alumni profile details updated successfully', updated);
    } catch (err) {
      next(err);
    }
  }
}
