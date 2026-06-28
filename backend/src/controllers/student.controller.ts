// src/controllers/student.controller.ts
import { Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service';
import { responseSuccess } from '../utils/response';
import { localCache } from '../utils/cache';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiError } from '../utils/error';
import { prisma } from '../lib/prisma';

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
    logger.info(`[Controller.getStudentDashboard] START — req.user=${JSON.stringify(req.user)}`);
    if (!req.user?.id) {
      logger.error('[Controller.getStudentDashboard] req.user.id is missing after auth middleware');
      throw new ApiError(401, 'Authenticated user not found');
    }
    const userId = req.user.id;

    // Verify that the logged-in user's ID exists in the User table
    const userRecord = await prisma.user.findUnique({ where: { id: userId } });
    if (!userRecord) {
      logger.warn(`[Controller.getStudentDashboard] User ID ${userId} not found in User table`);
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify that the student record exists in the StudentProfile table
    const studentRecord = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!studentRecord) {
      logger.warn(`[Controller.getStudentDashboard] StudentProfile not found for user ID ${userId}`);
      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });
    }

    const cacheKey = `student_dashboard_${userId}`;

    // Try reading from cache
    const cachedData = localCache.get(cacheKey);
    if (cachedData) {
      logger.info(`[Controller.getStudentDashboard] Cache HIT for user ${userId}`);
      return responseSuccess(res, 'Dashboard data fetched from cache', cachedData);
    }

    logger.info(`[Controller.getStudentDashboard] Cache MISS — calling service for userId=${userId}`);
    const logLabel = `dashboard-api-${userId}`;
    console.time(logLabel);
    const dashboardData = await studentService.getDashboardData(userId);
    console.timeEnd(logLabel);
    logger.debug(`[Controller.getStudentDashboard] Service returned data successfully`);

    // Cache for 5 minutes
    localCache.set(cacheKey, dashboardData, 300);

    responseSuccess(res, 'Dashboard data fetched successfully', dashboardData);
  } catch (error: any) {
    console.error("========== ERROR ==========");
    console.error(error);
    console.error(error.stack);

    if (error instanceof ApiError && error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });
    }

    if (error.message?.includes('not found') || error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
      stack: error.stack
    });
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
    logger.info(`[Controller.getStudentProfile] START — req.user=${JSON.stringify(req.user)}`);
    if (!req.user?.id) {
      logger.error('[Controller.getStudentProfile] req.user.id is missing after auth middleware');
      throw new ApiError(401, 'Authenticated user not found');
    }
    const userId = req.user.id;

    // Verify that the logged-in user's ID exists in the User table
    const userRecord = await prisma.user.findUnique({ where: { id: userId } });
    if (!userRecord) {
      logger.warn(`[Controller.getStudentProfile] User ID ${userId} not found in User table`);
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify that the student record exists in the StudentProfile table
    const studentRecord = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!studentRecord) {
      logger.warn(`[Controller.getStudentProfile] StudentProfile not found for user ID ${userId}`);
      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });
    }

    logger.info(`[Controller.getStudentProfile] Calling service for userId=${userId}`);
    const profile = await studentService.getProfileByUserId(userId);
    logger.debug(`[Controller.getStudentProfile] Service returned profile successfully`);
    responseSuccess(res, 'Profile fetched successfully', profile);
  } catch (error: any) {
    console.error("========== ERROR ==========");
    console.error(error);
    console.error(error.stack);

    if (error instanceof ApiError && error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });
    }

    if (error.message?.includes('not found') || error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
      stack: error.stack
    });
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
    logger.info(`[Controller.updateStudentProfile] START — req.user=${JSON.stringify(req.user)}`);
    if (!req.user?.id) {
      logger.error('[Controller.updateStudentProfile] req.user.id is missing after auth middleware');
      throw new ApiError(401, 'Authenticated user not found');
    }
    const userId = req.user.id;

    // Verify that the logged-in user's ID exists in the User table
    const userRecord = await prisma.user.findUnique({ where: { id: userId } });
    if (!userRecord) {
      logger.warn(`[Controller.updateStudentProfile] User ID ${userId} not found in User table`);
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const files = (req as any).files;
    logger.debug(`[Controller.updateStudentProfile] Calling service for userId=${userId}, fields=${Object.keys(req.body).join(',')}`);
    const profile = await studentService.updateProfile(userId, req.body, files);
    logger.debug(`[Controller.updateStudentProfile] Service returned updated profile successfully`);
    responseSuccess(res, 'Profile updated successfully', profile);
  } catch (error: any) {
    console.error("========== ERROR ==========");
    console.error(error);
    console.error(error.stack);

    if (error instanceof ApiError && error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });
    }

    if (error.message?.includes('not found') || error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "Student profile not found"
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
      stack: error.stack
    });
  }
};
