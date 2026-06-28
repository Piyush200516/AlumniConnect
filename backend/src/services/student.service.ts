// src/services/student.service.ts
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/error';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { JobApprovalStatus, PortalApplicationStatus, VerificationStatus } from '@prisma/client';
import { logger } from '../utils/logger';

// Configure Cloudinary if environment variables exist
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

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
    profilePhotoUrl: string | null;
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
    profilePhotoUrl: profile.profilePhotoUrl || profile.profileImage,
    isVerified: verificationStatus === VerificationStatus.VERIFIED,
    verificationStatus,
  };
};

export const uploadFile = async (file: Express.Multer.File, folder: string): Promise<string> => {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `alumniconnect/${folder}` },
        (error, result) => {
          if (error) return reject(error);
          resolve(result?.secure_url || '');
        }
      );
      const readable = new Readable();
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  } else {
    // Local fallback storage
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    // Create unique filename
    const ext = path.extname(file.originalname);
    const filename = `${folder}_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filePath, file.buffer);

    // Return backend server URL
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5002}`;
    return `${backendUrl}/uploads/${filename}`;
  }
};

export class StudentService {
  async getProfileByUserId(userId: string) {
  logger.debug(`Fetching profile and application for userId=${userId}`);
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

    if (!profile) {
      throw new ApiError(404, 'Student profile not found');
    }

    const result = mapProfileResponse(profile, application?.status);
  logger.debug(`Fetched profile result: ${JSON.stringify(result)}`);
  return result;
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

    // Handle file uploads
    if (files?.profileImage?.[0]) {
      // Store the uploaded image URL in the new profilePhotoUrl field
      updateData.profilePhotoUrl = await uploadFile(files.profileImage[0], 'profiles');
    }
    if (files?.resume?.[0]) {
      updateData.resumeUrl = await uploadFile(files.resume[0], 'resumes');
    }

    logger.debug(`Executing profile update and fetching application for userId=${userId}`);
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
  logger.debug(`Updated profile result: ${JSON.stringify(updatedResult)}`);
  return updatedResult;
  }

  async getDashboardData(userId: string) {
  logger.debug(`Fetching dashboard data for userId=${userId}`);
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

    if (!profile) {
      throw new ApiError(404, 'Student profile not found');
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
      logger.debug(`Dashboard data assembled: ${JSON.stringify(dashboardResponse)}`);
      return dashboardResponse;
  }
}
