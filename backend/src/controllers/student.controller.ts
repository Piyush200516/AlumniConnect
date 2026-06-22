// src/controllers/student.controller.ts
import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service';
import { responseSuccess } from '../utils/response';
import { localCache } from '../utils/cache';
import { logger } from '../utils/logger';


const studentService = new StudentService();

export const getStudentDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user!.id;
    const cacheKey = `student_dashboard_${userId}`;

    // Try reading from cache
    const cachedData = localCache.get(cacheKey);
    if (cachedData) {
      console.log(`[Cache Hit] Serving dashboard for user ${userId}`);
      return responseSuccess(res, 'Dashboard data fetched from cache', cachedData);
    }

    // Measure database query performance
    const logLabel = `dashboard-api-${userId}`;
    console.time(logLabel);

    const dashboardData = await studentService.getDashboardData(userId);

    console.timeEnd(logLabel);

    // Cache the response for 5 minutes (300 seconds)
    localCache.set(cacheKey, dashboardData, 300);

    responseSuccess(res, 'Dashboard data fetched successfully', dashboardData);
  } catch (err) {
    logger.error(`Error in getStudentDashboard: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    next(err);
  }
};

// src/controllers/student.controller.ts
export const getStudentProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user!.id;
    logger.info(`Fetching student profile for userId=${userId}`);
    const profile = await studentService.getProfileByUserId(userId);
    responseSuccess(res, 'Profile fetched successfully', profile);
  } catch (err) {
    logger.error(`Error in getStudentProfile: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    next(err);
  }
};

export const updateStudentProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user!.id;
    const files = (req as any).files;
    const profile = await studentService.updateProfile(userId, req.body, files);
    responseSuccess(res, 'Profile updated successfully', profile);
  } catch (err) {
    logger.error(`Error in updateStudentProfile: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    next(err);
  }
};
