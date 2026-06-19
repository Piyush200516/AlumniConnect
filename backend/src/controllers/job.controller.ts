import { Response, NextFunction } from 'express';
import { JobService } from '../services/job.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { updateJobApprovalSchema } from '../validators/job.validator';
import { ApiError } from '../utils/error';

const service = new JobService();

export const getJobsList = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { search, jobType, location, skills, tab } = req.query;
    const jobs = await service.getJobs(
      {
        search: search as string,
        jobType: jobType as string,
        location: location as string,
        skills: skills as string,
        tab: tab as 'all' | 'saved' | 'applied',
      },
      req.user?.id
    );
    res.status(200).json({ success: true, data: jobs });
  } catch (err) {
    next(err);
  }
};

export const getJobDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const job = await service.getJobById(id, req.user?.id);
    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

export const createJobPosting = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthenticated');
    const job = await service.createJob(req.user.id, req.body);
    res.status(201).json({ success: true, data: job, message: 'Job posting created successfully' });
  } catch (err) {
    next(err);
  }
};

export const editJobPosting = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthenticated');
    const id = req.params.id as string;
    const job = await service.editJob(id, req.user.id, req.body);
    res.status(200).json({ success: true, data: job, message: 'Job posting updated successfully' });
  } catch (err) {
    next(err);
  }
};

export const applyForJobPosting = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthenticated');
    const id = req.params.id as string;
    const application = await service.applyForJob(req.user.id, id, req.body);
    res.status(201).json({ success: true, data: application, message: 'Job application submitted successfully' });
  } catch (err) {
    next(err);
  }
};

export const updateCandidateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthenticated');
    const appId = req.params.appId as string;
    const updated = await service.updateApplicationStatus(req.user.id, appId, req.body);
    res.status(200).json({ success: true, data: updated, message: `Candidate application status updated to ${req.body.status}` });
  } catch (err) {
    next(err);
  }
};

export const toggleJobBookmark = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthenticated');
    const id = req.params.id as string;
    const result = await service.toggleSaveJob(req.user.id, id);
    res.status(200).json({ success: true, data: result, message: result.message });
  } catch (err) {
    next(err);
  }
};

export const getJobApplicantsList = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthenticated');
    const id = req.params.id as string; // jobId
    const applicants = await service.getJobApplicants(req.user.id, id);
    res.status(200).json({ success: true, data: applicants });
  } catch (err) {
    next(err);
  }
};

export const moderateJobPosting = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const validated = updateJobApprovalSchema.parse(req.body);
    const job = await service.approveOrRejectJob(id, validated.approvalStatus, validated.remarks ?? undefined);
    res.status(200).json({ success: true, data: job, message: `Job posting review status updated to ${validated.approvalStatus}` });
  } catch (err) {
    next(err);
  }
};
