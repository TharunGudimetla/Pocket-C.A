import { getStorageDriver } from '../config/storage';
import { Conversation } from '../models/Conversation';
import { memoryStore } from './memory.store';

export const conversationRepository = {
  create(userId: string, title: string) {
    if (getStorageDriver() === 'memory') {
      return memoryStore.createConversation(userId, title);
    }

    return Conversation.create({ user: userId, title });
  },

  findById(id: string) {
    if (getStorageDriver() === 'memory') {
      return memoryStore.findConversationById(id);
    }

    return Conversation.findById(id);
  },

  findByIdForUser(id: string, userId: string) {
    if (getStorageDriver() === 'memory') {
      return memoryStore.findConversationForUser(id, userId);
    }

    return Conversation.findOne({ _id: id, user: userId });
  },

  listForUser(userId: string) {
    if (getStorageDriver() === 'memory') {
      return memoryStore.listConversationsForUser(userId);
    }

    return Conversation.find({ user: userId }).sort({ pinned: -1, lastMessageAt: -1 });
  },

  touch(id: string) {
    if (getStorageDriver() === 'memory') {
      return memoryStore.touchConversation(id);
    }

    return Conversation.findByIdAndUpdate(id, { lastMessageAt: new Date() });
  },

  updateTitle(id: string, title: string) {
    if (getStorageDriver() === 'memory') {
      return memoryStore.updateConversationTitle(id, title);
    }

    return Conversation.findByIdAndUpdate(id, { title }, { new: true });
  },

  deleteForUser(id: string, userId: string) {
    if (getStorageDriver() === 'memory') {
      return memoryStore.deleteConversationForUser(id, userId);
    }

    return Conversation.findOneAndDelete({ _id: id, user: userId });
  },
};
