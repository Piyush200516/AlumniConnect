import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/error';
import { 
  createJobSchema, 
  editJobSchema, 
  applyJobSchema,
  updateJobApprovalSchema,
  updateApplicationStatusSchema
} from '../validators/job.validator';
import { 
  JobType, 
  ApplicationStatus, 
  JobApprovalStatus, 
  Role, 
  PortalApplicationStatus 
} from '@prisma/client';

const studentVisibleJobStatuses: JobApprovalStatus[] = [
  JobApprovalStatus.APPROVED,
  JobApprovalStatus.PENDING,
];
const studentVisibleJobStatusSet = new Set<JobApprovalStatus>(studentVisibleJobStatuses);

export class JobService {
  /**
   * Fetch list of jobs based on roles and filters
   */
  async getJobs(filters: {
    search?: string;
    jobType?: string;
    location?: string;
    skills?: string; // Comma separated list of skills
    tab?: 'all' | 'saved' | 'applied';
  }, userId?: string) {
    // 1. Fetch user role
    const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    
    const whereClause: any = {};

    // Role-based visibility
    if (!user || user.role === Role.STUDENT) {
      // Students can browse approved jobs and alumni posts that are still pending CDC review
      whereClause.approvalStatus = { in: studentVisibleJobStatuses };
      whereClause.isActive = true;
    } else if (user.role === Role.ALUMNI) {
      // Alumni see jobs they posted
      if (filters.tab !== 'all') {
        whereClause.postedById = userId;
      }
    }
    // CDC sees all jobs by default (moderation panel)

    // Apply Search filters
    if (filters.search) {
      whereClause.AND = [
        ...(whereClause.AND ?? []),
        {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { company: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ]
        }
      ];
    }

    if (filters.jobType && filters.jobType !== 'ALL') {
      whereClause.jobType = filters.jobType as JobType;
    }

    if (filters.location && filters.location !== 'ALL') {
      whereClause.location = { contains: filters.location, mode: 'insensitive' };
    }

    if (filters.skills) {
      const skillsList = filters.skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      if (skillsList.length > 0) {
        whereClause.skillsRequired = {
          hasSome: skillsList
        };
      }
    }

    // Student tab logic: saved / applied
    if (user?.role === Role.STUDENT) {
      if (filters.tab === 'saved') {
        whereClause.savedBy = {
          some: { userId }
        };
      } else if (filters.tab === 'applied') {
        whereClause.applications = {
          some: { applicantId: userId }
        };
      }
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        postedBy: {
          select: {
            role: true,
            email: true,
            alumniProfile: {
              select: {
                fullName: true,
                profileImageUrl: true,
                designation: true,
                currentCompany: true,
              }
            },
            cdcProfile: {
              select: {
                collegeName: true,
                department: true,
              }
            }
          }
        },
        savedBy: userId ? {
          where: { userId }
        } : false,
        applications: userId ? {
          where: { applicantId: userId }
        } : false,
        _count: {
          select: {
            applications: true
          }
        }
      }
    });

    return jobs;
  }

  /**
   * Fetch single job by ID with applicant details
   */
  async getJobById(jobId: string, userId?: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        postedBy: {
          select: {
            role: true,
            email: true,
            alumniProfile: {
              select: {
                fullName: true,
                profileImageUrl: true,
                designation: true,
                currentCompany: true,
                bio: true,
                linkedinUrl: true,
              }
            },
            cdcProfile: {
              select: {
                collegeName: true,
                department: true,
              }
            }
          }
        },
        savedBy: userId ? {
          where: { userId }
        } : false,
        applications: userId ? {
          where: { applicantId: userId }
        } : false
      }
    });

    if (!job) {
      throw new ApiError(404, 'Job opportunity not found');
    }

    const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    const isVisibleToStudents = job.isActive && studentVisibleJobStatusSet.has(job.approvalStatus);

    if (!user || user.role === Role.STUDENT) {
      if (!isVisibleToStudents) {
        throw new ApiError(404, 'Job opportunity not found');
      }
    }

    return job;
  }

  /**
   * Create Job Opportunity
   */
  async createJob(postedById: string, payload: any) {
    const creator = await prisma.user.findUnique({
      where: { id: postedById }
    });

    if (!creator || creator.role === Role.STUDENT) {
      throw new ApiError(403, 'Students are not authorized to post jobs');
    }

    const validated = createJobSchema.parse(payload);

    // Business rule: CDC posts auto-approved. Alumni posts require review.
    const approvalStatus = creator.role === Role.CDC 
      ? JobApprovalStatus.APPROVED 
      : JobApprovalStatus.PENDING;

    const job = await prisma.job.create({
      data: {
        postedById,
        title: validated.title,
        description: validated.description,
        company: validated.company,
        companyLogo: validated.companyLogo || null,
        location: validated.location || null,
        salary: validated.salary || null,
        jobType: validated.jobType,
        skillsRequired: validated.skillsRequired,
        deadline: validated.deadline,
        responsibilities: validated.responsibilities || null,
        eligibility: validated.eligibility || null,
        benefits: validated.benefits || null,
        selectionProcess: validated.selectionProcess || null,
        applicationLink: validated.applicationLink || null,
        approvalStatus,
        isActive: true,
      }
    });

    // Notify students immediately if CDC posted it
    if (approvalStatus === JobApprovalStatus.APPROVED) {
      await this.notifyStudentsOfNewJob(job);
    }

    return job;
  }

  /**
   * Edit Job Opportunity
   */
  async editJob(jobId: string, userId: string, payload: any) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new ApiError(404, 'Job not found');
    }

    // Verify ownership or CDC role
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (job.postedById !== userId && user?.role !== Role.CDC) {
      throw new ApiError(403, 'Not authorized to modify this job posting');
    }

    const validated = editJobSchema.parse(payload);

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: {
        title: validated.title ?? undefined,
        description: validated.description ?? undefined,
        company: validated.company ?? undefined,
        companyLogo: validated.companyLogo !== undefined ? validated.companyLogo : undefined,
        location: validated.location !== undefined ? validated.location : undefined,
        salary: validated.salary !== undefined ? validated.salary : undefined,
        jobType: validated.jobType ?? undefined,
        skillsRequired: validated.skillsRequired ?? undefined,
        deadline: validated.deadline !== undefined ? validated.deadline : undefined,
        responsibilities: validated.responsibilities !== undefined ? validated.responsibilities : undefined,
        eligibility: validated.eligibility !== undefined ? validated.eligibility : undefined,
        benefits: validated.benefits !== undefined ? validated.benefits : undefined,
        selectionProcess: validated.selectionProcess !== undefined ? validated.selectionProcess : undefined,
        applicationLink: validated.applicationLink !== undefined ? validated.applicationLink : undefined,
        isActive: validated.isActive ?? undefined,
      }
    });

    return updated;
  }

  /**
   * Student: Apply for Job
   */
  async applyForJob(studentId: string, jobId: string, payload: any) {
    // 1. Verify eligibility criteria
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentId }
    });
    const studentApp = await prisma.studentApplication.findUnique({
      where: { userId: studentId }
    });

    const isProfileComplete = !!(studentProfile && studentProfile.phone && studentProfile.profileImage);
    const isAppSubmitted = !!(studentApp && studentApp.status === PortalApplicationStatus.APPROVED);
    
    if (!isProfileComplete || !isAppSubmitted) {
      let missingMsg = 'You are not eligible to apply. Missing requirements:';
      if (!isProfileComplete) missingMsg += ' Profile is incomplete;';
      if (!isAppSubmitted) missingMsg += ' Application must be verified & approved by CDC;';
      throw new ApiError(400, missingMsg);
    }

    // 2. Query job details
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      throw new ApiError(404, 'Job not found');
    }

    if (!job.isActive || !studentVisibleJobStatusSet.has(job.approvalStatus)) {
      throw new ApiError(400, 'Applications are not open for this job opportunity');
    }

    if (job.deadline && new Date() > new Date(job.deadline)) {
      throw new ApiError(400, 'Application deadline has passed');
    }

    const validated = applyJobSchema.parse(payload);

    // Existing application check
    const existing = await prisma.jobApplication.findUnique({
      where: {
        jobId_applicantId: { jobId, applicantId: studentId }
      }
    });

    if (existing) {
      throw new ApiError(400, 'You have already applied for this job');
    }

    // 3. Create application
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        applicantId: studentId,
        resumeUrl: validated.resumeUrl,
        coverLetter: validated.coverLetter || null,
        status: ApplicationStatus.APPLIED,
      },
      include: {
        job: true,
        applicant: {
          select: {
            email: true,
            studentProfile: {
              select: {
                fullName: true
              }
            }
          }
        }
      }
    });

    // 4. Send Notification to Job Poster
    try {
      await prisma.notification.create({
        data: {
          userId: job.postedById,
          type: 'JOB_APPLICATION',
          title: `New Applicant for ${job.title}`,
          message: `${application.applicant.studentProfile?.fullName || 'A student'} has applied for the ${job.title} position.`,
          linkUrl: `/alumni/dashboard` // Alumni dashboard tab for candidate tracking
        }
      });
    } catch (err) {
      console.error('Failed to create notification for alumni job posting application:', err);
    }

    return application;
  }

  /**
   * Alumni: Update candidate application status
   */
  async updateApplicationStatus(alumniId: string, applicationId: string, payload: any) {
    const validated = updateApplicationStatusSchema.parse(payload);

    // Verify application existence and that job creator is matching alumniId
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
      }
    });

    if (!application) {
      throw new ApiError(404, 'Job application not found');
    }

    const user = await prisma.user.findUnique({ where: { id: alumniId } });
    if (application.job.postedById !== alumniId && user?.role !== Role.CDC) {
      throw new ApiError(403, 'Not authorized to manage applications for this job');
    }

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: validated.status
      },
      include: {
        job: true
      }
    });

    // Notify student applicant
    try {
      await prisma.notification.create({
        data: {
          userId: application.applicantId,
          type: 'APPLICATION_UPDATE',
          title: `Application Update: ${application.job.title}`,
          message: `Your application status for ${application.job.title} at ${application.job.company} has been updated to ${validated.status}.`,
          linkUrl: `/student/dashboard` // redirects to student applications tab
        }
      });
    } catch (err) {
      console.error('Failed to notify student of job application status update:', err);
    }

    return updated;
  }

  /**
   * Student: Bookmark / Unbookmark Job
   */
  async toggleSaveJob(userId: string, jobId: string) {
    const existing = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: { userId, jobId }
      }
    });

    if (existing) {
      // Remove bookmark
      await prisma.savedJob.delete({
        where: { id: existing.id }
      });
      return { saved: false, message: 'Removed bookmark successfully' };
    } else {
      // Add bookmark
      await prisma.savedJob.create({
        data: {
          userId,
          jobId
        }
      });
      return { saved: true, message: 'Job bookmarked successfully' };
    }
  }

  /**
   * Alumni / CDC: List Applicants for a specific job
   */
  async getJobApplicants(userId: string, jobId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new ApiError(404, 'Job not found');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (job.postedById !== userId && user?.role !== Role.CDC) {
      throw new ApiError(403, 'Not authorized to view applicants for this job');
    }

    const applicants = await prisma.jobApplication.findMany({
      where: { jobId },
      include: {
        applicant: {
          select: {
            id: true,
            email: true,
            studentProfile: {
              select: {
                fullName: true,
                branch: true,
                course: true,
                graduationYear: true,
                phone: true,
                skills: true,
                resumeUrl: true,
                profileImage: true,
              }
            },
            studentApplication: {
              select: {
                currentCGPA: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return applicants;
  }

  /**
   * CDC Admin: Approve/Reject job posting
   */
  async approveOrRejectJob(jobId: string, approvalStatus: JobApprovalStatus, remarks?: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new ApiError(404, 'Job posting not found');
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: {
        approvalStatus,
        remarks: remarks || null,
        // Auto active on approval, inactive on rejection
        isActive: approvalStatus === JobApprovalStatus.APPROVED ? true : job.isActive
      }
    });

    // Notify students on new approved job
    if (approvalStatus === JobApprovalStatus.APPROVED) {
      await this.notifyStudentsOfNewJob(updated);
    }

    // Notify the posting alumni
    try {
      await prisma.notification.create({
        data: {
          userId: job.postedById,
          type: 'SYSTEM',
          title: `Job Post Status: ${job.title}`,
          message: `Your job posting for "${job.title}" has been ${approvalStatus.toLowerCase()} by the CDC.${remarks ? ` Remarks: ${remarks}` : ''}`,
          linkUrl: `/alumni/dashboard`
        }
      });
    } catch (err) {
      console.error('Failed to notify alumni of job approval verdict:', err);
    }

    return updated;
  }

  /**
   * Helper: Notify students of a newly approved job posting
   */
  private async notifyStudentsOfNewJob(job: any) {
    try {
      const students = await prisma.user.findMany({
        where: { role: Role.STUDENT }
      });

      if (students.length > 0) {
        await prisma.notification.createMany({
          data: students.map(s => ({
            userId: s.id,
            type: 'JOB_POSTED',
            title: `New Job: ${job.title} at ${job.company}`,
            message: `${job.company} is looking for a ${job.title}. Apply now before the deadline on ${job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}!`,
            linkUrl: `/student/dashboard` // student opportunities page
          }))
        });
      }
    } catch (err) {
      console.error('Failed to create bulk student notifications for new job posting:', err);
    }
  }
}

export default JobService;
