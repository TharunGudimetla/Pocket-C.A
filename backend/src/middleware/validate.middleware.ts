import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError';

/**
 * Runs after express-validator chains; throws a 400 ApiError with the
 * full list of field errors if any validator failed.
 */
export function validateRequest(req: Request, _res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest('Validation failed', errors.array());
  }
  next();
}
