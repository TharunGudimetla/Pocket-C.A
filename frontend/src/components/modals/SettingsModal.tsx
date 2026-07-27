import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Sun, Moon, Cpu, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex w-full max-w-md flex-col rounded-2xl border border-border bg-surface p-6 shadow-floating overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar text-brand-blue border border-border">
                <Settings size={18} />
              </div>
              <h3 className="text-[16px] font-bold text-ink">Settings</h3>
            </div>
            <button onClick={onClose} className="rounded-xl p-1.5 text-ink-muted hover:bg-sidebar">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-5 pt-5">
            {/* Appearance Section */}
            <div>
              <label className="text-[12px] font-bold tracking-wider text-ink-faint uppercase">Appearance</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${
                    theme === 'light'
                      ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                      : 'border-border bg-sidebar text-ink-muted hover:text-ink'
                  }`}
                >
                  <Sun size={16} /> Light Mode
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all ${
                    theme === 'dark'
                      ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                      : 'border-border bg-sidebar text-ink-muted hover:text-ink'
                  }`}
                >
                  <Moon size={16} /> Dark Mode
                </button>
              </div>
            </div>

            {/* AI Engine Info */}
            <div>
              <label className="text-[12px] font-bold tracking-wider text-ink-faint uppercase">AI Engine & Domain</label>
              <div className="mt-2 rounded-xl border border-border bg-card p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-semibold text-ink">
                    <Cpu size={15} className="text-brand-teal" /> Assistant Version
                  </span>
                  <span className="text-xs font-mono font-bold text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded">v2.0 Pro</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-semibold text-ink">
                    <ShieldCheck size={15} className="text-emerald-500" /> Domain Scope
                  </span>
                  <span className="text-xs text-ink-muted font-medium">Accounting & Finance ONLY</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
