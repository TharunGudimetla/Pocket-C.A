import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  PanelLeftClose,
  User as UserIcon,
  Settings,
  HelpCircle,
  LogOut,
  Trash2,
  BookOpen,
  Sparkles,
  X,
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/button';
import { Conversation } from '../../types/chat';
import { AuthUser } from '../../types/auth';
import { cn } from '../../lib/utils';
import { KnowledgeBaseModal } from '../modals/KnowledgeBaseModal';
import { SettingsModal } from '../modals/SettingsModal';
import { HelpModal } from '../modals/HelpModal';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  user: AuthUser | null;
  onLogout: () => void;
  onSelectPrompt?: (prompt: string) => void;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  onClose,
  user,
  onLogout,
  onSelectPrompt,
}: SidebarProps) {
  const [query, setQuery] = useState('');
  const [isKBOpen, setIsKBOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const filtered = useMemo(
    () => conversations.filter((c) => c.title.toLowerCase().includes(query.toLowerCase())),
    [conversations, query]
  );

  const pinned = useMemo(() => filtered.filter((c) => c.pinned), [filtered]);

  const unpinnedGrouped = useMemo(() => {
    const unpinnedList = filtered.filter((c) => !c.pinned);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOfLastWeek = startOfToday - 7 * 86400000;

    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const lastWeek: Conversation[] = [];
    const lastMonth: Conversation[] = [];

    unpinnedList.forEach((c) => {
      const timestamp = new Date(c.lastMessageAt || c.createdAt).getTime();
      if (isNaN(timestamp) || timestamp >= startOfToday) {
        today.push(c);
      } else if (timestamp >= startOfYesterday) {
        yesterday.push(c);
      } else if (timestamp >= startOfLastWeek) {
        lastWeek.push(c);
      } else {
        lastMonth.push(c);
      }
    });

    return { today, yesterday, lastWeek, lastMonth };
  }, [filtered]);

  const renderItem = (c: Conversation) => (
    <button
      key={c._id}
      onClick={() => onSelect(c._id)}
      className={cn(
        'group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13.5px] font-medium transition-all duration-150',
        activeId === c._id
          ? 'bg-card shadow-card text-ink font-semibold border border-border'
          : 'text-ink-muted hover:bg-surface/80 hover:text-ink'
      )}
    >
      <MessageSquare size={15} className="shrink-0 text-brand-blue/70 dark:text-teal-400/70" />
      <span className="min-w-0 flex-1 truncate">{c.title}</span>
      {c.pinned && <Pin size={12} className="shrink-0 text-brand-teal fill-brand-teal" />}
      <span
        role="button"
        tabIndex={-1}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(c._id);
        }}
        className="shrink-0 rounded-lg p-1 text-ink-faint opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
        aria-label="Delete conversation"
      >
        <Trash2 size={13} />
      </span>
    </button>
  );

  return (
    <>
      <motion.aside
        initial={{ x: -16, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex h-full w-[290px] shrink-0 flex-col border-r border-border bg-sidebar transition-colors"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <Logo size={36} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[15px] font-extrabold leading-tight text-ink">
                  Pocket <span className="bg-brand-gradient bg-clip-text text-transparent">C.A.</span>
                </p>
                <span className="rounded bg-brand-blue/10 px-1.5 py-0.5 text-[9.5px] font-bold text-brand-blue border border-brand-blue/20">
                  AI PRO
                </span>
              </div>
              <p className="truncate text-[10px] font-bold tracking-wider text-ink-faint uppercase">
                Chartered Accountant AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-ink-muted hover:bg-surface hover:text-ink transition-colors"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* Action Controls */}
        <div className="px-4 pt-2 space-y-2.5">
          <Button
            onClick={onNewChat}
            className="w-full justify-center gap-2 rounded-xl bg-brand-gradient text-white shadow-card hover:bg-brand-gradient-hover font-semibold py-2.5 transition-all"
            size="default"
          >
            <Plus size={17} strokeWidth={2.5} />
            New Chat
          </Button>

          {/* Search Box */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats..."
              className="h-9 w-full rounded-xl border border-border bg-surface pl-8 pr-7 text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Knowledge Base Section */}
        <div className="px-4 pt-3">
          <button
            onClick={() => setIsKBOpen(true)}
            className="group flex w-full items-center justify-between rounded-xl border border-brand-teal/20 bg-brand-teal/5 px-3 py-2.5 text-left transition-all hover:bg-brand-teal/10 hover:border-brand-teal/30"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-teal text-white shadow-sm">
                <BookOpen size={14} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-ink">Knowledge Base</p>
                <p className="truncate text-[10.5px] text-ink-muted">GST, TDS & Ind AS Guide</p>
              </div>
            </div>
            <Sparkles size={14} className="text-brand-teal shrink-0 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Recent Conversations List Grouped */}
        <div className="mt-3 flex-1 space-y-4 overflow-y-auto scrollbar-thin px-3 pb-3">
          {pinned.length > 0 && (
            <div>
              <p className="px-2 pb-1 text-[10.5px] font-bold tracking-wider uppercase text-ink-faint">
                PINNED
              </p>
              <div className="space-y-1">{pinned.map(renderItem)}</div>
            </div>
          )}

          {/* Grouped Recent Chats */}
          {unpinnedGrouped.today.length > 0 && (
            <div>
              <p className="px-2 pb-1 text-[10.5px] font-bold tracking-wider uppercase text-ink-faint">
                TODAY
              </p>
              <div className="space-y-1">{unpinnedGrouped.today.map(renderItem)}</div>
            </div>
          )}

          {unpinnedGrouped.yesterday.length > 0 && (
            <div>
              <p className="px-2 pb-1 text-[10.5px] font-bold tracking-wider uppercase text-ink-faint">
                YESTERDAY
              </p>
              <div className="space-y-1">{unpinnedGrouped.yesterday.map(renderItem)}</div>
            </div>
          )}

          {unpinnedGrouped.lastWeek.length > 0 && (
            <div>
              <p className="px-2 pb-1 text-[10.5px] font-bold tracking-wider uppercase text-ink-faint">
                LAST WEEK
              </p>
              <div className="space-y-1">{unpinnedGrouped.lastWeek.map(renderItem)}</div>
            </div>
          )}

          {unpinnedGrouped.lastMonth.length > 0 && (
            <div>
              <p className="px-2 pb-1 text-[10.5px] font-bold tracking-wider uppercase text-ink-faint">
                LAST MONTH
              </p>
              <div className="space-y-1">{unpinnedGrouped.lastMonth.map(renderItem)}</div>
            </div>
          )}

          {filtered.length === 0 && (
            <p className="px-3 py-4 text-center text-[12.5px] text-ink-faint">
              {query ? 'No matching chats found.' : 'No conversations yet.'}
            </p>
          )}
        </div>

        {/* Footer Navigation & User Profile Card */}
        <div className="border-t border-border p-3 space-y-2 bg-sidebar/80">
          <div className="space-y-0.5">
            <SidebarFooterLink icon={Settings} label="Settings" onClick={() => setIsSettingsOpen(true)} />
            <SidebarFooterLink icon={HelpCircle} label="Help & FAQ" onClick={() => setIsHelpOpen(true)} />
          </div>

          {/* User Profile Card */}
          <div className="mt-2 flex items-center justify-between rounded-xl border border-border bg-card p-2.5 shadow-card">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-xs font-extrabold text-white">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : <UserIcon size={15} />}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-ink">{user?.name || 'Finance User'}</p>
                <p className="truncate text-[10.5px] font-medium text-brand-teal">Chartered Accountant</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="rounded-lg p-1.5 text-ink-faint hover:bg-red-500/10 hover:text-red-500 transition-colors"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Modals */}
      <KnowledgeBaseModal
        isOpen={isKBOpen}
        onClose={() => setIsKBOpen(false)}
        onSelectPrompt={onSelectPrompt}
      />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
}

function SidebarFooterLink({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof UserIcon;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left text-[13px] font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
    >
      <Icon size={15} />
      <span className="truncate">{label}</span>
    </button>
  );
}
