import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/error';

export class MessageService {
  /**
   * Send a direct message to a user
   * Finds or creates conversation automatically
   */
  async sendMessage(senderId: string, receiverId: string, content: string, imageUrl?: string) {
    if (senderId === receiverId) {
      throw new ApiError(400, 'You cannot message yourself');
    }

    // Verify recipient exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      throw new ApiError(404, 'Recipient user not found');
    }

    // Standardize user1Id < user2Id for unique composite constraint
    const [user1Id, user2Id] = senderId < receiverId ? [senderId, receiverId] : [receiverId, senderId];

    // Find or create conversation
    let conversation = await prisma.conversation.findUnique({
      where: {
        user1Id_user2Id: { user1Id, user2Id }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id,
          user2Id
        }
      });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        content,
        imageUrl: imageUrl || null
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            studentProfile: { select: { fullName: true } },
            alumniProfile: { select: { fullName: true } }
          }
        }
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    // Send a real-time Notification
    try {
      const senderName = message.sender.studentProfile?.fullName || message.sender.alumniProfile?.fullName || 'A member';
      await prisma.notification.create({
        data: {
          userId: receiverId,
          type: 'NEW_MESSAGE',
          title: `New Message from ${senderName}`,
          message: content.length > 50 ? `${content.substring(0, 47)}...` : content,
          linkUrl: `/student/dashboard` // or direct chat view link
        }
      });
    } catch (err) {
      console.error('Failed to create message notification:', err);
    }

    return message;
  }
}
