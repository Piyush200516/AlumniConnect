import { Response, NextFunction } from 'express';
import { ApplicationService } from '../services/application.service';
import { responseSuccess } from '../utils/response';
import { ApiError } from '../utils/error';
import { uploadFile } from '../services/student.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const applicationService = new ApplicationService();

/**
 * GET /api/applications/my
 * Fetch logged-in student's application details
 */
export const getMyApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const application = await applicationService.getByUserId(userId);
    responseSuccess(res, 'Application retrieved successfully', application);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/applications/save
 * Upsert application draft details (does not lock fields)
 */
export const saveApplicationDraft = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const application = await applicationService.saveDraft(userId, req.body);
    responseSuccess(res, 'Draft saved successfully', application);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/applications/submit
 * Submit student application (runs strict validations, locks fields)
 */
export const submitStudentApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const application = await applicationService.submitApplication(userId, req.body);
    responseSuccess(res, 'Application submitted successfully', application);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/applications/update-allowed
 * Update allowed fields post-submission (Resume, Domains, CGPA, SGPA)
 */
export const updatePostSubmissionFields = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const application = await applicationService.updateAllowedFields(userId, req.body);
    responseSuccess(res, 'Allowed fields updated successfully', application);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/applications/upload
 * Multi-purpose file upload handler (Profile photos, PDF Resumes, Certifications)
 */
export const uploadDocument = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }
    const folder = req.query.type === 'profile' ? 'profiles' : req.query.type === 'resume' ? 'resumes' : 'certifications';
    const url = await uploadFile(req.file, folder);
    responseSuccess(res, 'File uploaded successfully', { url });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/applications
 * CDC Admin: Retrieve all student applications
 */
export const getAllStudentApplications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const applications = await applicationService.getAllApplications();
    responseSuccess(res, 'Applications list retrieved successfully', applications);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/applications/:id
 * Retrieve specific application details by application ID (for CDC review / student check)
 */
export const getStudentApplicationById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const application = await applicationService.getById(id);

    // Guard: Students can only view their own application
    if (req.user!.role === 'STUDENT' && application.userId !== req.user!.id) {
      throw new ApiError(403, 'Forbidden: You can only view your own application');
    }

    responseSuccess(res, 'Application details retrieved successfully', application);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/applications/:id/verify
 * CDC Admin: Approve, Reject, or set Under Verification status with remarks
 */
export const verifyStudentApplication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id as string;
    const { status, remarks } = req.body;
    
    if (!status) {
      throw new ApiError(400, 'Verification status is required');
    }

    const application = await applicationService.verifyApplication(id, status, remarks);
    responseSuccess(res, 'Application verification status updated', application);
  } catch (err) {
    next(err);
  }
};
