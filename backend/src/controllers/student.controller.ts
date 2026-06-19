// src/controllers/student.controller.ts
import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service';
import { responseSuccess } from '../utils/response';
import { localCache } from '../utils/cache';

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

    // Cache the response for 15 seconds
    localCache.set(cacheKey, dashboardData, 15);

    responseSuccess(res, 'Dashboard data fetched successfully', dashboardData);
  } catch (err) {
    next(err);
  }
};

export const getStudentProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user!.id;
    const profile = await studentService.getProfileByUserId(userId);
    responseSuccess(res, 'Profile fetched successfully', profile);
  } catch (err) {
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
    next(err);
  }
};
