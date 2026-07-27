import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from '../chat/Header';
import { ChatContainer } from '../chat/ChatContainer';
import { ChatInput } from '../chat/ChatInput';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import { KnowledgeBaseModal } from '../modals/KnowledgeBaseModal';

export function AppShell({ auth }: { auth: ReturnType<typeof useAuth> }) {
  const chat = useChat(!!auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isKBOpen, setIsKBOpen] = useState(false);

  const activeConversation = chat.conversations.find((c) => c._id === chat.activeId);
  const title = activeConversation?.title ?? 'New Chat';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas text-ink transition-colors">
      <AnimatePresence>
        {sidebarOpen && (
          <Sidebar
            conversations={chat.conversations}
            activeId={chat.activeId}
            onSelect={chat.openConversation}
            onNewChat={chat.startNewChat}
            onDelete={chat.removeConversation}
            onClose={() => setSidebarOpen(false)}
            user={auth.user}
            onLogout={auth.logout}
            onSelectPrompt={chat.sendMessage}
          />
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={title}
          onToggleSidebar={() => setSidebarOpen(true)}
          sidebarOpen={sidebarOpen}
        />

        {chat.error && (
          <div className="mx-auto mt-3 w-full max-w-3xl rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 shadow-sm">
            {chat.error}
          </div>
        )}

        <ChatContainer
          messages={chat.messages}
          isSending={chat.isSending}
          onSelectSuggestion={chat.sendMessage}
        />

        <ChatInput
          onSend={chat.sendMessage}
          disabled={chat.isSending}
          onOpenKnowledgeBase={() => setIsKBOpen(true)}
        />
      </div>

      <KnowledgeBaseModal
        isOpen={isKBOpen}
        onClose={() => setIsKBOpen(false)}
        onSelectPrompt={chat.sendMessage}
      />
    </div>
  );
}
