import { Response } from 'express';

/**
 * Sends a consistently-shaped success response.
 * { success: true, message, data }
 */
export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
  });
}
