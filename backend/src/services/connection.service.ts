import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/error';
import { ConnectionStatus, Role } from '@prisma/client';
import { emitToUser } from '../socket';
import { NotificationService } from './notification.service';

const notificationService = new NotificationService();

const getDashboardLink = (role: Role) => {
  if (role === Role.ALUMNI) {
    return '/alumni/dashboard?tab=connections';
  }

  if (role === Role.CDC) {
    return '/cdc/dashboard';
  }

  return '/student/dashboard';
};

const getDisplayName = (user: {
  studentProfile?: { fullName?: string | null } | null;
  alumniProfile?: { fullName?: string | null } | null;
}) => {
  return user.studentProfile?.fullName || user.alumniProfile?.fullName || 'A member';
};

export class ConnectionService {
  async getIncomingConnectionRequests(userId: string) {
    const requests = await prisma.connection.findMany({
      where: {
        receiverId: userId,
        status: ConnectionStatus.PENDING,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
            studentProfile: {
              select: {
                fullName: true,
                branch: true,
                course: true,
                graduationYear: true,
                phone: true,
                profileImage: true,
              },
            },
            alumniProfile: {
              select: {
                fullName: true,
                branch: true,
                course: true,
                passingYear: true,
                currentCompany: true,
                designation: true,
                phone: true,
                profileImageUrl: true,
              },
            },
          },
        },
      },
    });

    return requests.map((request) => ({
      id: request.id,
      senderId: request.senderId,
      receiverId: request.receiverId,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      sender: {
        id: request.sender.id,
        email: request.sender.email,
        role: request.sender.role,
        fullName: getDisplayName(request.sender),
        branch: request.sender.studentProfile?.branch || request.sender.alumniProfile?.branch || null,
        course: request.sender.studentProfile?.course || request.sender.alumniProfile?.course || null,
        graduationYear: request.sender.studentProfile?.graduationYear || request.sender.alumniProfile?.passingYear || null,
        currentCompany: request.sender.alumniProfile?.currentCompany || null,
        designation: request.sender.alumniProfile?.designation || null,
        phone: request.sender.studentProfile?.phone || request.sender.alumniProfile?.phone || null,
        profileImageUrl: request.sender.studentProfile?.profileImage || request.sender.alumniProfile?.profileImageUrl || null,
      },
    }));
  }

  /**
   * Send Connection Request
   */
  async sendConnectionRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new ApiError(400, 'You cannot connect with yourself');
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      include: { studentProfile: true, alumniProfile: true }
    });

    if (!receiver) {
      throw new ApiError(404, 'Recipient user not found');
    }

    // Check if connection already exists
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }
    });

    if (existing) {
      if (existing.status === ConnectionStatus.ACCEPTED) {
        throw new ApiError(400, 'You are already connected');
      } else if (existing.status === ConnectionStatus.PENDING) {
        if (existing.senderId === senderId) {
          throw new ApiError(400, 'Connection request already sent and is pending');
        } else {
          // If the other user already sent a request, auto-accept it!
          const accepted = await prisma.connection.update({
            where: { id: existing.id },
            data: { status: ConnectionStatus.ACCEPTED }
          });

          try {
            const accepterProfile = await prisma.user.findUnique({
              where: { id: senderId },
              include: { studentProfile: true, alumniProfile: true }
            });
            const originalSenderProfile = await prisma.user.findUnique({
              where: { id: existing.senderId },
              select: { role: true }
            });
            await notificationService.sendNotification(
              existing.senderId,
              'Connection Request Accepted',
              `${getDisplayName(accepterProfile || {})} accepted your connection request. You can now chat in messages.`,
              'MENTORSHIP_ACCEPTED',
              { linkUrl: getDashboardLink(originalSenderProfile?.role || Role.STUDENT) }
            );
          } catch (err) {
            console.error('Failed to notify auto-accepted connection:', err);
          }

          return { connection: accepted, message: 'Auto-accepted pending connection request' };
        }
      } else {
        // If rejected previously, reset to pending
        const updated = await prisma.connection.update({
          where: { id: existing.id },
          data: { status: ConnectionStatus.PENDING, senderId, receiverId }
        });

        try {
          const senderProfile = await prisma.user.findUnique({
            where: { id: senderId },
            include: { studentProfile: true, alumniProfile: true }
          });
          const receiverProfile = await prisma.user.findUnique({
            where: { id: receiverId },
            select: { role: true }
          });
          await notificationService.sendNotification(
            receiverId,
            'New Connection Request',
            `${getDisplayName(senderProfile || {})} wants to connect with you in the networking directory.`,
            'MENTORSHIP_REQUEST',
            { linkUrl: getDashboardLink(receiverProfile?.role || Role.STUDENT) }
          );
        } catch (err) {
          console.error('Failed to re-notify connection request:', err);
        }

        return { connection: updated, message: 'Connection request sent successfully' };
      }
    }

    // Create new connection request
    const connection = await prisma.connection.create({
      data: {
        senderId,
        receiverId,
        status: ConnectionStatus.PENDING
      }
    });

    // Send Notification to recipient
    try {
      const senderProfile = await prisma.user.findUnique({
        where: { id: senderId },
        include: { studentProfile: true, alumniProfile: true }
      });
      const receiverProfile = await prisma.user.findUnique({
        where: { id: receiverId },
        select: { role: true },
      });
      const senderName = getDisplayName(senderProfile || {});
      await notificationService.sendNotification(
        receiverId,
        `New Connection Request`,
        `${senderName} wants to connect with you in the networking directory.`,
        'MENTORSHIP_REQUEST',
        { linkUrl: getDashboardLink(receiverProfile?.role || Role.STUDENT) }
      );
    } catch (err) {
      console.error('Failed to create connection notification:', err);
    }

    return { connection, message: 'Connection request sent successfully' };
  }

  /**
   * Accept Connection Request
   */
  async acceptConnectionRequest(receiverId: string, connectionId: string) {
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      throw new ApiError(404, 'Connection request not found');
    }

    if (connection.receiverId !== receiverId) {
      throw new ApiError(403, 'You are not authorized to accept this connection request');
    }

    if (connection.status !== ConnectionStatus.PENDING) {
      throw new ApiError(400, `Connection status is already ${connection.status}`);
    }

    const updated = await prisma.connection.update({
      where: { id: connectionId },
      data: { status: ConnectionStatus.ACCEPTED }
    });

    // Notify sender
    try {
      const [receiverProfile, senderProfile] = await Promise.all([
        prisma.user.findUnique({
          where: { id: receiverId },
          include: { studentProfile: true, alumniProfile: true }
        }),
        prisma.user.findUnique({
          where: { id: connection.senderId },
          select: { role: true }
        }),
      ]);

      await notificationService.sendNotification(
        connection.senderId,
        'Connection Request Accepted',
        `${getDisplayName(receiverProfile || {})} accepted your connection request. You can now chat in messages.`,
        'MENTORSHIP_ACCEPTED',
        { linkUrl: getDashboardLink(senderProfile?.role || Role.STUDENT) }
      );
    } catch (err) {
      console.error('Failed to notify accepted connection:', err);
    }

    return updated;
  }

  /**
   * Reject / Decline Connection Request
   */
  async rejectConnectionRequest(receiverId: string, connectionId: string) {
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      throw new ApiError(404, 'Connection request not found');
    }

    if (connection.receiverId !== receiverId) {
      throw new ApiError(403, 'You are not authorized to reject this connection request');
    }

    // Delete or update to rejected
    const updated = await prisma.connection.update({
      where: { id: connectionId },
      data: { status: ConnectionStatus.REJECTED }
    });

    try {
      const [receiverProfile, senderProfile] = await Promise.all([
        prisma.user.findUnique({
          where: { id: receiverId },
          include: { studentProfile: true, alumniProfile: true }
        }),
        prisma.user.findUnique({
          where: { id: connection.senderId },
          select: { role: true }
        }),
      ]);
      await notificationService.sendNotification(
        connection.senderId,
        'Connection Request Declined',
        `${getDisplayName(receiverProfile || {})} declined your connection request.`,
        'SYSTEM',
        { linkUrl: getDashboardLink(senderProfile?.role || Role.STUDENT) }
      );
    } catch (err) {
      console.error('Failed to notify rejected connection:', err);
    }

    return updated;
  }
}
