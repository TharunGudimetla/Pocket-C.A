import { conversationRepository } from '../repositories/conversation.repository';
import { messageRepository } from '../repositories/message.repository';
import { ApiError } from '../utils/ApiError';
import { generateReply } from './ai.service';

function deriveTitle(question: string): string {
  const trimmed = question.trim();
  if (trimmed.length <= 60) return trimmed;
  return `${trimmed.slice(0, 57)}...`;
}

export const chatService = {
  /**
   * Handles one turn of the conversation:
   * validate -> ensure conversation -> store user message ->
   * generate AI reply -> store AI message -> return both.
   */
  async sendMessage(userId: string, question: string, conversationId?: string) {
    let conversation = conversationId
      ? await conversationRepository.findByIdForUser(conversationId, userId)
      : null;

    if (conversationId && !conversation) {
      throw ApiError.notFound('Conversation not found');
    }

    let isFirstMessage = false;
    let existingMessages: Array<{ role: string; content: string }> = [];

    if (!conversation) {
      conversation = await conversationRepository.create(userId, deriveTitle(question));
      isFirstMessage = true;
    } else {
      const msgs = await messageRepository.listByConversation(String(conversation._id));
      existingMessages = msgs.map((m) => ({ role: m.role, content: m.content }));
      isFirstMessage = msgs.length === 0;
    }

    const userMessage = await messageRepository.create(
      String(conversation._id),
      'user',
      question
    );

    const aiReply = await generateReply(question, {
      isFirstMessage,
      history: existingMessages,
    });

    const assistantMessage = await messageRepository.create(
      String(conversation._id),
      'assistant',
      aiReply.content
    );

    await conversationRepository.touch(String(conversation._id));

    return {
      conversationId: String(conversation._id),
      title: conversation.title,
      userMessage,
      assistantMessage,
    };
  },

  async getHistory(userId: string) {
    return conversationRepository.listForUser(userId);
  },

  async getConversation(userId: string, conversationId: string) {
    const conversation = await conversationRepository.findByIdForUser(conversationId, userId);
    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }
    const messages = await messageRepository.listByConversation(conversationId);
    return { conversation, messages };
  },

  async deleteConversation(userId: string, conversationId: string) {
    const conversation = await conversationRepository.deleteForUser(conversationId, userId);
    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }
    await messageRepository.deleteByConversation(conversationId);
  },
};
