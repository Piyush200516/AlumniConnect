import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/error';
import { emitToUser, io } from '../socket';

export class MessageService {
  /**
   * Send message with optional files/resumes inside mentorship conversation
   */
  async sendMessage(
    senderId: string,
    payload: {
      receiverId: string;
      content: string;
      fileUrl?: string;
      fileType?: string;
      isResumeReview?: boolean;
    }
  ) {
    const { receiverId, content, fileUrl, fileType, isResumeReview } = payload;

    // Resolve mentorship connection between sender and receiver
    const connection = await prisma.mentorshipConnection.findFirst({
      where: {
        OR: [
          { studentId: senderId, alumniId: receiverId },
          { studentId: receiverId, alumniId: senderId }
        ]
      },
      include: { conversation: true }
    });

    if (!connection) {
      throw new ApiError(404, 'Mentorship connection not found between users');
    }

    // Ensure request accepted
    const request = await prisma.mentorshipRequest.findFirst({
      where: {
        studentId: connection.studentId,
        alumniId: connection.alumniId
      }
    });
    if (!request || request.status !== 'ACCEPTED') {
      throw new ApiError(403, 'Messaging is only available after mentorship acceptance');
    }

    // Resolve or create conversation
    let conversationId = connection.conversation?.id;
    if (!conversationId) {
      const conv = await prisma.conversation.create({
        data: { connectionId: connection.id }
      });
      conversationId = conv.id;
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        message: content,
        fileUrl: fileUrl || null,
        fileType: fileType || null,
        isResumeReview: isResumeReview || false
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            studentProfile: { select: { fullName: true, profileImage: true } },
            alumniProfile: { select: { fullName: true, profileImageUrl: true } }
          }
        }
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    // Emit live via Socket.io
    io?.to(conversationId).emit('receive_message', message);

    // Notification to receiver
    const senderName = message.sender.studentProfile?.fullName || message.sender.alumniProfile?.fullName || 'A member';
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'NEW_MESSAGE',
        title: `New Message from ${senderName}`,
        message: isResumeReview ? 'Requested a Resume Review 📄' : content,
        linkUrl: `/student/dashboard`
      }
    });
    emitToUser(receiverId, 'notification', {
      userId: receiverId,
      type: 'NEW_MESSAGE',
      title: `New Message from ${senderName}`,
      message: isResumeReview ? 'Requested a Resume Review 📄' : content,
      linkUrl: `/student/dashboard`
    });

    return message;
  }

  /**
   * Retrieve messages by connection/conversation ID
   */
  async getMessages(senderId: string, id: string) {
    let conversationId = id;

    // Resolve if it's a mentorship connection ID
    const conn = await prisma.mentorshipConnection.findUnique({
      where: { id }
    });

    if (conn) {
      const conversation = await prisma.conversation.findUnique({
        where: { connectionId: conn.id }
      });
      if (!conversation) {
        return []; // No messages sent yet
      }
      conversationId = conversation.id;
    }

    // Verify conversation exists and user is a member
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { connection: true }
    });

    if (!conversation) {
      throw new ApiError(404, 'Conversation not found');
    }

    if (conversation.connection.studentId !== senderId && conversation.connection.alumniId !== senderId) {
      throw new ApiError(403, 'Unauthorized access to conversation history');
    }

    // Mark unread messages from opposite sender as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: senderId },
        isRead: false
      },
      data: { isRead: true }
    });

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            studentProfile: { select: { fullName: true, profileImage: true } },
            alumniProfile: { select: { fullName: true, profileImageUrl: true } }
          }
        }
      }
    });

    return messages;
  }

  /**
   * Fetch all conversations for the user
   */
  async getConversations(userId: string) {
    const connections = await prisma.mentorshipConnection.findMany({
      where: {
        OR: [
          { studentId: userId },
          { alumniId: userId }
        ]
      },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            studentProfile: {
              select: {
                fullName: true,
                profileImage: true,
                branch: true,
                course: true,
                resumeUrl: true
              }
            }
          }
        },
        alumni: {
          select: {
            id: true,
            email: true,
            alumniProfile: {
              select: {
                fullName: true,
                profileImageUrl: true,
                currentCompany: true,
                designation: true
              }
            }
          }
        },
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    const conversationsWithDetails = await Promise.all(
      connections.map(async (conn) => {
        let conversation = conn.conversation;
        if (!conversation) {
          // Auto create conversation if it doesn't exist for some reason
          conversation = await prisma.conversation.create({
            data: { connectionId: conn.id },
            include: { messages: true }
          });
        }

        const isStudent = conn.studentId === userId;
        const partner = isStudent ? conn.alumni : conn.student;
        const partnerProfile = isStudent ? conn.alumni.alumniProfile : conn.student.studentProfile;

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: userId },
            isRead: false
          }
        });

        const lastMessage = conversation.messages[0] || null;

        return {
          id: conversation.id,
          connectionId: conn.id,
          partnerId: partner.id,
          partnerName: partnerProfile?.fullName || 'User',
          partnerImage: isStudent
            ? (partnerProfile as any)?.profileImageUrl
            : (partnerProfile as any)?.profileImage,
          company: isStudent ? (partnerProfile as any)?.currentCompany : null,
          designation: isStudent ? (partnerProfile as any)?.designation : null,
          resumeUrl: !isStudent ? (partnerProfile as any)?.resumeUrl : null,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                message: lastMessage.message,
                senderId: lastMessage.senderId,
                createdAt: lastMessage.createdAt,
                fileUrl: lastMessage.fileUrl,
                fileType: lastMessage.fileType,
                isRead: lastMessage.isRead,
                isSystem: lastMessage.isSystem,
                isResumeReview: lastMessage.isResumeReview
              }
            : null,
          unreadCount
        };
      })
    );

    // Sort by last message date, fallback to connection date
    return conversationsWithDetails.filter(Boolean).sort((a: any, b: any) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }

  /**
   * Mark all messages in a conversation as read
   */
  async markAsRead(userId: string, conversationId: string) {
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });
  }
}
