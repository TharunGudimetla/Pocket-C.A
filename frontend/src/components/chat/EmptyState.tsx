import { motion } from 'framer-motion';
import {
  Percent,
  BookOpenCheck,
  FileText,
  TrendingUp,
  NotebookPen,
  Scale,
  Target,
  Sparkles,
  Calculator,
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { SuggestedQuestion } from './SuggestedQuestion';

const SUGGESTIONS = [
  {
    icon: Percent,
    title: 'Explain GST',
    subtitle: 'Goods & Services Tax rate slabs and applicability',
    chip: 'var(--chip-sky)',
    question: 'What is GST and how does it work?',
  },
  {
    icon: BookOpenCheck,
    title: 'Debit vs Credit',
    subtitle: 'Golden rules of accounting & entry placement',
    chip: 'var(--chip-rose)',
    question: 'Explain the difference between Debit and Credit with golden rules.',
  },
  {
    icon: NotebookPen,
    title: 'Prepare Journal Entry',
    subtitle: 'How to record double-entry transactions',
    chip: 'var(--chip-violet)',
    question: 'How to prepare a Journal Entry? Give examples.',
  },
  {
    icon: Calculator,
    title: 'Calculate Simple Interest',
    subtitle: 'Interest formula, compounding, & examples',
    chip: 'var(--chip-amber)',
    question: 'How to calculate Simple Interest? Explain with a formula and example.',
  },
  {
    icon: FileText,
    title: 'What is TDS?',
    subtitle: 'Tax Deducted at Source thresholds & sections',
    chip: 'var(--chip-mint)',
    question: 'What is TDS (Tax Deducted at Source) and key section rates?',
  },
  {
    icon: TrendingUp,
    title: 'Balance Sheet Basics',
    subtitle: 'Assets, liabilities, and owner equity structure',
    chip: 'var(--chip-sky)',
    question: 'Explain Balance Sheet basics with assets, liabilities, and equity.',
  },
  {
    icon: Target,
    title: 'Budget Planning',
    subtitle: 'Business cash flow & variance management',
    chip: 'var(--chip-rose)',
    question: 'What is Budget Planning and variance analysis in business finance?',
  },
  {
    icon: Scale,
    title: 'Assets vs Liabilities',
    subtitle: 'Current, fixed, long-term asset vs debt breakdown',
    chip: 'var(--chip-amber)',
    question: 'What is the difference between Assets and Liabilities?',
  },
];

export function EmptyState({ onSelect }: { onSelect: (question: string) => void }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-8">
      {/* Hero Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-8 flex flex-col items-center text-center"
      >
        <div className="mb-4 flex items-center justify-center">
          <Logo size={56} className="shadow-floating" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-brand-blue/10 px-3.5 py-1 text-xs font-bold text-brand-blue dark:text-teal-400 mb-3">
          <Sparkles size={14} />
          AI Powered Chartered Accountant Assistant
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Welcome to <span className="bg-brand-gradient bg-clip-text text-transparent">Pocket C.A.</span>
        </h1>

        <p className="mt-2.5 max-w-xl text-[14.5px] leading-relaxed text-ink-muted">
          Ask questions about accounting, taxation, GST, finance, budgeting, auditing and financial reporting.
        </p>
      </motion.div>

      {/* Suggested Question Cards Grid */}
      <div className="grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2">
        {SUGGESTIONS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <SuggestedQuestion
              icon={s.icon}
              title={s.title}
              subtitle={s.subtitle}
              chipColor={s.chip}
              onClick={() => onSelect(s.question)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
