import bcrypt from 'bcrypt';
import { MessageRole } from '../types';

interface MemoryUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

interface MemoryConversation {
  _id: string;
  user: string;
  title: string;
  pinned: boolean;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface MemoryMessage {
  _id: string;
  conversation: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

const users = new Map<string, MemoryUser>();
const conversations = new Map<string, MemoryConversation>();
const messages = new Map<string, MemoryMessage>();

// Seed default demo user for instant login during local development
(async () => {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const now = new Date();
    const demoUser: MemoryUser = {
      _id: 'demo_user_id',
      name: 'Demo User',
      email: 'demo@pocketca.com',
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
      comparePassword(candidate: string) {
        return bcrypt.compare(candidate, this.password);
      },
    };
    users.set(demoUser._id, demoUser);
  } catch {
    // ignore
  }
})();

function createId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function byNewestConversation(a: MemoryConversation, b: MemoryConversation): number {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
}

export const memoryStore = {
  async findUserByEmail(email: string): Promise<MemoryUser | null> {
    const normalized = email.toLowerCase();
    return [...users.values()].find((user) => user.email === normalized) ?? null;
  },

  async findUserById(id: string): Promise<MemoryUser | null> {
    return users.get(id) ?? null;
  },

  async createUser(data: Pick<MemoryUser, 'name' | 'email' | 'password'>): Promise<MemoryUser> {
    const now = new Date();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user: MemoryUser = {
      _id: createId(),
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
      comparePassword(candidate: string) {
        return bcrypt.compare(candidate, this.password);
      },
    };

    users.set(user._id, user);
    return user;
  },

  async createConversation(userId: string, title: string): Promise<MemoryConversation> {
    const now = new Date();
    const conversation: MemoryConversation = {
      _id: createId(),
      user: userId,
      title,
      pinned: false,
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now,
    };

    conversations.set(conversation._id, conversation);
    return conversation;
  },

  async findConversationById(id: string): Promise<MemoryConversation | null> {
    return conversations.get(id) ?? null;
  },

  async findConversationForUser(
    id: string,
    userId: string
  ): Promise<MemoryConversation | null> {
    const conversation = conversations.get(id);
    return conversation?.user === userId ? conversation : null;
  },

  async listConversationsForUser(userId: string): Promise<MemoryConversation[]> {
    return [...conversations.values()]
      .filter((conversation) => conversation.user === userId)
      .sort(byNewestConversation);
  },

  async touchConversation(id: string): Promise<MemoryConversation | null> {
    const conversation = conversations.get(id);
    if (!conversation) return null;

    conversation.lastMessageAt = new Date();
    conversation.updatedAt = conversation.lastMessageAt;
    return conversation;
  },

  async updateConversationTitle(
    id: string,
    title: string
  ): Promise<MemoryConversation | null> {
    const conversation = conversations.get(id);
    if (!conversation) return null;

    conversation.title = title;
    conversation.updatedAt = new Date();
    return conversation;
  },

  async deleteConversationForUser(
    id: string,
    userId: string
  ): Promise<MemoryConversation | null> {
    const conversation = conversations.get(id);
    if (!conversation || conversation.user !== userId) return null;

    conversations.delete(id);
    return conversation;
  },

  async createMessage(
    conversationId: string,
    role: MessageRole,
    content: string
  ): Promise<MemoryMessage> {
    const message: MemoryMessage = {
      _id: createId(),
      conversation: conversationId,
      role,
      content,
      createdAt: new Date(),
    };

    messages.set(message._id, message);
    return message;
  },

  async listMessagesByConversation(conversationId: string): Promise<MemoryMessage[]> {
    return [...messages.values()]
      .filter((message) => message.conversation === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  },

  async deleteMessagesByConversation(conversationId: string): Promise<void> {
    for (const [id, message] of messages.entries()) {
      if (message.conversation === conversationId) {
        messages.delete(id);
      }
    }
  },
};
