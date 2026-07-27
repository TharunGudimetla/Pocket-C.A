export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  _id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  pending?: boolean;
  streamingContent?: string;
}

export interface Conversation {
  _id: string;
  title: string;
  pinned: boolean;
  lastMessageAt: string;
  createdAt: string;
}

export interface SendMessageResponse {
  conversationId: string;
  title: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}
