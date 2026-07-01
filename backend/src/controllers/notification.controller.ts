import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { responseSuccess } from '../utils/response';
import { NotificationType, Role } from '@prisma/client';
import { ApiError } from '../utils/error';

const notificationService = new NotificationService();

export const getUserNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Unauthenticated');

    const notifications = await notificationService.getUserNotifications(userId);
    const unreadCount = await notificationService.getUnreadCount(userId);
    responseSuccess(res, 'Notifications retrieved successfully', { notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Unauthenticated');

    const id = req.params.id as string | undefined;

    if (id) {
      await notificationService.markAsRead(id, userId);
      responseSuccess(res, 'Notification marked as read');
    } else {
      await notificationService.markAllRead(userId);
      responseSuccess(res, 'All notifications marked as read');
    }
  } catch (err) {
    next(err);
  }
};

export const registerFcmToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, 'Unauthenticated');

    const { token, deviceType } = req.body;

    if (!token) {
      throw new ApiError(400, 'FCM token is required');
    }

    await notificationService.registerFcmToken(userId, token, deviceType);
    responseSuccess(res, 'FCM token registered successfully');
  } catch (err) {
    next(err);
  }
};

export const unregisterFcmToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new ApiError(400, 'FCM token is required');
    }

    await notificationService.unregisterFcmToken(token);
    responseSuccess(res, 'FCM token unregistered successfully');
  } catch (err) {
    next(err);
  }
};

export const createManualNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, role, title, message, type, linkUrl, sendEmail } = req.body;

    if (!title || !message || !type) {
      throw new ApiError(400, 'Title, message, and type are required');
    }

    const notifType = type as NotificationType;

    if (userId) {
      const result = await notificationService.sendNotification(userId, title, message, notifType, {
        linkUrl,
        sendEmail,
      });
      return responseSuccess(res, 'Notification sent to user', result);
    }

    if (role) {
      const result = await notificationService.sendRoleNotification(role as Role, title, message, notifType, {
        linkUrl,
        sendEmail,
      });
      return responseSuccess(res, 'Role notification sent successfully', result);
    }

    throw new ApiError(400, 'Either userId or role must be provided to send notification');
  } catch (err) {
    next(err);
  }
};
