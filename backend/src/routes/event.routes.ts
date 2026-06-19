import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import {
  getEventsList,
  getEventDetails,
  createEvent,
  editEvent,
  registerForEvent,
  cancelRegistration,
  markAttendance,
  approveOrRejectEvent,
  getAllEventsForAdmin,
  getMyRegistrations,
  getMyCertificates,
  getEventRegistrations
} from '../controllers/event.controller';

const router = Router();

// General event viewing - accessible by all roles
router.get(
  '/',
  authenticateUser as any,
  getEventsList as any
);

router.get(
  '/admin/all',
  authenticateUser as any,
  authorizeRoles('CDC') as any,
  getAllEventsForAdmin as any
);

router.get(
  '/my-registrations',
  authenticateUser as any,
  authorizeRoles('STUDENT') as any,
  getMyRegistrations as any
);

router.get(
  '/my-certificates',
  authenticateUser as any,
  authorizeRoles('STUDENT') as any,
  getMyCertificates as any
);

router.get(
  '/:id',
  authenticateUser as any,
  getEventDetails as any
);

// CDC/Alumni event management
router.post(
  '/create',
  authenticateUser as any,
  authorizeRoles('CDC', 'ALUMNI') as any,
  createEvent as any
);

router.put(
  '/:id',
  authenticateUser as any,
  authorizeRoles('CDC', 'ALUMNI') as any,
  editEvent as any
);

router.get(
  '/:id/registrations',
  authenticateUser as any,
  authorizeRoles('CDC', 'ALUMNI') as any,
  getEventRegistrations as any
);

router.post(
  '/:id/mark-attendance',
  authenticateUser as any,
  authorizeRoles('CDC', 'ALUMNI') as any,
  markAttendance as any
);

// Student registration actions
router.post(
  '/:id/register',
  authenticateUser as any,
  authorizeRoles('STUDENT') as any,
  registerForEvent as any
);

router.post(
  '/:id/cancel',
  authenticateUser as any,
  authorizeRoles('STUDENT') as any,
  cancelRegistration as any
);

// CDC Admin actions (Approve/Reject)
router.post(
  '/:id/approve',
  authenticateUser as any,
  authorizeRoles('CDC') as any,
  approveOrRejectEvent as any
);

router.post(
  '/:id/reject',
  authenticateUser as any,
  authorizeRoles('CDC') as any,
  approveOrRejectEvent as any
);

export default router;
