import { motion } from 'framer-motion';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface SuggestedQuestionProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  chipColor: string;
  onClick: () => void;
}

export function SuggestedQuestion({
  icon: Icon,
  title,
  subtitle,
  chipColor,
  onClick,
}: SuggestedQuestionProps) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group flex items-center justify-between gap-3.5 rounded-2xl border border-border bg-card p-4 text-left shadow-card transition-all hover:border-brand-blue/40 hover:shadow-floating"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink transition-transform group-hover:scale-105"
          style={{ backgroundColor: chipColor }}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14.5px] font-bold text-ink group-hover:text-brand-blue dark:group-hover:text-teal-400 transition-colors">
            {title}
          </p>
          <p className="truncate text-[12.5px] text-ink-muted leading-relaxed">{subtitle}</p>
        </div>
      </div>

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar text-ink-faint group-hover:bg-brand-blue group-hover:text-white transition-all">
        <ArrowUpRight size={14} />
      </div>
    </motion.button>
  );
}
