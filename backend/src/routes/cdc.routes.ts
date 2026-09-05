import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { getCdcDashboard, verifyAlumni } from '../controllers/cdc.controller';

const router = Router();

router.get(
  '/dashboard',
  authenticateUser as any,
  authorizeRoles('CDC') as any,
  getCdcDashboard as any
);

router.patch(
  '/alumni/:id/verification',
  authenticateUser as any,
  authorizeRoles('CDC') as any,
  verifyAlumni as any
);

export default router;
