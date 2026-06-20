import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/error';
import { saveDraftSchema, submitApplicationSchema, allowedUpdatesSchema } from '../validators/application.validator';
import { PortalApplicationStatus, VerificationStatus } from '@prisma/client';

export class ApplicationService {
  /**
   * Fetch current user's application
   */
  async getByUserId(userId: string) {
    const application = await prisma.studentApplication.findUnique({
      where: { userId },
      include: {
        certifications: true,
      },
    });
    return application;
  }

  /**
   * Fetch application by ID (CDC / Owner review)
   */
  async getById(id: string) {
    const application = await prisma.studentApplication.findUnique({
      where: { id },
      include: {
        certifications: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!application) {
      throw new ApiError(404, 'Application not found');
    }

    return application;
  }

  /**
   * Save draft application
   */
  async saveDraft(userId: string, payload: any) {
    // Check if application is already submitted
    const existing = await prisma.studentApplication.findUnique({
      where: { userId },
    });

    if (existing && existing.status !== PortalApplicationStatus.DRAFT) {
      throw new ApiError(400, `Application is locked. Current status: ${existing.status}`);
    }

    // Parse and validate draft fields (lax rules, everything optional)
    const data = saveDraftSchema.parse(payload);
    const { certifications, ...formFields } = data;

    // Use transaction to update/insert student application and certifications
    const result = await prisma.$transaction(async (tx) => {
      const app = await tx.studentApplication.upsert({
        where: { userId },
        create: {
          userId,
          status: PortalApplicationStatus.DRAFT,
          fullName: formFields.fullName || '',
          enrollmentNumber: formFields.enrollmentNumber || '',
          email: formFields.email || '',
          phone: formFields.phone || '',
          gender: formFields.gender || '',
          dateOfBirth: formFields.dateOfBirth || new Date(0),
          profileImage: formFields.profileImage || '',
          aadharNumber: formFields.aadharNumber || '',
          panCard: formFields.panCard || null,
          collegeIdNumber: formFields.collegeIdNumber || '',
          fatherName: formFields.fatherName || '',
          fatherOccupation: formFields.fatherOccupation || '',
          fatherPhone: formFields.fatherPhone || '',
          motherName: formFields.motherName || '',
          motherOccupation: formFields.motherOccupation || '',
          motherPhone: formFields.motherPhone || '',
          familyIncome: formFields.familyIncome || '',
          emergencyContact: formFields.emergencyContact || '',
          currentAddress: formFields.currentAddress || '',
          currentCity: formFields.currentCity || '',
          currentState: formFields.currentState || '',
          currentPincode: formFields.currentPincode || '',
          permanentAddress: formFields.permanentAddress || '',
          permanentCity: formFields.permanentCity || '',
          permanentState: formFields.permanentState || '',
          permanentPincode: formFields.permanentPincode || '',
          sameAsCurrent: formFields.sameAsCurrent || false,
          class10Board: formFields.class10Board || '',
          class10School: formFields.class10School || '',
          class10Percentage: formFields.class10Percentage || 0,
          class10PassingYear: formFields.class10PassingYear || 0,
          class12Board: formFields.class12Board || null,
          class12School: formFields.class12School || null,
          class12Percentage: formFields.class12Percentage || null,
          class12PassingYear: formFields.class12PassingYear || null,
          diplomaCollege: formFields.diplomaCollege || null,
          diplomaBranch: formFields.diplomaBranch || null,
          diplomaCGPA: formFields.diplomaCGPA || null,
          diplomaPassingYear: formFields.diplomaPassingYear || null,
          currentCourse: formFields.currentCourse || '',
          currentBranch: formFields.currentBranch || '',
          currentSemester: formFields.currentSemester || 1,
          currentCGPA: formFields.currentCGPA || 0,
          sgpaSemester1: formFields.sgpaSemester1 || null,
          sgpaSemester2: formFields.sgpaSemester2 || null,
          sgpaSemester3: formFields.sgpaSemester3 || null,
          sgpaSemester4: formFields.sgpaSemester4 || null,
          sgpaSemester5: formFields.sgpaSemester5 || null,
          sgpaSemester6: formFields.sgpaSemester6 || null,
          sgpaSemester7: formFields.sgpaSemester7 || null,
          sgpaSemester8: formFields.sgpaSemester8 || null,
          careerPreference: formFields.careerPreference || '',
          primaryDomain: formFields.primaryDomain || '',
          secondaryDomain: formFields.secondaryDomain || null,
          skills: formFields.skills || [],
          linkedinUrl: formFields.linkedinUrl || null,
          githubUrl: formFields.githubUrl || null,
          portfolioUrl: formFields.portfolioUrl || null,
          resumeUrl: formFields.resumeUrl || '',
        },
        update: {
          fullName: formFields.fullName ?? undefined,
          enrollmentNumber: formFields.enrollmentNumber ?? undefined,
          email: formFields.email ?? undefined,
          phone: formFields.phone ?? undefined,
          gender: formFields.gender ?? undefined,
          dateOfBirth: formFields.dateOfBirth ?? undefined,
          profileImage: formFields.profileImage ?? undefined,
          aadharNumber: formFields.aadharNumber ?? undefined,
          panCard: formFields.panCard ?? undefined,
          collegeIdNumber: formFields.collegeIdNumber ?? undefined,
          fatherName: formFields.fatherName ?? undefined,
          fatherOccupation: formFields.fatherOccupation ?? undefined,
          fatherPhone: formFields.fatherPhone ?? undefined,
          motherName: formFields.motherName ?? undefined,
          motherOccupation: formFields.motherOccupation ?? undefined,
          motherPhone: formFields.motherPhone ?? undefined,
          familyIncome: formFields.familyIncome ?? undefined,
          emergencyContact: formFields.emergencyContact ?? undefined,
          currentAddress: formFields.currentAddress ?? undefined,
          currentCity: formFields.currentCity ?? undefined,
          currentState: formFields.currentState ?? undefined,
          currentPincode: formFields.currentPincode ?? undefined,
          permanentAddress: formFields.permanentAddress ?? undefined,
          permanentCity: formFields.permanentCity ?? undefined,
          permanentState: formFields.permanentState ?? undefined,
          permanentPincode: formFields.permanentPincode ?? undefined,
          sameAsCurrent: formFields.sameAsCurrent ?? undefined,
          class10Board: formFields.class10Board ?? undefined,
          class10School: formFields.class10School ?? undefined,
          class10Percentage: formFields.class10Percentage ?? undefined,
          class10PassingYear: formFields.class10PassingYear ?? undefined,
          class12Board: formFields.class12Board ?? undefined,
          class12School: formFields.class12School ?? undefined,
          class12Percentage: formFields.class12Percentage ?? undefined,
          class12PassingYear: formFields.class12PassingYear ?? undefined,
          diplomaCollege: formFields.diplomaCollege ?? undefined,
          diplomaBranch: formFields.diplomaBranch ?? undefined,
          diplomaCGPA: formFields.diplomaCGPA ?? undefined,
          diplomaPassingYear: formFields.diplomaPassingYear ?? undefined,
          currentCourse: formFields.currentCourse ?? undefined,
          currentBranch: formFields.currentBranch ?? undefined,
          currentSemester: formFields.currentSemester ?? undefined,
          currentCGPA: formFields.currentCGPA ?? undefined,
          sgpaSemester1: formFields.sgpaSemester1 ?? undefined,
          sgpaSemester2: formFields.sgpaSemester2 ?? undefined,
          sgpaSemester3: formFields.sgpaSemester3 ?? undefined,
          sgpaSemester4: formFields.sgpaSemester4 ?? undefined,
          sgpaSemester5: formFields.sgpaSemester5 ?? undefined,
          sgpaSemester6: formFields.sgpaSemester6 ?? undefined,
          sgpaSemester7: formFields.sgpaSemester7 ?? undefined,
          sgpaSemester8: formFields.sgpaSemester8 ?? undefined,
          careerPreference: formFields.careerPreference ?? undefined,
          primaryDomain: formFields.primaryDomain ?? undefined,
          secondaryDomain: formFields.secondaryDomain ?? undefined,
          skills: formFields.skills ?? undefined,
          linkedinUrl: formFields.linkedinUrl ?? undefined,
          githubUrl: formFields.githubUrl ?? undefined,
          portfolioUrl: formFields.portfolioUrl ?? undefined,
          resumeUrl: formFields.resumeUrl ?? undefined,
        },
      });

      // Handle certifications
      if (certifications) {
        await tx.applicationCertification.deleteMany({
          where: { applicationId: app.id },
        });

        if (certifications.length > 0) {
          await tx.applicationCertification.createMany({
            data: certifications.map((c: any) => ({
              applicationId: app.id,
              name: c.name,
              issuingOrganization: c.issuingOrganization,
              issueDate: c.issueDate,
              certificateUrl: c.certificateUrl,
            })),
          });
        }
      }

      return app;
    });

    return this.getByUserId(userId);
  }

  /**
   * Submit application (Full Validation)
   */
  async submitApplication(userId: string, payload: any) {
    // Check if application is already submitted
    const existing = await prisma.studentApplication.findUnique({
      where: { userId },
    });

    if (existing && existing.status !== PortalApplicationStatus.DRAFT) {
      throw new ApiError(400, `Application has already been submitted. Status: ${existing.status}`);
    }

    // Strict Zod parsing
    const data = submitApplicationSchema.parse(payload);
    const { certifications, ...formFields } = data;

    // Use transaction to submit
    await prisma.$transaction(async (tx) => {
      const app = await tx.studentApplication.upsert({
        where: { userId },
        create: {
          userId,
          status: PortalApplicationStatus.SUBMITTED,
          submittedAt: new Date(),
          fullName: formFields.fullName,
          enrollmentNumber: formFields.enrollmentNumber,
          email: formFields.email,
          phone: formFields.phone,
          gender: formFields.gender,
          dateOfBirth: formFields.dateOfBirth,
          profileImage: formFields.profileImage,
          aadharNumber: formFields.aadharNumber,
          panCard: formFields.panCard || null,
          collegeIdNumber: formFields.collegeIdNumber,
          fatherName: formFields.fatherName,
          fatherOccupation: formFields.fatherOccupation,
          fatherPhone: formFields.fatherPhone,
          motherName: formFields.motherName,
          motherOccupation: formFields.motherOccupation,
          motherPhone: formFields.motherPhone,
          familyIncome: formFields.familyIncome,
          emergencyContact: formFields.emergencyContact,
          currentAddress: formFields.currentAddress,
          currentCity: formFields.currentCity,
          currentState: formFields.currentState,
          currentPincode: formFields.currentPincode,
          permanentAddress: formFields.permanentAddress,
          permanentCity: formFields.permanentCity,
          permanentState: formFields.permanentState,
          permanentPincode: formFields.permanentPincode,
          sameAsCurrent: formFields.sameAsCurrent,
          class10Board: formFields.class10Board,
          class10School: formFields.class10School,
          class10Percentage: formFields.class10Percentage,
          class10PassingYear: formFields.class10PassingYear,
          class12Board: formFields.class12Board || null,
          class12School: formFields.class12School || null,
          class12Percentage: formFields.class12Percentage || null,
          class12PassingYear: formFields.class12PassingYear || null,
          diplomaCollege: formFields.diplomaCollege || null,
          diplomaBranch: formFields.diplomaBranch || null,
          diplomaCGPA: formFields.diplomaCGPA || null,
          diplomaPassingYear: formFields.diplomaPassingYear || null,
          currentCourse: formFields.currentCourse,
          currentBranch: formFields.currentBranch,
          currentSemester: formFields.currentSemester,
          currentCGPA: formFields.currentCGPA,
          sgpaSemester1: formFields.sgpaSemester1 || null,
          sgpaSemester2: formFields.sgpaSemester2 || null,
          sgpaSemester3: formFields.sgpaSemester3 || null,
          sgpaSemester4: formFields.sgpaSemester4 || null,
          sgpaSemester5: formFields.sgpaSemester5 || null,
          sgpaSemester6: formFields.sgpaSemester6 || null,
          sgpaSemester7: formFields.sgpaSemester7 || null,
          sgpaSemester8: formFields.sgpaSemester8 || null,
          careerPreference: formFields.careerPreference,
          primaryDomain: formFields.primaryDomain,
          secondaryDomain: formFields.secondaryDomain || null,
          skills: formFields.skills,
          linkedinUrl: formFields.linkedinUrl || null,
          githubUrl: formFields.githubUrl || null,
          portfolioUrl: formFields.portfolioUrl || null,
          resumeUrl: formFields.resumeUrl,
        },
        update: {
          status: PortalApplicationStatus.SUBMITTED,
          submittedAt: new Date(),
          fullName: formFields.fullName,
          enrollmentNumber: formFields.enrollmentNumber,
          email: formFields.email,
          phone: formFields.phone,
          gender: formFields.gender,
          dateOfBirth: formFields.dateOfBirth,
          profileImage: formFields.profileImage,
          aadharNumber: formFields.aadharNumber,
          panCard: formFields.panCard,
          collegeIdNumber: formFields.collegeIdNumber,
          fatherName: formFields.fatherName,
          fatherOccupation: formFields.fatherOccupation,
          fatherPhone: formFields.fatherPhone,
          motherName: formFields.motherName,
          motherOccupation: formFields.motherOccupation,
          motherPhone: formFields.motherPhone,
          familyIncome: formFields.familyIncome,
          emergencyContact: formFields.emergencyContact,
          currentAddress: formFields.currentAddress,
          currentCity: formFields.currentCity,
          currentState: formFields.currentState,
          currentPincode: formFields.currentPincode,
          permanentAddress: formFields.permanentAddress,
          permanentCity: formFields.permanentCity,
          permanentState: formFields.permanentState,
          permanentPincode: formFields.permanentPincode,
          sameAsCurrent: formFields.sameAsCurrent,
          class10Board: formFields.class10Board,
          class10School: formFields.class10School,
          class10Percentage: formFields.class10Percentage,
          class10PassingYear: formFields.class10PassingYear,
          class12Board: formFields.class12Board,
          class12School: formFields.class12School,
          class12Percentage: formFields.class12Percentage,
          class12PassingYear: formFields.class12PassingYear,
          diplomaCollege: formFields.diplomaCollege,
          diplomaBranch: formFields.diplomaBranch,
          diplomaCGPA: formFields.diplomaCGPA,
          diplomaPassingYear: formFields.diplomaPassingYear,
          currentCourse: formFields.currentCourse,
          currentBranch: formFields.currentBranch,
          currentSemester: formFields.currentSemester,
          currentCGPA: formFields.currentCGPA,
          sgpaSemester1: formFields.sgpaSemester1,
          sgpaSemester2: formFields.sgpaSemester2,
          sgpaSemester3: formFields.sgpaSemester3,
          sgpaSemester4: formFields.sgpaSemester4,
          sgpaSemester5: formFields.sgpaSemester5,
          sgpaSemester6: formFields.sgpaSemester6,
          sgpaSemester7: formFields.sgpaSemester7,
          sgpaSemester8: formFields.sgpaSemester8,
          careerPreference: formFields.careerPreference,
          primaryDomain: formFields.primaryDomain,
          secondaryDomain: formFields.secondaryDomain,
          skills: formFields.skills,
          linkedinUrl: formFields.linkedinUrl,
          githubUrl: formFields.githubUrl,
          portfolioUrl: formFields.portfolioUrl,
          resumeUrl: formFields.resumeUrl,
        },
      });

      // Handle certifications
      await tx.applicationCertification.deleteMany({
        where: { applicationId: app.id },
      });

      if (certifications && certifications.length > 0) {
        await tx.applicationCertification.createMany({
          data: certifications.map((c: any) => ({
            applicationId: app.id,
            name: c.name,
            issuingOrganization: c.issuingOrganization,
            issueDate: c.issueDate,
            certificateUrl: c.certificateUrl,
          })),
        });
      }
    });

    return this.getByUserId(userId);
  }

  /**
   * Update allowed fields post-submission (Resume, Domains, CGPA, SGPA)
   */
  async updateAllowedFields(userId: string, payload: any) {
    const existing = await prisma.studentApplication.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new ApiError(404, 'Application not found');
    }

    if (existing.status === PortalApplicationStatus.DRAFT) {
      throw new ApiError(400, 'Cannot perform post-submission updates on draft applications');
    }

    // Validate updates (Only allow specific post-submission fields)
    const updates = allowedUpdatesSchema.parse(payload);

    const updated = await prisma.studentApplication.update({
      where: { userId },
      data: {
        resumeUrl: updates.resumeUrl ?? undefined,
        primaryDomain: updates.primaryDomain ?? undefined,
        secondaryDomain: updates.secondaryDomain ?? undefined,
        currentCGPA: updates.currentCGPA ?? undefined,
        sgpaSemester1: updates.sgpaSemester1 ?? undefined,
        sgpaSemester2: updates.sgpaSemester2 ?? undefined,
        sgpaSemester3: updates.sgpaSemester3 ?? undefined,
        sgpaSemester4: updates.sgpaSemester4 ?? undefined,
        sgpaSemester5: updates.sgpaSemester5 ?? undefined,
        sgpaSemester6: updates.sgpaSemester6 ?? undefined,
        sgpaSemester7: updates.sgpaSemester7 ?? undefined,
        sgpaSemester8: updates.sgpaSemester8 ?? undefined,
      },
      include: {
        certifications: true,
      },
    });

    return updated;
  }

  /**
   * CDC Admin: Get all applications
   */
  async getAllApplications() {
    const apps = await prisma.studentApplication.findMany({
      orderBy: { submittedAt: 'desc' },
      include: {
        certifications: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });
    return apps;
  }

  /**
   * CDC Admin: Verify Application (Verdict & Remarks)
   */
  async verifyApplication(applicationId: string, status: PortalApplicationStatus, remarks?: string) {
    if (status === PortalApplicationStatus.DRAFT) {
      throw new ApiError(400, 'Cannot change verification status back to draft');
    }

    const application = await prisma.studentApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new ApiError(404, 'Application not found');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedApplication = await tx.studentApplication.update({
        where: { id: applicationId },
        data: {
          status,
          remarks: remarks ?? null,
          verifiedAt: new Date(),
        },
        include: {
          certifications: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      const verificationStatus =
        status === PortalApplicationStatus.APPROVED
          ? VerificationStatus.VERIFIED
          : status === PortalApplicationStatus.REJECTED
            ? VerificationStatus.REJECTED
            : VerificationStatus.PENDING;

      await tx.studentProfile.updateMany({
        where: { userId: updatedApplication.userId },
        data: {
          isVerified: verificationStatus === VerificationStatus.VERIFIED,
          verificationStatus,
        },
      });

      return updatedApplication;
    });

    return updated;
  }
}
export default ApplicationService;
