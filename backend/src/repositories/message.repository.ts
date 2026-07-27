import { getStorageDriver } from '../config/storage';
import { Message } from '../models/Message';
import { MessageRole } from '../types';
import { memoryStore } from './memory.store';

export const messageRepository = {
  create(conversationId: string, role: MessageRole, content: string) {
    if (getStorageDriver() === 'memory') {
      return memoryStore.createMessage(conversationId, role, content);
    }

    return Message.create({ conversation: conversationId, role, content });
  },

  listByConversation(conversationId: string) {
    if (getStorageDriver() === 'memory') {
      return memoryStore.listMessagesByConversation(conversationId);
    }

    return Message.find({ conversation: conversationId }).sort({ createdAt: 1 });
  },

  deleteByConversation(conversationId: string) {
    if (getStorageDriver() === 'memory') {
      return memoryStore.deleteMessagesByConversation(conversationId);
    }

    return Message.deleteMany({ conversation: conversationId });
  },
};
