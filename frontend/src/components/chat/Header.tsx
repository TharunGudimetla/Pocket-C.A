import { PanelLeft, Sparkles, Sun, Moon, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function Header({ title, onToggleSidebar, sidebarOpen }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:px-6 transition-colors">
      <div className="flex min-w-0 items-center gap-3">
        {!sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            aria-label="Open sidebar"
            className="hover:bg-sidebar text-ink-muted hover:text-ink"
          >
            <PanelLeft size={19} />
          </Button>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-bold tracking-tight text-ink">{title}</h2>
          <p className="hidden text-[12px] text-ink-muted sm:flex sm:items-center sm:gap-1.5">
            <ShieldCheck size={13} className="text-brand-teal" />
            Educational CA Assistant &middot; Always verify professional advice
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-brand-teal/10 px-3 py-1 text-[12px] font-semibold text-brand-teal border border-brand-teal/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal"></span>
          </span>
          <Sparkles size={13} />
          AI Accountant Active
        </span>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-sidebar text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} className="text-slate-700" />
          )}
        </button>
      </div>
    </header>
  );
}
