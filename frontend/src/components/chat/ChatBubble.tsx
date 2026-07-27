import { motion } from 'framer-motion';
import { ChatMessage } from '../../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TypingIndicator } from './TypingIndicator';
import { Logo } from '../ui/Logo';
import { cn } from '../../lib/utils';

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('flex w-full gap-3.5', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && <Logo size={32} className="mt-1 shadow-card" />}

      <div
        className={cn(
          'text-[14.5px] leading-relaxed',
          isUser
            ? 'max-w-[min(640px,85%)] rounded-2xl rounded-tr-sm bg-brand-gradient px-4 py-3 text-white shadow-card font-medium'
            : 'min-w-0 flex-1 px-1 py-1.5 text-ink'
        )}
      >
        {message.pending ? (
          <TypingIndicator />
        ) : isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
      </div>
    </motion.div>
  );
}
