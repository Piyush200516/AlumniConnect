import { Router } from 'express';
import multer from 'multer';
import {
  getMyApplication,
  saveApplicationDraft,
  submitStudentApplication,
  updatePostSubmissionFields,
  uploadDocument,
  getAllStudentApplications,
  getStudentApplicationById,
  verifyStudentApplication,
} from '../controllers/application.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Student Endpoints (Role: STUDENT / uppercase STUDENT check in backend)
router.get(
  '/my',
  authenticateUser as any,
  authorizeRoles('STUDENT') as any,
  getMyApplication as any
);

router.post(
  '/save',
  authenticateUser as any,
  authorizeRoles('STUDENT') as any,
  saveApplicationDraft as any
);

router.post(
  '/submit',
  authenticateUser as any,
  authorizeRoles('STUDENT') as any,
  submitStudentApplication as any
);

router.patch(
  '/update-allowed',
  authenticateUser as any,
  authorizeRoles('STUDENT') as any,
  updatePostSubmissionFields as any
);

router.post(
  '/upload',
  authenticateUser as any,
  authorizeRoles('STUDENT') as any,
  upload.single('file'),
  uploadDocument as any
);

// CDC/Admin Endpoints (Role: CDC)
router.get(
  '/',
  authenticateUser as any,
  authorizeRoles('CDC') as any,
  getAllStudentApplications as any
);

router.get(
  '/:id',
  authenticateUser as any,
  authorizeRoles('CDC', 'STUDENT') as any,
  getStudentApplicationById as any
);

router.post(
  '/:id/verify',
  authenticateUser as any,
  authorizeRoles('CDC') as any,
  verifyStudentApplication as any
);

export default router;
