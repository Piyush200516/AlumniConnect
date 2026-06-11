// src/utils/response.ts
import { Response } from 'express';

interface SuccessPayload<T = any> {
  success: true;
  message: string;
  data?: T;
}

interface ErrorPayload {
  success: false;
  message: string;
  errors?: any[];
}

export const responseSuccess = <T>(res: Response, message: string, data?: T) => {
  return res.status(200).json({ success: true, message, data });
};

export const responseError = (res: Response, payload: ErrorPayload, statusCode = 500) => {
  const { message, errors } = payload;
  return res.status(statusCode).json({ success: false, message, errors });
};
