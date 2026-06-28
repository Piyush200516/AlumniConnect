import { prisma } from '../lib/prisma';
import {
  Role,
  ApplicationStatus,
  PortalApplicationStatus,
  EventApprovalStatus,
  EventStatus,
  JobApprovalStatus,
} from '@prisma/client';

export class CdcService {
  async getDashboard() {
    const now = new Date();

    const [
      studentUsersCount,
      alumniUsersCount,
      applications,
      alumni,
      events,
      jobs,
      offeredApplications,
      upcomingEventsCount,
      pendingEventCount,
      activeJobsCount,
    ] = await prisma.$transaction([
      prisma.user.count({ where: { role: Role.STUDENT } }),
      prisma.user.count({ where: { role: Role.ALUMNI } }),
      prisma.studentApplication.findMany({
        orderBy: { submittedAt: 'desc' },
        include: {
          certifications: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      }),
      prisma.alumniProfile.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
            },
          },
          company: true,
        },
      }),
      prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              role: true,
              email: true,
              alumniProfile: {
                select: {
                  fullName: true,
                },
              },
              cdcProfile: {
                select: {
                  collegeName: true,
                },
              },
            },
          },
          _count: {
            select: {
              registrations: true,
            },
          },
        },
      }),
      prisma.job.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          postedBy: {
            select: {
              id: true,
              role: true,
              email: true,
              alumniProfile: {
                select: {
                  fullName: true,
                  currentCompany: true,
                  designation: true,
                },
              },
              cdcProfile: {
                select: {
                  collegeName: true,
                },
              },
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
      prisma.jobApplication.findMany({
        where: { status: ApplicationStatus.OFFERED },
        orderBy: { updatedAt: 'desc' },
        include: {
          applicant: {
            select: {
              id: true,
              email: true,
              studentProfile: {
                select: {
                  fullName: true,
                  enrollmentNumber: true,
                  branch: true,
                  course: true,
                  graduationYear: true,
                  phone: true,
                },
              },
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              company: true,
            },
          },
        },
      }),
      prisma.event.count({
        where: {
          approvalStatus: EventApprovalStatus.APPROVED,
          status: EventStatus.PUBLISHED,
          eventDate: { gte: now },
        },
      }),
      prisma.event.count({
        where: {
          approvalStatus: EventApprovalStatus.PENDING,
        },
      }),
      prisma.job.count({
        where: {
          isActive: true,
          approvalStatus: { in: [JobApprovalStatus.APPROVED, JobApprovalStatus.PENDING] },
        },
      }),
    ]);

    const verifiedApplications = applications.filter(
      (application) => application.status === PortalApplicationStatus.APPROVED
    );
    const pendingApplications = applications.filter(
      (application) => application.status === PortalApplicationStatus.SUBMITTED || application.status === PortalApplicationStatus.UNDER_VERIFICATION || application.status === PortalApplicationStatus.DRAFT
    );

    const placedMap = new Map<string, any>();
    for (const application of offeredApplications) {
      if (!placedMap.has(application.applicantId)) {
        placedMap.set(application.applicantId, {
          id: application.applicantId,
          name: application.applicant.studentProfile?.fullName || 'Student',
          email: application.applicant.email,
          enrollmentNumber: application.applicant.studentProfile?.enrollmentNumber || '',
          branch: application.applicant.studentProfile?.branch || '',
          course: application.applicant.studentProfile?.course || '',
          graduationYear: application.applicant.studentProfile?.graduationYear || null,
          phone: application.applicant.studentProfile?.phone || null,
          company: application.job.company,
          jobTitle: application.job.title,
          status: application.status,
          updatedAt: application.updatedAt,
        });
      }
    }

    const placedStudents = Array.from(placedMap.values());

    return {
      stats: {
        studentUsersCount,
        alumniUsersCount,
        totalApplications: applications.length,
        verifiedApplications: verifiedApplications.length,
        pendingApplications: pendingApplications.length,
        placedStudentsCount: placedStudents.length,
        upcomingEventsCount,
        pendingEventCount,
        activeJobsCount,
      },
      applications,
      alumni,
      placedStudents,
      events,
      jobs,
    };
  }
}

export default CdcService;
