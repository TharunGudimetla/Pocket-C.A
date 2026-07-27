import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex w-full max-w-lg flex-col rounded-2xl border border-border bg-surface p-6 shadow-floating overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar text-brand-blue border border-border">
                <HelpCircle size={18} />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-ink">Help & Pocket C.A. Scope</h3>
                <p className="text-xs text-ink-muted">AI Chartered Accountant Assistant</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-xl p-1.5 text-ink-muted hover:bg-sidebar">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4 pt-4 text-sm text-ink-muted">
            <p>
              <strong className="text-ink">Pocket C.A.</strong> is a domain-specialized AI assistant designed specifically for financial, tax, and accounting advisory.
            </p>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-2">Supported Domains</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  'GST & Input Tax Credit',
                  'Income Tax & TDS/TCS',
                  'Financial Statements (P&L, BS)',
                  'Journal Entries & Ledger',
                  'Budgeting & Forecasting',
                  'Financial Ratios & Metrics',
                  'Payroll & Compensation',
                  'Audit & Companies Act Rules',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 font-medium text-ink">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>
                Pocket C.A. provides educational and informational responses. Always verify tax filings and official audits with a certified Chartered Accountant.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
