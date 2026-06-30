import { PrismaClient, Notification, NotificationType } from '@prisma/client';
import { emitToUser } from '../socket';

// Assuming NotificationType enum exists in Prisma schema, otherwise use string.

export class NotificationService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  /**
   * Create a notification and emit to appropriate sockets.
   * @param data - notification data
   */
  async createNotification(data: {
    title: string;
    message: string;
    type: NotificationType | string;
    userId: string;
    linkUrl?: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type as any,
        userId: data.userId,
        linkUrl: data.linkUrl,
        isRead: false,
      },
    });

    // Emit to user-specific room
    emitToUser(data.userId, 'new_notification', notification);
    return notification;
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }
}
