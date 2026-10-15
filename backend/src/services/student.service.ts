// src/services/student.service.ts
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/error';
import { JobApprovalStatus, PortalApplicationStatus, VerificationStatus, Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import { uploadFile } from './upload.service';



const resolveVerificationStatus = (
  profileStatus: VerificationStatus,
  applicationStatus?: PortalApplicationStatus | null
) => {
  if (applicationStatus === PortalApplicationStatus.APPROVED) {
    return VerificationStatus.VERIFIED;
  }

  if (applicationStatus === PortalApplicationStatus.REJECTED) {
    return VerificationStatus.REJECTED;
  }

  if (
    applicationStatus === PortalApplicationStatus.SUBMITTED ||
    applicationStatus === PortalApplicationStatus.UNDER_VERIFICATION
  ) {
    return VerificationStatus.PENDING;
  }

  return profileStatus;
};

const mapProfileResponse = (
  profile: {
    id: string;
    fullName: string;
    enrollmentNumber: string;
    branch: string;
    course: string;
    graduationYear: number;
    phone: string | null;
    bio: string | null;
    skills: string[];
    linkedinUrl: string | null;
    githubUrl: string | null;
    resumeUrl: string | null;
    profileImage: string | null;
    isVerified: boolean;
    verificationStatus: VerificationStatus;
    user: { email: string };
  },
  applicationStatus?: PortalApplicationStatus | null
) => {
  const verificationStatus = resolveVerificationStatus(profile.verificationStatus, applicationStatus);

  return {
    id: profile.id,
    fullName: profile.fullName,
    email: profile.user.email,
    enrollmentNumber: profile.enrollmentNumber,
    branch: profile.branch,
    course: profile.course,
    graduationYear: profile.graduationYear,
    phone: profile.phone,
    bio: profile.bio,
    skills: profile.skills,
    linkedinUrl: profile.linkedinUrl,
    githubUrl: profile.githubUrl,
    resumeUrl: profile.resumeUrl,
    profilePhotoUrl: profile.profileImage,
    isVerified: verificationStatus === VerificationStatus.VERIFIED,
    verificationStatus,
  };
};



export class StudentService {
  async getProfileByUserId(userId: string) {
    logger.debug(`[StudentService.getProfileByUserId] START — userId=${userId}`);
    try {
      let [profile, application] = await Promise.all([
        prisma.studentProfile.findUnique({
          where: { userId },
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        }),
        prisma.studentApplication.findUnique({
          where: { userId },
          select: {
            status: true,
          },
        }),
      ]);

      logger.debug(`[StudentService.getProfileByUserId] Prisma returned — profile exists: ${!!profile}, application exists: ${!!application}`);

      if (!profile) {
        // Query user record directly from Prisma using userId from auth middleware
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          logger.warn(`[StudentService.getProfileByUserId] User record not found for userId=${userId}`);
          throw new ApiError(404, 'User account not found');
        }

        // Auto-create initial StudentProfile for user so frontend receives complete profile object
        profile = await prisma.studentProfile.create({
          data: {
            userId,
            fullName: user.email.split('@')[0] || 'Student',
            enrollmentNumber: `STU-${userId.slice(0, 8).toUpperCase()}`,
            branch: 'General',
            course: 'B.Tech',
            graduationYear: new Date().getFullYear(),
          },
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        });
        logger.info(`[StudentService.getProfileByUserId] Auto-created initial StudentProfile for userId=${userId}`);
      }

      const result = mapProfileResponse(profile, application?.status);
      logger.debug(`[StudentService.getProfileByUserId] Mapped response: ${JSON.stringify(result)}`);
      return result;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        logger.error(`[StudentService.getProfileByUserId] Prisma error code=${err.code} meta=${JSON.stringify(err.meta)} stack=${err.stack}`);
      } else {
        logger.error(`[StudentService.getProfileByUserId] Unexpected error: ${err instanceof Error ? err.stack : JSON.stringify(err)}`);
      }
      throw err;
    }
  }

  async updateProfile(
    userId: string,
    data: any,
    files?: { profileImage?: Express.Multer.File[]; resume?: Express.Multer.File[] }
  ) {
    const updateData: any = {};

    // Map fields
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.branch !== undefined) updateData.branch = data.branch;
    if (data.course !== undefined) updateData.course = data.course;
    if (data.graduationYear !== undefined) updateData.graduationYear = Number(data.graduationYear);
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.linkedinUrl !== undefined) updateData.linkedinUrl = data.linkedinUrl;
    if (data.githubUrl !== undefined) updateData.githubUrl = data.githubUrl;

    // Handle skills parsing
    if (data.skills !== undefined) {
      if (Array.isArray(data.skills)) {
        updateData.skills = data.skills;
      } else if (typeof data.skills === 'string') {
        updateData.skills = data.skills
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
    }

    // Handle file uploads — delegate to centralized upload.service
    if (files?.profileImage?.[0]) {
      // profileImage field maps to DB column profileImageUrl
      const { url } = await uploadFile(files.profileImage[0], 'avatars', 'image');
      updateData.profileImage = url;
    }
    if (files?.resume?.[0]) {
      const { url } = await uploadFile(files.resume[0], 'resumes', 'raw');
      updateData.resumeUrl = url;
    }

    logger.debug(`[StudentService.updateProfile] Executing update with data: ${JSON.stringify(updateData)} for userId=${userId}`);
    try {
      const [updatedProfile, application] = await Promise.all([
        prisma.studentProfile.update({
          where: { userId },
          data: updateData,
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        }),
        prisma.studentApplication.findUnique({
          where: { userId },
          select: {
            status: true,
          },
        }),
      ]);

      const updatedResult = mapProfileResponse(updatedProfile, application?.status);
      logger.debug(`[StudentService.updateProfile] Updated profile result: ${JSON.stringify(updatedResult)}`);
      return updatedResult;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        logger.error(`[StudentService.updateProfile] Prisma error code=${err.code} meta=${JSON.stringify(err.meta)} stack=${err.stack}`);
        if (err.code === 'P2025') {
          throw new ApiError(404, 'Student profile not found. Cannot update a non-existent profile.');
        }
      } else {
        logger.error(`[StudentService.updateProfile] Unexpected error: ${err instanceof Error ? err.stack : JSON.stringify(err)}`);
      }
      throw err;
    }
  }

  async getDashboardData(userId: string) {
    logger.debug(`[StudentService.getDashboardData] START — userId=${userId}`);
    try {
    // 1. Fetch profile details first (for completion percentage)
    const [profile, application] = await Promise.all([
      prisma.studentProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      }),
      prisma.studentApplication.findUnique({
        where: { userId },
        select: {
          status: true,
        },
      }),
    ]);

    logger.debug(`[StudentService.getDashboardData] Profile exists: ${!!profile}, Application exists: ${!!application}`);

    if (!profile) {
      logger.warn(`[StudentService.getDashboardData] No student profile found for userId=${userId}`);
      throw new ApiError(404, 'Student profile not found. Please complete your student registration first.');
    }

    // 2. Fetch all other dashboard metrics in parallel using Promise.all
    const [
      jobsCount,
      eventsCount,
      mentorsCount,
      unreadMessagesCount,
      recentJobs,
      upcomingEvents,
      recentNotifications,
      suggestedMentors
    ] = await Promise.all([
      // Count visible job opportunities for students
      prisma.job.count({
        where: {
          isActive: true,
          approvalStatus: {
            in: [JobApprovalStatus.APPROVED, JobApprovalStatus.PENDING]
          }
        },
      }),
      // Count upcoming events
      prisma.event.count({
        where: {
          approvalStatus: 'APPROVED',
          status: 'PUBLISHED',
          eventDate: { gte: new Date() },
        },
      }),
      // Count available mentors (role ALUMNI)
      prisma.user.count({
        where: { role: 'ALUMNI', status: 'ACTIVE' },
      }),
      // Count unread messages
      prisma.message.count({
        where: {
          conversation: {
            connection: {
              OR: [
                { studentId: userId },
                { alumniId: userId },
              ],
            },
          },
          senderId: { not: userId },
          isRead: false,
        },
      }),
      // Recent Jobs (limit 5)
      prisma.job.findMany({
        where: {
          isActive: true,
          approvalStatus: {
            in: [JobApprovalStatus.APPROVED, JobApprovalStatus.PENDING]
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          jobType: true,
          createdAt: true,
        },
      }),
      // Upcoming approved events (limit 5)
      prisma.event.findMany({
        where: {
          approvalStatus: 'APPROVED',
          status: 'PUBLISHED',
          eventDate: { gte: new Date() },
        },
        orderBy: { eventDate: 'asc' },
        take: 5,
        select: {
          id: true,
          title: true,
          category: true,
          mode: true,
          eventDate: true,
          eventTime: true,
          venue: true,
          bannerUrl: true,
          availableSeats: true,
          totalSeats: true,
          registrationDeadline: true,
          speakerName: true,
          speakerCompany: true,
        },
      }),
      // Recent notifications (limit 5)
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          isRead: true,
          linkUrl: true,
          createdAt: true,
        },
      }),
      // Suggested Mentors (limit 5 alumni profiles)
      prisma.alumniProfile.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          fullName: true,
          designation: true,
          currentCompany: true,
          skills: true,
          profileImageUrl: true,
        },
      }),
    ]);

    // Calculate completeness percentage
    let completionPercentage = 0;
    let basic = 0;
    if (profile.fullName) basic += 10;
    if (profile.enrollmentNumber) basic += 5;
    if (profile.branch) basic += 5;
    if (profile.course) basic += 5;
    if (profile.graduationYear) basic += 5;

    let contact = 0;
    if (profile.user.email) contact += 10;
    if (profile.phone) contact += 10;

    let social = 0;
    if (profile.linkedinUrl) social += 10;
    if (profile.githubUrl) social += 10;

    let skills = profile.skills && profile.skills.length > 0 ? 15 : 0;
    let resume = profile.resumeUrl ? 15 : 0;

    completionPercentage = basic + contact + social + skills + resume;

    const dashboardResponse = {
        profileSummary: {
          ...mapProfileResponse(profile, application?.status),
        },
        profileCompletion: completionPercentage,
        dashboardStats: {
          jobsCount,
          eventsCount,
          mentorsCount,
          unreadMessagesCount,
        },
        recentJobs,
        upcomingEvents,
        recentNotifications,
        suggestedMentors,
      };
      logger.debug(`[StudentService.getDashboardData] Dashboard response assembled successfully for userId=${userId}`);
      return dashboardResponse;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        logger.error(`[StudentService.getDashboardData] Prisma error code=${err.code} meta=${JSON.stringify(err.meta)} stack=${err.stack}`);
      } else {
        logger.error(`[StudentService.getDashboardData] Unexpected error: ${err instanceof Error ? err.stack : JSON.stringify(err)}`);
      }
      throw err;
    }
  }
}
