import { useLayoutEffect, useRef } from 'react';

/**
 * Grows a textarea's height to fit its content, up to maxHeight (px).
 */
export function useAutoResizeTextarea(value: string, maxHeight = 200) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [value, maxHeight]);

  return ref;
}
