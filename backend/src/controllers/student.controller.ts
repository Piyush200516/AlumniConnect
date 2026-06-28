// src/controllers/student.controller.ts
import { Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service';
import { responseSuccess } from '../utils/response';
import { localCache } from '../utils/cache';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const studentService = new StudentService();

/**
 * Get student dashboard data with caching and detailed logging.
 */
export const getStudentDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('User ID:', req.user?.id);
    if (!req.user?.id) {
      throw new Error('Authenticated user not found');
    }
    const userId = req.user.id;
    const cacheKey = `student_dashboard_${userId}`;

    // Try reading from cache
    const cachedData = localCache.get(cacheKey);
    if (cachedData) {
      console.log(`[Cache Hit] Serving dashboard for user ${userId}`);
      return responseSuccess(res, 'Dashboard data fetched from cache', cachedData);
    }

    const logLabel = `dashboard-api-${userId}`;
    console.time(logLabel);
    const dashboardData = await studentService.getDashboardData(userId);
    console.timeEnd(logLabel);
    console.log('Dashboard Data:', dashboardData);

    // Cache for 5 minutes
    localCache.set(cacheKey, dashboardData, 300);

    responseSuccess(res, 'Dashboard data fetched successfully', dashboardData);
  } catch (err) {
    console.error('Full Error:', err);
    logger.error(`Error in getStudentDashboard: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    next(err);
  }
};

/**
 * Get student profile.
 */
export const getStudentProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('User ID:', req.user?.id);
    if (!req.user?.id) {
      throw new Error('Authenticated user not found');
    }
    const userId = req.user.id;
    logger.info(`Fetching student profile for userId=${userId}`);
    const profile = await studentService.getProfileByUserId(userId);
    console.log('Student Record:', profile);
    responseSuccess(res, 'Profile fetched successfully', profile);
  } catch (err) {
    console.error('Full Error:', err);
    logger.error(`Error in getStudentProfile: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    next(err);
  }
};

/**
 * Update student profile, handling optional photo upload.
 */
export const updateStudentProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('User ID:', req.user?.id);
    if (!req.user?.id) {
      throw new Error('Authenticated user not found');
    }
    const userId = req.user.id;
    const files = (req as any).files;
    const profile = await studentService.updateProfile(userId, req.body, files);
    console.log('Updated Student Record:', profile);
    responseSuccess(res, 'Profile updated successfully', profile);
  } catch (err) {
    console.error('Full Error:', err);
    logger.error(`Error in updateStudentProfile: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    next(err);
  }
};
