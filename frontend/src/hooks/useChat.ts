import { useCallback, useEffect, useState } from 'react';
import { chatService } from '../services/chat.service';
import { ChatMessage, Conversation } from '../types/chat';

function tempId() {
  return `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const STREAM_CHUNK_SIZE = 4;
const STREAM_INTERVAL_MS = 18;

export function useChat(isAuthenticated: boolean) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingHistory(true);
    try {
      const list = await chatService.getHistory();
      setConversations(list);
    } catch {
      // Silently ignore - sidebar just stays empty. A banner would be noisy
      // for a background refresh.
    } finally {
      setIsLoadingHistory(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const openConversation = useCallback(async (id: string) => {
    setError(null);
    setActiveId(id);
    try {
      const { messages: msgs } = await chatService.getConversation(id);
      setMessages(msgs);
    } catch {
      setError('Could not load that conversation.');
    }
  }, []);

  const startNewChat = useCallback(() => {
    setActiveId(null);
    setMessages([]);
    setError(null);
  }, []);

  const removeConversation = useCallback(
    async (id: string) => {
      await chatService.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (activeId === id) startNewChat();
    },
    [activeId, startNewChat]
  );

  const sendMessage = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || isSending) return;

      setError(null);
      const optimisticUserMsg: ChatMessage = {
        _id: tempId(),
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticUserMsg]);
      setIsSending(true);

      try {
        const res = await chatService.sendMessage(trimmed, activeId ?? undefined);
        const fullAssistantContent = res.assistantMessage.content;
        const streamingAssistantMessage: ChatMessage = {
          ...res.assistantMessage,
          content: '',
          streamingContent: fullAssistantContent,
        };

        setMessages((prev) => [
          ...prev.filter((m) => m._id !== optimisticUserMsg._id),
          res.userMessage,
          streamingAssistantMessage,
        ]);

        if (!activeId) {
          setActiveId(res.conversationId);
          loadHistory();
        } else {
          setConversations((prev) =>
            prev.map((c) =>
              c._id === activeId ? { ...c, lastMessageAt: new Date().toISOString() } : c
            )
          );
        }

        setIsSending(false);
        let cursor = 0;
        const streamTimer = window.setInterval(() => {
          cursor = Math.min(cursor + STREAM_CHUNK_SIZE, fullAssistantContent.length);
          setMessages((prev) =>
            prev.map((message) =>
              message._id === res.assistantMessage._id
                ? {
                    ...message,
                    content: fullAssistantContent.slice(0, cursor),
                    streamingContent:
                      cursor >= fullAssistantContent.length ? undefined : fullAssistantContent,
                  }
                : message
            )
          );

          if (cursor >= fullAssistantContent.length) {
            window.clearInterval(streamTimer);
          }
        }, STREAM_INTERVAL_MS);
      } catch {
        setError("Something went wrong sending that. Please try again.");
        setMessages((prev) => prev.filter((m) => m._id !== optimisticUserMsg._id));
        setIsSending(false);
      }
    },
    [activeId, isSending, loadHistory]
  );

  return {
    conversations,
    activeId,
    messages,
    isSending,
    isLoadingHistory,
    error,
    openConversation,
    startNewChat,
    removeConversation,
    sendMessage,
  };
}
