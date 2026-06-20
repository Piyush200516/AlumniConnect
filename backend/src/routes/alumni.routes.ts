import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import {
  getAlumni,
  getMyProfile,
  getAlumniDetails,
  searchAlumni,
  sendConnection,
  acceptConnection,
  rejectConnection,
  getIncomingConnections,
  postMessage,
  toggleFollow,
  toggleSave
} from '../controllers/alumni.controller';

const router = Router();

// Route mappings
router.get('/', authenticateUser as any, getAlumni as any);
router.get('/search', authenticateUser as any, searchAlumni as any);
router.get('/me', authenticateUser as any, getMyProfile as any);
router.get('/:id', authenticateUser as any, getAlumniDetails as any);

router.post('/connections/send', authenticateUser as any, sendConnection as any);
router.patch('/connections/accept', authenticateUser as any, authorizeRoles('ALUMNI') as any, acceptConnection as any);
router.patch('/connections/reject', authenticateUser as any, authorizeRoles('ALUMNI') as any, rejectConnection as any);
router.get('/connections/incoming', authenticateUser as any, authorizeRoles('ALUMNI') as any, getIncomingConnections as any);

router.post('/messages', authenticateUser as any, postMessage as any);

router.post('/:id/follow', authenticateUser as any, toggleFollow as any);
router.post('/:id/save', authenticateUser as any, toggleSave as any);

export default router;
