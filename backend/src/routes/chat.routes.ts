import { Router } from 'express';
import {
  deleteConversation,
  getConversationById,
  getHistory,
  sendMessage,
} from '../controllers/chat.controller';
import { conversationIdValidator, sendMessageValidator } from '../validators/chat.validator';
import { validateRequest } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', sendMessageValidator, validateRequest, sendMessage);
router.get('/history', getHistory);
router.get('/:id', conversationIdValidator, validateRequest, getConversationById);
router.delete('/:id', conversationIdValidator, validateRequest, deleteConversation);

export default router;
