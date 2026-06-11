// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth.service';
import { responseSuccess, responseError } from '../utils/response';
import { AuthenticatedRequest } from '../types/express';
import { Role } from '../../prisma';

const authService = new AuthService();

/** STUDENT SIGN‑UP */
export const studentSignup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.studentSignup(req.body);
    responseSuccess(res, 'Student signup successful', result);
  } catch (err) {
    next(err);
  }
};

/** ALUMNI SIGN‑UP */
export const alumniSignup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.alumniSignup(req.body);
    responseSuccess(res, 'Alumni signup successful', result);
  } catch (err) {
    next(err);
  }
};

/** CDC LOGIN */
export const cdcLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.login(req.body, Role.CDC);
    responseSuccess(res, 'CDC login successful', result);
  } catch (err) {
    next(err);
  }
};

/** COMMON LOGIN (any role) */
export const commonLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.login(req.body);
    responseSuccess(res, 'Login successful', result);
  } catch (err) {
    next(err);
  }
};

// Role‑specific login handlers
export const studentLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.login(req.body, Role.STUDENT);
    responseSuccess(res, 'Student login successful', result);
  } catch (err) {
    next(err);
  }
};

export const alumniLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.login(req.body, Role.ALUMNI);
    responseSuccess(res, 'Alumni login successful', result);
  } catch (err) {
    next(err);
  }
};

/** EMAIL VERIFICATION */
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await authService.verifyEmail(req.query.token as string);
    responseSuccess(res, 'Email verified successfully');
  } catch (err) {
    next(err);
  }
};

/** FORGOT PASSWORD */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await authService.forgotPassword(req.body.email);
    responseSuccess(res, 'Password reset email sent');
  } catch (err) {
    next(err);
  }
};

/** RESET PASSWORD */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    responseSuccess(res, 'Password has been reset');
  } catch (err) {
    next(err);
  }
};
