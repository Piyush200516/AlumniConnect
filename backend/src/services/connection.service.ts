import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/error';
import { ConnectionStatus } from '@prisma/client';

export class ConnectionService {
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
          return { connection: accepted, message: 'Auto-accepted pending connection request' };
        }
      } else {
        // If rejected previously, reset to pending
        const updated = await prisma.connection.update({
          where: { id: existing.id },
          data: { status: ConnectionStatus.PENDING, senderId, receiverId }
        });
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
      const senderName = senderProfile?.studentProfile?.fullName || senderProfile?.alumniProfile?.fullName || 'A member';

      await prisma.notification.create({
        data: {
          userId: receiverId,
          type: 'MENTORSHIP_REQUEST', // fits nicely, or we can use SYSTEM
          title: `New Connection Request`,
          message: `${senderName} wants to connect with you in the networking directory.`,
          linkUrl: `/student/dashboard` // or messages / networks tab
        }
      });
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
      const receiverProfile = await prisma.user.findUnique({
        where: { id: receiverId },
        include: { studentProfile: true, alumniProfile: true }
      });
      const receiverName = receiverProfile?.studentProfile?.fullName || receiverProfile?.alumniProfile?.fullName || 'A member';

      await prisma.notification.create({
        data: {
          userId: connection.senderId,
          type: 'MENTORSHIP_ACCEPTED',
          title: 'Connection Request Accepted',
          message: `${receiverName} accepted your connection request. You can now chat in messages.`,
          linkUrl: `/student/dashboard` // or messages view
        }
      });
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

    return updated;
  }
}
