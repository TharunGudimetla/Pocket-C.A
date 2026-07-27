import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { isProduction } from '../config/env';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) logger.error(err.message, err);
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // Mongoose duplicate key error
  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    res.status(409).json({ success: false, message: 'Duplicate value violates a unique field' });
    return;
  }

  logger.error('Unhandled error', err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on our end. Please try again.',
    stack: isProduction ? undefined : (err as Error)?.stack,
  });
}
