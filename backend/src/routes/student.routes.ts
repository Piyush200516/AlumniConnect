// src/routes/student.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { getStudentProfile, updateStudentProfile, getStudentDashboard } from '../controllers/student.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.get('/profile', authenticateUser as any, authorizeRoles('STUDENT') as any, getStudentProfile);
router.get('/dashboard', authenticateUser as any, authorizeRoles('STUDENT') as any, getStudentDashboard);

router.put(
  '/profile',
  authenticateUser as any,
  authorizeRoles('STUDENT') as any,
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
  ]),
  updateStudentProfile
);

export default router;
