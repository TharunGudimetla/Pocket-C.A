import { cn } from '../../lib/utils';

export function Logo({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-card',
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
        <path
          d="M6 4h9a5 5 0 0 1 0 10H9v6H6V4zm3 3v4h6a2 2 0 0 0 0-4H9z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
