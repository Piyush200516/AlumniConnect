import { Response, NextFunction } from 'express';
import { EventService } from '../services/event.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { updateEventApprovalSchema, markAttendanceSchema } from '../validators/event.validator';
import { ApiError } from '../utils/error';

const service = new EventService();

export const getEventsList = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { search, category, mode, tab } = req.query;
    const events = await service.getEvents(
      {
        search: search as string,
        category: category as string,
        mode: mode as string,
        tab: tab as 'all' | 'upcoming' | 'registered' | 'past'
      },
      req.user?.id
    );
    res.status(200).json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

export const getEventDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const event = await service.getEventById(id, req.user?.id);
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

export const createEvent = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthenticated');
    const event = await service.createEvent(req.user.id, req.body);
    res.status(201).json({ success: true, data: event, message: 'Event created successfully' });
  } catch (err) {
    next(err);
  }
};

export const editEvent = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthenticated');
    const id = req.params.id as string;
    const event = await service.editEvent(id, req.user.id, req.body);
    res.status(200).json({ success: true, data: event, message: 'Event updated successfully' });
  } catch (err) {
    next(err);
  }
};

export const registerForEvent = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthenticated');
    const id = req.params.id as string;
    const registration = await service.registerForEvent(req.user.id, id);
    res.status(200).json({ success: true, data: registration, message: 'Successfully registered for event' });
  } catch (err) {
    next(err);
  }
};

export const cancelRegistration = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthenticated');
    const id = req.params.id as string;
    const cancelled = await service.cancelRegistration(req.user.id, id);
    res.status(200).json({ success: true, data: cancelled, message: 'Registration cancelled successfully' });
  } catch (err) {
    next(err);
  }
};

export const markAttendance = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthenticated');
    const id = req.params.id as string; // eventId
    const validated = markAttendanceSchema.parse(req.body);
    const updated = await service.markAttendance(id, validated.registrationId, req.user.id);
    res.status(200).json({ success: true, data: updated, message: 'Attendance marked successfully' });
  } catch (err) {
    next(err);
  }
};

export const approveOrRejectEvent = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const validated = updateEventApprovalSchema.parse(req.body);
    const event = await service.approveOrRejectEvent(id, validated.approvalStatus, validated.remarks ?? undefined);
    res.status(200).json({ success: true, data: event, message: `Event status updated to ${validated.approvalStatus}` });
  } catch (err) {
    next(err);
  }
};

export const getAllEventsForAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const events = await service.getAllEventsForAdmin();
    res.status(200).json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

export const getMyRegistrations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthenticated');
    const registrations = await service.getMyRegistrations(req.user.id);
    res.status(200).json({ success: true, data: registrations });
  } catch (err) {
    next(err);
  }
};

export const getMyCertificates = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthenticated');
    const certificates = await service.getMyCertificates(req.user.id);
    res.status(200).json({ success: true, data: certificates });
  } catch (err) {
    next(err);
  }
};

export const getEventRegistrations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const registrations = await service.getEventRegistrations(id);
    res.status(200).json({ success: true, data: registrations });
  } catch (err) {
    next(err);
  }
};
