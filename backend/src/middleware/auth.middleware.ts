import { NextFunction, Response } from 'express';
import { AuthRequest } from '../types';
import { ApiError } from '../utils/ApiError';
import { verifyToken } from '../utils/jwt';

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication token is missing');
  }

  const token = header.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }
}
