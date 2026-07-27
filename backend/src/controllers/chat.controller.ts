import { Response } from 'express';
import { AuthRequest } from '../types';
import { chatService } from '../services/chat.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { question, conversationId } = req.body;

  const result = await chatService.sendMessage(userId, question, conversationId);
  sendSuccess(res, 200, 'Message processed', result);
});

export const getHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const conversations = await chatService.getHistory(userId);
  sendSuccess(res, 200, 'Conversation history fetched', conversations);
});

export const getConversationById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  if (!id) throw ApiError.badRequest('Conversation id is required');

  const result = await chatService.getConversation(userId, id);
  sendSuccess(res, 200, 'Conversation fetched', result);
});

export const deleteConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  if (!id) throw ApiError.badRequest('Conversation id is required');

  await chatService.deleteConversation(userId, id);
  sendSuccess(res, 200, 'Conversation deleted');
});
