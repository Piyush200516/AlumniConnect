import { Router } from 'express';
import { MentorshipController } from '../controllers/mentorship.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();
const controller = new MentorshipController();

router.use(authenticateUser as any);

// Requests
router.post('/request', authorizeRoles('STUDENT') as any, controller.requestMentorship.bind(controller) as any);
router.patch('/accept', authorizeRoles('ALUMNI') as any, controller.acceptMentorship.bind(controller) as any);
router.patch('/reject', authorizeRoles('ALUMNI') as any, controller.rejectMentorship.bind(controller) as any);

// Directory / Members lists
router.get('/my-mentors', authorizeRoles('STUDENT') as any, controller.getMyMentors.bind(controller) as any);
router.get('/my-mentees', authorizeRoles('ALUMNI') as any, controller.getMyMentees.bind(controller) as any);

// Dashboard features
router.get('/dashboard', controller.getDashboard.bind(controller) as any);
router.post('/meetings', controller.scheduleMeeting.bind(controller) as any);
router.post('/resources', controller.shareResource.bind(controller) as any);
router.patch('/alumni-privacy', authorizeRoles('ALUMNI') as any, controller.updateAlumniPrivacy.bind(controller) as any);

export default router;
