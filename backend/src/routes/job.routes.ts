import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import {
  getJobsList,
  getJobDetails,
  createJobPosting,
  editJobPosting,
  applyForJobPosting,
  updateCandidateStatus,
  toggleJobBookmark,
  getJobApplicantsList,
  moderateJobPosting
} from '../controllers/job.controller';

const router = Router();

// General job listings (browsing)
router.get(
  '/',
  authenticateUser as any,
  getJobsList as any
);

router.get(
  '/:id',
  authenticateUser as any,
  getJobDetails as any
);

// Creation & Modification
router.post(
  '/create',
  authenticateUser as any,
  authorizeRoles('CDC', 'ALUMNI') as any,
  createJobPosting as any
);

router.put(
  '/:id',
  authenticateUser as any,
  authorizeRoles('CDC', 'ALUMNI') as any,
  editJobPosting as any
);

// Student actions
router.post(
  '/:id/apply',
  authenticateUser as any,
  authorizeRoles('STUDENT') as any,
  applyForJobPosting as any
);

router.post(
  '/:id/save',
  authenticateUser as any,
  authorizeRoles('STUDENT') as any,
  toggleJobBookmark as any
);

// Alumni applicant tracking actions
router.get(
  '/:id/applications',
  authenticateUser as any,
  authorizeRoles('CDC', 'ALUMNI') as any,
  getJobApplicantsList as any
);

router.put(
  '/applications/:appId/status',
  authenticateUser as any,
  authorizeRoles('CDC', 'ALUMNI') as any,
  updateCandidateStatus as any
);

// CDC moderation actions
router.post(
  '/:id/approve',
  authenticateUser as any,
  authorizeRoles('CDC') as any,
  moderateJobPosting as any
);

router.post(
  '/:id/reject',
  authenticateUser as any,
  authorizeRoles('CDC') as any,
  moderateJobPosting as any
);

export default router;
