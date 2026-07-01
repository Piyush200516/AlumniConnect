import { Notification, NotificationType, Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { emitToUser } from '../socket';
import { sendFcmNotification } from '../config/firebase';
import { transporter } from '../config/mail';
import { logger } from '../utils/logger';

export class NotificationService {

  /**
   * Send notification via Database, Socket.io, Firebase, and Email (for important events).
   */
  async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    options?: {
      linkUrl?: string;
      sendEmail?: boolean;
      emailSubject?: string;
    }
  ): Promise<Notification> {
    // 1. Save to Database
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        linkUrl: options?.linkUrl || null,
        isRead: false,
      },
    });

    // 2. Real-time emit via Socket
    try {
      emitToUser(userId, 'new_notification', notification);
    } catch (err) {
      logger.error(`[NotificationService] Socket emit failed for user ${userId}:`, err);
    }

    // 3. Push notification via FCM
    try {
      const fcmTokens = await prisma.fcmToken.findMany({
        where: { userId },
        select: { token: true },
      });
      if (fcmTokens.length > 0) {
        const tokens = fcmTokens.map((t) => t.token);
        await sendFcmNotification(userId, tokens, {
          title,
          body: message,
          linkUrl: options?.linkUrl || undefined,
        });
      }
    } catch (err) {
      logger.error(`[NotificationService] FCM push failed for user ${userId}:`, err);
    }

    // 4. Email via Nodemailer (only for important events or if requested)
    const isImportant =
      type === NotificationType.MENTORSHIP_REQUEST ||
      type === NotificationType.MENTORSHIP_ACCEPTED ||
      type === NotificationType.MENTORSHIP_REJECTED ||
      type === NotificationType.APPLICATION_UPDATE;

    if (options?.sendEmail || isImportant) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        });

        if (user?.email) {
          const subject = options?.emailSubject || `${title} - AlumniConnect`;
          const htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
              <h2 style="color: #4F46E5; margin-bottom: 20px;">AlumniConnect Portal</h2>
              <h3 style="color: #111827; margin-top: 0;">${title}</h3>
              <p style="font-size: 16px; line-height: 1.5; color: #4B5563;">${message}</p>
              ${
                options?.linkUrl
                  ? `<div style="margin-top: 30px;">
                       <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}${options.linkUrl}" 
                          style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                         View Details
                       </a>
                     </div>`
                  : ''
              }
              <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0 20px 0;" />
              <p style="font-size: 12px; color: #9CA3AF; text-align: center;">This is an automated notification from AlumniConnect. Please do not reply to this email.</p>
            </div>
          `;

          await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"AlumniConnect Portal" <no-reply@alumniconnect.com>',
            to: user.email,
            subject,
            html: htmlContent,
          });
          logger.info(`[NotificationService] Email sent successfully to ${user.email}`);
        }
      } catch (err) {
        logger.error(`[NotificationService] Nodemailer email failed for user ${userId}:`, err);
      }
    }

    return notification;
  }

  /**
   * Create a notification (backward compatibility wrapper for existing calls).
   */
  async createNotification(data: {
    title: string;
    message: string;
    type: NotificationType | string;
    userId: string;
    linkUrl?: string;
  }): Promise<Notification> {
    return this.sendNotification(
      data.userId,
      data.title,
      data.message,
      data.type as NotificationType,
      { linkUrl: data.linkUrl }
    );
  }

  /**
   * Send bulk notifications to multiple users concurrently.
   */
  async sendBulkNotifications(
    userIds: string[],
    title: string,
    message: string,
    type: NotificationType,
    options?: {
      linkUrl?: string;
      sendEmail?: boolean;
      emailSubject?: string;
    }
  ): Promise<Notification[]> {
    if (!userIds || userIds.length === 0) return [];

    // 1. Bulk save to database
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        title,
        message,
        type,
        linkUrl: options?.linkUrl || null,
        isRead: false,
      })),
    });

    // Fetch newly created records to return them properly with IDs
    const notifications = await prisma.notification.findMany({
      where: {
        userId: { in: userIds },
        title,
        message,
        type,
      },
      orderBy: { createdAt: 'desc' },
      take: userIds.length,
    });

    // 2. Send via socket and push concurrently
    const promises = userIds.map(async (userId) => {
      const record = notifications.find((n) => n.userId === userId) || {
        id: 'bulk',
        userId,
        title,
        message,
        type,
        linkUrl: options?.linkUrl || null,
        isRead: false,
        createdAt: new Date(),
      };

      // Emit Socket
      try {
        emitToUser(userId, 'new_notification', record);
      } catch (err) {
        logger.error(`[NotificationService] Bulk socket emit failed for user ${userId}:`, err);
      }

      // Send FCM Push
      try {
        const fcmTokens = await prisma.fcmToken.findMany({
          where: { userId },
          select: { token: true },
        });
        if (fcmTokens.length > 0) {
          const tokens = fcmTokens.map((t) => t.token);
          await sendFcmNotification(userId, tokens, {
            title,
            body: message,
            linkUrl: options?.linkUrl || undefined,
          });
        }
      } catch (err) {
        logger.error(`[NotificationService] Bulk FCM push failed for user ${userId}:`, err);
      }

      // Send Email
      const isImportant =
        type === NotificationType.MENTORSHIP_REQUEST ||
        type === NotificationType.MENTORSHIP_ACCEPTED ||
        type === NotificationType.MENTORSHIP_REJECTED ||
        type === NotificationType.APPLICATION_UPDATE;

      if (options?.sendEmail || isImportant) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
          });

          if (user?.email) {
            const subject = options?.emailSubject || `${title} - AlumniConnect`;
            const htmlContent = `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #4F46E5; margin-bottom: 20px;">AlumniConnect Portal</h2>
                <h3 style="color: #111827; margin-top: 0;">${title}</h3>
                <p style="font-size: 16px; line-height: 1.5; color: #4B5563;">${message}</p>
                ${
                  options?.linkUrl
                    ? `<div style="margin-top: 30px;">
                         <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}${options.linkUrl}" 
                            style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                           View Details
                         </a>
                       </div>`
                    : ''
                }
                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0 20px 0;" />
                <p style="font-size: 12px; color: #9CA3AF; text-align: center;">This is an automated notification from AlumniConnect. Please do not reply to this email.</p>
              </div>
            `;

            await transporter.sendMail({
              from: process.env.EMAIL_FROM || '"AlumniConnect Portal" <no-reply@alumniconnect.com>',
              to: user.email,
              subject,
              html: htmlContent,
            });
          }
        } catch (err) {
          logger.error(`[NotificationService] Bulk email failed for user ${userId}:`, err);
        }
      }
    });

    await Promise.allSettled(promises);
    return notifications;
  }

  /**
   * Send notification to all active users with a specific role.
   */
  async sendRoleNotification(
    role: Role,
    title: string,
    message: string,
    type: NotificationType,
    options?: {
      linkUrl?: string;
      sendEmail?: boolean;
      emailSubject?: string;
    }
  ): Promise<Notification[]> {
    const users = await prisma.user.findMany({
      where: { role, status: 'ACTIVE' },
      select: { id: true },
    });

    const userIds = users.map((u) => u.id);
    return this.sendBulkNotifications(userIds, title, message, type, options);
  }

  /**
   * Register a user's FCM token.
   */
  async registerFcmToken(userId: string, token: string, deviceType?: string) {
    return prisma.fcmToken.upsert({
      where: { token },
      update: {
        userId,
        deviceType: deviceType || null,
      },
      create: {
        userId,
        token,
        deviceType: deviceType || null,
      },
    });
  }

  /**
   * Unregister/delete a user's FCM token.
   */
  async unregisterFcmToken(token: string) {
    return prisma.fcmToken.deleteMany({
      where: { token },
    });
  }

  /**
   * Fetch paginated notifications for a user.
   */
  async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Fetch count of unread notifications for a user.
   */
  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications for a user as read.
   */
  async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Delete a notification.
   */
  async deleteNotification(notificationId: string, userId: string) {
    return prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }
}
