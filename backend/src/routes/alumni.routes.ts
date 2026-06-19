import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import {
  getAlumni,
  getAlumniDetails,
  searchAlumni,
  sendConnection,
  acceptConnection,
  postMessage,
  toggleFollow,
  toggleSave
} from '../controllers/alumni.controller';

const router = Router();

// Route mappings
router.get('/', authenticateUser as any, getAlumni as any);
router.get('/search', authenticateUser as any, searchAlumni as any);
router.get('/:id', authenticateUser as any, getAlumniDetails as any);

router.post('/connections/send', authenticateUser as any, sendConnection as any);
router.patch('/connections/accept', authenticateUser as any, acceptConnection as any);

router.post('/messages', authenticateUser as any, postMessage as any);

router.post('/:id/follow', authenticateUser as any, toggleFollow as any);
router.post('/:id/save', authenticateUser as any, toggleSave as any);

export default router;
