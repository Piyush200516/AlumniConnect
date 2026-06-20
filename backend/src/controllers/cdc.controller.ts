import { Request, Response, NextFunction } from 'express';
import { responseSuccess } from '../utils/response';
import { CdcService } from '../services/cdc.service';

const cdcService = new CdcService();

export const getCdcDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await cdcService.getDashboard();
    responseSuccess(res, 'CDC dashboard data fetched successfully', data);
  } catch (err) {
    next(err);
  }
};
