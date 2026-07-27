import { Request } from 'express';

export type MessageRole = 'user' | 'assistant';

export interface AuthUserPayload {
  userId: string;
  email: string;
}

/**
 * Express Request extended with the authenticated user, set by
 * the `authenticate` middleware after verifying the JWT.
 */
export interface AuthRequest extends Request {
  user?: AuthUserPayload;
}

export interface AiReply {
  content: string;
  isOnTopic: boolean;
}
