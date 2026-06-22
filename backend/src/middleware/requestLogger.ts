// src/middleware/requestLogger.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  const start = Date.now();
  logger.info(`${req.method} ${req.originalUrl}`);
  _res.on('finish', () => {
    const duration = Date.now() - start;
    const logMsg = `${req.method} ${req.originalUrl} ${_res.statusCode} - ${duration}ms`;
    if (duration > 100) {
      logger.warn(`[SLOW API WARNING] ${logMsg}`);
    } else {
      logger.info(logMsg);
    }
  });
  next();
};

