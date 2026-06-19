import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/error';
import { MentorshipStatus, Role, PrivacySetting, ConnectionStatus } from '@prisma/client';
import { emitToUser } from '../socket';

export class MentorshipService {
  /**
   * Send a Mentorship Request (Student to Alumni)
   */
  async sendMentorshipRequest(studentId: string, alumniId: string, message?: string | null) {
    if (studentId === alumniId) {
      throw new ApiError(400, 'You cannot request mentorship from yourself');
    }

    // Verify student profile
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: { studentProfile: true }
    });
    if (!student || student.role !== Role.STUDENT) {
      throw new ApiError(403, 'Only students can request mentorship');
    }

    // Verify alumni profile
    const alumni = await prisma.user.findUnique({
      where: { id: alumniId },
      include: { alumniProfile: true }
    });
    if (!alumni || alumni.role !== Role.ALUMNI) {
      throw new ApiError(404, 'Alumni user not found');
    }

    // Check if alumni is hidden
    if (alumni.alumniProfile?.privacySetting === PrivacySetting.HIDDEN) {
      throw new ApiError(400, 'This alumnus is not accepting mentorship requests');
    }

    // Check if request already exists
    const existing = await prisma.mentorshipRequest.findFirst({
      where: { studentId, alumniId }
    });

    if (existing) {
      if (existing.status === MentorshipStatus.ACCEPTED) {
        throw new ApiError(400, 'You are already connected as mentor-mentee');
      } else if (existing.status === MentorshipStatus.PENDING) {
        throw new ApiError(400, 'Mentorship request is already pending');
      } else {
        // Reset to pending if rejected/completed before
        const updated = await prisma.mentorshipRequest.update({
          where: { id: existing.id },
          data: { status: MentorshipStatus.PENDING, message, note: null }
        });
        
        // Notify Alumni
        this.notifyUser(alumniId, 'MENTORSHIP_REQUEST', 'Mentorship Request Resubmitted', `${student.studentProfile?.fullName || 'A student'} resubmitted a mentorship request.`);
        return updated;
      }
    }

    // Create request
    const request = await prisma.mentorshipRequest.create({
      data: {
        studentId,
        alumniId,
        status: MentorshipStatus.PENDING,
        message
      }
    });

    // Notify Alumni
    this.notifyUser(alumniId, 'MENTORSHIP_REQUEST', 'New Mentorship Request', `${student.studentProfile?.fullName || 'A student'} requested you to be their mentor.`);

    return request;
  }

  /**
   * Accept Mentorship Request (Alumni)
   */
  async acceptMentorshipRequest(alumniId: string, requestId: string, note?: string | null) {
    const request = await prisma.mentorshipRequest.findUnique({
      where: { id: requestId },
      include: {
        student: { include: { studentProfile: true } },
        alumni: { include: { alumniProfile: true } }
      }
    });

    if (!request) {
      throw new ApiError(404, 'Mentorship request not found');
    }

    if (request.alumniId !== alumniId) {
      throw new ApiError(403, 'You are not authorized to accept this request');
    }

    if (request.status !== MentorshipStatus.PENDING) {
      throw new ApiError(400, `Request status is already ${request.status}`);
    }

    // Update request
    await prisma.mentorshipRequest.update({
      where: { id: requestId },
      data: { status: MentorshipStatus.ACCEPTED, note }
    });

    // Create Mentorship Connection
    const connection = await prisma.mentorshipConnection.create({
      data: {
        studentId: request.studentId,
        alumniId: request.alumniId
      }
    });

    // Create Chat Conversation
    let conversation = await prisma.conversation.findUnique({
      where: { connectionId: connection.id }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { connectionId: connection.id }
      });
    }

    // Send a System announcement message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: request.alumniId,
        message: `Mentorship Request Accepted! Note from mentor: ${note || 'Welcome to the mentorship session! Let us connect.'}`,
        isSystem: true
      }
    });

    // Notify Student
    this.notifyUser(request.studentId, 'MENTORSHIP_ACCEPTED', 'Mentorship Request Approved', `${request.alumni.alumniProfile?.fullName || 'An alumnus'} accepted your mentorship request.`);

    return connection;
  }

  /**
   * Reject Mentorship Request (Alumni)
   */
  async rejectMentorshipRequest(alumniId: string, requestId: string, note?: string | null) {
    const request = await prisma.mentorshipRequest.findUnique({
      where: { id: requestId },
      include: { alumni: { include: { alumniProfile: true } } }
    });

    if (!request) {
      throw new ApiError(404, 'Mentorship request not found');
    }

    if (request.alumniId !== alumniId) {
      throw new ApiError(403, 'You are not authorized to reject this request');
    }

    if (request.status !== MentorshipStatus.PENDING) {
      throw new ApiError(400, `Request status is already ${request.status}`);
    }

    // Update Request
    const updated = await prisma.mentorshipRequest.update({
      where: { id: requestId },
      data: { status: MentorshipStatus.REJECTED, note }
    });

    // Notify Student
    this.notifyUser(request.studentId, 'MENTORSHIP_REJECTED', 'Mentorship Request Declined', `${request.alumni.alumniProfile?.fullName || 'An alumnus'} declined your mentorship request.`);

    return updated;
  }

  /**
   * Get Student's Mentors
   */
  async getMyMentors(studentId: string) {
    const connections = await prisma.mentorshipConnection.findMany({
      where: { studentId },
      include: {
        alumni: {
          select: {
            id: true,
            email: true,
            alumniProfile: {
              include: {
                company: true,
                skillsList: true,
              }
            }
          }
        }
      }
    });

    // Transform and return alumni profiles
    return connections.map(conn => {
      const a = conn.alumni;
      const p = a.alumniProfile;

      return {
        connectionId: conn.id,
        mentorId: a.id,
        fullName: p?.fullName || 'Mentor Member',
        profileImageUrl: p?.profileImageUrl || null,
        passingYear: p?.passingYear || 2020,
        branch: p?.branch || 'CSIT',
        course: p?.course || 'B.Tech',
        currentCompany: p?.currentCompany || null,
        companyLogo: p?.company?.logoUrl || null,
        designation: p?.designation || null,
        experience: p?.experience || 0,
        location: p?.location || null,
        skills: p?.skillsList.map(s => s.name).concat(p?.skills || []) || [],
        mentorshipAvailability: 'AVAILABLE',
        // Private details - shared because they are connected as mentor/mentee
        email: a.email,
        phone: p?.phone || null,
        currentCtc: p?.currentCtc || null,
        linkedinUrl: p?.linkedinUrl || null,
        portfolioUrl: p?.portfolioUrl || null
      };
    });
  }

  /**
   * Get Alumni's Mentees
   */
  async getMyMentees(alumniId: string) {
    const connections = await prisma.mentorshipConnection.findMany({
      where: { alumniId },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            studentProfile: true
          }
        }
      }
    });

    return connections.map(conn => {
      const s = conn.student;
      const p = s.studentProfile;

      return {
        connectionId: conn.id,
        menteeId: s.id,
        fullName: p?.fullName || 'Mentee Student',
        profileImageUrl: p?.profileImage || null,
        branch: p?.branch || 'CSIT',
        course: p?.course || 'B.Tech',
        graduationYear: p?.graduationYear || 2026,
        skills: p?.skills || [],
        bio: p?.bio || null,
        email: s.email,
        phone: p?.phone || null,
        linkedinUrl: p?.linkedinUrl || null,
        githubUrl: p?.githubUrl || null,
        resumeUrl: p?.resumeUrl || null
      };
    });
  }

  /**
   * Get Mentorship Dashboard metrics
   */
  async getDashboardMetrics(userId: string, role: Role) {
    if (role === Role.STUDENT) {
      const connections = await prisma.mentorshipConnection.findMany({
        where: { studentId: userId },
        select: { id: true, alumniId: true }
      });
      const activeMentors = connections.length;
      
      const pendingCount = await prisma.mentorshipRequest.count({
        where: { studentId: userId, status: MentorshipStatus.PENDING }
      });
      const rejectedCount = await prisma.mentorshipRequest.count({
        where: { studentId: userId, status: MentorshipStatus.REJECTED }
      });

      const conversationsCount = await prisma.conversation.count({
        where: {
          connection: {
            studentId: userId
          }
        }
      });

      const resourcesCount = await prisma.sharedResource.count({
        where: { connection: { studentId: userId } }
      });

      const upcomingMeetings = await prisma.meeting.findMany({
        where: {
          connection: { studentId: userId },
          scheduledAt: { gte: new Date() },
          status: 'SCHEDULED'
        },
        orderBy: { scheduledAt: 'asc' },
        include: {
          connection: {
            include: {
              alumni: {
                select: { alumniProfile: { select: { fullName: true } } }
              }
            }
          }
        }
      });

      const sharedResources = await prisma.sharedResource.findMany({
        where: { connection: { studentId: userId } },
        orderBy: { createdAt: 'desc' }
      });

      return {
        stats: {
          activeMentors,
          pendingRequests: pendingCount,
          rejectedRequests: rejectedCount,
          conversations: conversationsCount,
          resourcesShared: resourcesCount
        },
        upcomingMeetings: upcomingMeetings.map(m => ({
          id: m.id,
          title: m.title,
          scheduledAt: m.scheduledAt,
          duration: m.duration,
          meetingLink: m.meetingLink,
          partnerName: m.connection.alumni.alumniProfile?.fullName || 'Mentor'
        })),
        sharedResources
      };
    } else if (role === Role.ALUMNI) {
      const connections = await prisma.mentorshipConnection.findMany({
        where: { alumniId: userId },
        select: { id: true, studentId: true }
      });
      const totalMentees = connections.length;

      const pendingCount = await prisma.mentorshipRequest.count({
        where: { alumniId: userId, status: MentorshipStatus.PENDING }
      });

      const conversationsCount = await prisma.conversation.count({
        where: {
          connection: {
            alumniId: userId
          }
        }
      });

      const resourcesCount = await prisma.sharedResource.count({
        where: { connection: { alumniId: userId } }
      });

      const upcomingMeetings = await prisma.meeting.findMany({
        where: {
          connection: { alumniId: userId },
          scheduledAt: { gte: new Date() },
          status: 'SCHEDULED'
        },
        orderBy: { scheduledAt: 'asc' },
        include: {
          connection: {
            include: {
              student: {
                select: { studentProfile: { select: { fullName: true } } }
              }
            }
          }
        }
      });

      const sharedResources = await prisma.sharedResource.findMany({
        where: { connection: { alumniId: userId } },
        orderBy: { createdAt: 'desc' }
      });

      const pendingRequests = await prisma.mentorshipRequest.findMany({
        where: { alumniId: userId, status: MentorshipStatus.PENDING },
        include: {
          student: {
            select: {
              id: true,
              studentProfile: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        stats: {
          totalMentees,
          pendingRequests: pendingCount,
          activeConversations: conversationsCount,
          resourcesShared: resourcesCount
        },
        upcomingMeetings: upcomingMeetings.map(m => ({
          id: m.id,
          title: m.title,
          scheduledAt: m.scheduledAt,
          duration: m.duration,
          meetingLink: m.meetingLink,
          partnerName: m.connection.student.studentProfile?.fullName || 'Student'
        })),
        sharedResources,
        requestsList: pendingRequests.map(r => ({
          id: r.id,
          studentName: r.student.studentProfile?.fullName || 'Student',
          studentBranch: r.student.studentProfile?.branch || 'CSIT',
          studentCourse: r.student.studentProfile?.course || 'B.Tech',
          studentYear: r.student.studentProfile?.graduationYear || 2026,
          studentImageUrl: r.student.studentProfile?.profileImage || null,
          message: r.message,
          createdAt: r.createdAt
        }))
      };
    }
    
    throw new ApiError(400, 'Invalid user role for mentorship dashboard');
  }

  /**
   * Schedule a Meeting
   */
  async scheduleMeeting(userId: string, data: { connectionId: string; title: string; description?: string | null; scheduledAt: string; duration: number; meetingLink?: string | null }) {
    const connection = await prisma.mentorshipConnection.findUnique({
      where: { id: data.connectionId }
    });

    if (!connection) {
      throw new ApiError(404, 'Mentorship connection not found');
    }

    if (connection.alumniId !== userId && connection.studentId !== userId) {
      throw new ApiError(403, 'You are not a member of this mentorship session');
    }

    const meeting = await prisma.meeting.create({
      data: {
        connectionId: data.connectionId,
        title: data.title,
        description: data.description,
        scheduledAt: new Date(data.scheduledAt),
        duration: data.duration,
        meetingLink: data.meetingLink,
        status: 'SCHEDULED'
      }
    });

    // Create system message in chat
    const conversation = await prisma.conversation.findUnique({
      where: { connectionId: data.connectionId }
    });

    if (conversation) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          message: `📅 Meeting Scheduled: "${data.title}" on ${new Date(data.scheduledAt).toLocaleString()}. Duration: ${data.duration} mins. Link: ${data.meetingLink || 'Not provided'}`,
          isSystem: true
        }
      });
    }

    const partnerId = connection.alumniId === userId ? connection.studentId : connection.alumniId;
    this.notifyUser(partnerId, 'EVENT_REMINDER', 'New Meeting Scheduled', `A new mentorship session "${data.title}" has been scheduled for you.`);

    return meeting;
  }

  /**
   * Share a Resource
   */
  async shareResource(userId: string, data: { connectionId: string; title: string; description?: string | null; fileUrl?: string | null; linkUrl?: string | null }) {
    const connection = await prisma.mentorshipConnection.findUnique({
      where: { id: data.connectionId }
    });

    if (!connection) {
      throw new ApiError(404, 'Mentorship connection not found');
    }

    if (connection.alumniId !== userId && connection.studentId !== userId) {
      throw new ApiError(403, 'You are not a member of this mentorship session');
    }

    const resource = await prisma.sharedResource.create({
      data: {
        connectionId: data.connectionId,
        title: data.title,
        description: data.description,
        fileUrl: data.fileUrl,
        linkUrl: data.linkUrl,
        sharedById: userId
      }
    });

    // Create system message in chat
    const conversation = await prisma.conversation.findUnique({
      where: { connectionId: data.connectionId }
    });

    if (conversation) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          message: `📁 Resource Shared: "${data.title}". Description: ${data.description || 'N/A'}. Link/Download: ${data.fileUrl || data.linkUrl || 'N/A'}`,
          isSystem: true
        }
      });
    }

    const partnerId = connection.alumniId === userId ? connection.studentId : connection.alumniId;
    this.notifyUser(partnerId, 'SYSTEM', 'New Resource Shared', `A new learning resource "${data.title}" has been shared with you.`);

    return resource;
  }

  /**
   * Private: Write notification to DB and emit to socket client
   */
  private async notifyUser(userId: string, type: any, title: string, message: string) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          linkUrl: '/student/dashboard'
        }
      });
      emitToUser(userId, 'notification', notification);
    } catch (err) {
      console.error('Failed to create/emit notification:', err);
    }
  }
}
