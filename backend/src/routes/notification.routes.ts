import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import {
  getUserNotifications,
  markAsRead,
  registerFcmToken,
  unregisterFcmToken,
  createManualNotification,
} from '../controllers/notification.controller';

const router = Router();

// All routes require authenticated user session
router.use(authenticateUser);

router.get('/', getUserNotifications);
router.patch('/:id/read', markAsRead);
router.post('/read-all', markAsRead);
router.post('/fcm-token', registerFcmToken);
router.delete('/fcm-token', unregisterFcmToken);

// Only CDC/Admin can trigger manual bulk or role notifications
router.post('/manual', authorizeRoles('CDC'), createManualNotification);

export default router;
