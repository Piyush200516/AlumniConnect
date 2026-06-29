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
    receiverId: string;
    receiverRole: string;
    link?: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type as any,
        receiverId: data.receiverId,
        receiverRole: data.receiverRole,
        link: data.link,
        isRead: false,
      },
    });

    // Emit to user-specific room
    emitToUser(data.receiverId, 'new_notification', notification);
    // Emit to role-based room (e.g., student, alumni, cdc, admin)
    emitToUser(data.receiverRole, 'new_notification_role', notification);
    return notification;
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { receiverId: userId, isRead: false },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, receiverId: userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { receiverId: userId, isRead: false },
      data: { isRead: true },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: { id: notificationId, receiverId: userId },
    });
  }
}
