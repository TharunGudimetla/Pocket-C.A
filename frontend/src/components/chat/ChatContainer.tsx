import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatMessage } from '../../types/chat';
import { ChatBubble } from './ChatBubble';
import { EmptyState } from './EmptyState';

interface ChatContainerProps {
  messages: ChatMessage[];
  isSending: boolean;
  onSelectSuggestion: (question: string) => void;
}

export function ChatContainer({ messages, isSending, onSelectSuggestion }: ChatContainerProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isSending]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 overflow-y-auto scrollbar-thin">
        <EmptyState onSelect={onSelectSuggestion} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <ChatBubble key={message._id} message={message} />
          ))}
          {isSending && (
            <ChatBubble
              key="pending"
              message={{
                _id: 'pending',
                role: 'assistant',
                content: '',
                createdAt: new Date().toISOString(),
                pending: true,
              }}
            />
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
