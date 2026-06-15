// src/controllers/student.controller.ts
import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service';
import { responseSuccess } from '../utils/response';

const studentService = new StudentService();

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
