import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Paperclip, SendHorizontal, BookOpen, ShieldAlert, FileText, X } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { useAutoResizeTextarea } from '../../hooks/useAutoResizeTextarea';

interface ChatInputProps {
  onSend: (question: string) => void;
  disabled?: boolean;
  onOpenKnowledgeBase?: () => void;
}

const PLACEHOLDERS = [
  'Ask about GST...',
  'Ask about Accounting...',
  'Ask about Finance...',
  'Ask about Journal Entries...',
  'Ask about Balance Sheets...',
];

const MAX_LENGTH = 2000;

export function ChatInput({ onSend, disabled, onOpenKnowledgeBase }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    content: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useAutoResizeTextarea(value);

  // Automatically rotate placeholder
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeKb = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      let text = (event.target?.result as string) || '';

      // Clean up binary control characters if PDF or raw file uploaded
      if (file.name.toLowerCase().endsWith('.pdf') || text.includes('%PDF')) {
        text = text
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }

      setAttachedFile({
        name: file.name,
        size: sizeKb,
        content: text.slice(0, 50000),
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    let finalPrompt = value.trim();

    if (attachedFile) {
      const docHeader = `[ATTACHED FINANCIAL DOCUMENT: ${attachedFile.name}]\n${attachedFile.content}\n\n[USER QUESTION]: `;
      finalPrompt = finalPrompt
        ? `${docHeader}${finalPrompt}`
        : `${docHeader}Please analyze this attached financial document, verify the GST and TDS calculations, and summarize key line items.`;
    }

    if (!finalPrompt || disabled) return;
    onSend(finalPrompt);
    setValue('');
    setAttachedFile(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border bg-surface/80 px-4 pb-4 pt-3 backdrop-blur-md sm:px-6 transition-colors">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".txt,.csv,.json,.pdf,.doc,.docx"
        className="hidden"
      />

      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-3xl flex-col rounded-2xl border border-border bg-card p-3 shadow-floating focus-within:border-brand-blue/50 focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all"
      >
        {/* Attached Document Preview Badge */}
        {attachedFile && (
          <div className="mb-2 flex items-center justify-between rounded-xl border border-brand-teal/30 bg-brand-teal/10 px-3 py-1.5 text-xs font-semibold text-brand-teal">
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={15} className="shrink-0" />
              <span className="truncate">{attachedFile.name}</span>
              <span className="text-[10px] opacity-75 font-mono">({attachedFile.size})</span>
            </div>
            <button
              type="button"
              onClick={() => setAttachedFile(null)}
              className="rounded-lg p-1 hover:bg-brand-teal/20 hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder={attachedFile ? 'Ask Pocket C.A. to analyze this document...' : PLACEHOLDERS[placeholderIndex]}
          rows={1}
          disabled={disabled}
          className="max-h-[200px] min-h-[32px] bg-transparent text-[14.5px] text-ink placeholder:text-ink-faint focus:outline-none"
        />

        <div className="mt-2.5 flex items-center justify-between border-t border-border/60 pt-2">
          {/* Action Toolbar Icons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Financial Document / Invoice (.txt, .csv, .json)"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-muted hover:bg-sidebar hover:text-brand-blue transition-colors"
            >
              <Paperclip size={17} />
            </button>

            {onOpenKnowledgeBase && (
              <button
                type="button"
                onClick={onOpenKnowledgeBase}
                title="Knowledge Base Guide"
                className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-muted hover:bg-sidebar hover:text-brand-teal transition-colors"
              >
                <BookOpen size={17} />
              </button>
            )}

            <span className="ml-2 hidden text-[11.5px] text-ink-faint sm:inline">
              Press <kbd className="rounded border border-border bg-sidebar px-1.5 py-0.5 font-sans font-semibold">Enter</kbd> to send
            </span>
          </div>

          {/* Send Button & Character Count */}
          <div className="flex items-center gap-3">
            <span className="text-[11.5px] font-medium text-ink-faint">
              {value.length}/{MAX_LENGTH}
            </span>
            <button
              type="submit"
              disabled={(!value.trim() && !attachedFile) || disabled}
              aria-label="Send message"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-card transition-all enabled:hover:scale-105 enabled:hover:bg-brand-gradient-hover disabled:opacity-40"
            >
              <SendHorizontal size={17} />
            </button>
          </div>
        </div>
      </form>

      {/* Footer Legal & Educational Disclaimer */}
      <div className="mx-auto mt-2.5 flex max-w-3xl items-center justify-center gap-1.5 text-center text-[11.5px] font-medium text-ink-muted">
        <ShieldAlert size={13} className="text-amber-500 shrink-0" />
        <span>
          Educational purposes only &middot; Always verify important accounting and tax advice with qualified professionals.
        </span>
      </div>
    </div>
  );
}
