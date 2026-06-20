import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { getCdcDashboard } from '../controllers/cdc.controller';

const router = Router();

router.get(
  '/dashboard',
  authenticateUser as any,
  authorizeRoles('CDC') as any,
  getCdcDashboard as any
);

export default router;
