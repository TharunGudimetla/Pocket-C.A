import { api } from './api';
import { ChatMessage, Conversation, SendMessageResponse } from '../types/chat';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const chatService = {
  async sendMessage(question: string, conversationId?: string): Promise<SendMessageResponse> {
    const { data } = await api.post<ApiEnvelope<SendMessageResponse>>('/chat', {
      question,
      conversationId,
    });
    return data.data;
  },

  async getHistory(): Promise<Conversation[]> {
    const { data } = await api.get<ApiEnvelope<Conversation[]>>('/chat/history');
    return data.data;
  },

  async getConversation(
    id: string
  ): Promise<{ conversation: Conversation; messages: ChatMessage[] }> {
    const { data } = await api.get<ApiEnvelope<{ conversation: Conversation; messages: ChatMessage[] }>>(
      `/chat/${id}`
    );
    return data.data;
  },

  async deleteConversation(id: string): Promise<void> {
    await api.delete(`/chat/${id}`);
  },
};
