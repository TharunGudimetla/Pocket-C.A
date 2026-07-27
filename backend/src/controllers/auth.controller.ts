import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const result = await authService.register({ name, email, password });
  sendSuccess(res, 201, 'Account created successfully', result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  sendSuccess(res, 200, 'Logged in successfully', result);
});
