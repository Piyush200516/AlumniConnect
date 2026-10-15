// src/routes/student.routes.ts
import { Router } from 'express';
import { uploadAttachment } from '../middleware/upload';
import { getStudentProfile, updateStudentProfile, getStudentDashboard } from '../controllers/student.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { logger } from '../utils/logger';

// Log incoming student route requests
const logRequest = (req: any, _res: any, next: any) => {
  logger.info(`[Student Route] ${req.method} ${req.originalUrl}`);
  logger.debug(`Headers: ${JSON.stringify(req.headers)}`);
  if (req.user) {
    logger.debug(`Authenticated user: ${JSON.stringify(req.user)}`);
  }
  next();
};

const router = Router();

router.use(logRequest);

router.get('/profile', authenticateUser as any, authorizeRoles('STUDENT') as any, getStudentProfile);
router.get('/dashboard', authenticateUser as any, authorizeRoles('STUDENT') as any, getStudentDashboard);

router.put(
  '/profile',
  authenticateUser as any,
  authorizeRoles('STUDENT') as any,
  uploadAttachment.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
  ]),
  updateStudentProfile
);

export default router;
