import { useEffect, useRef, useState } from 'react';

export function useDraft<T>(key: string, initial: T, enabled = true) {
  const storageKey = `carango-draft-${key}`;
  const initialValue = useRef(initial);
  const restored = useRef(false);
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      restored.current = Boolean(raw);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const [hasDraft, setHasDraft] = useState(restored.current);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>(
    restored.current ? 'saved' : 'idle'
  );
  useEffect(() => {
    if (!enabled) return;
    const unchanged = JSON.stringify(value) === JSON.stringify(initialValue.current);
    if (unchanged && !restored.current) return;
    setStatus('saving');
    const timer = window.setTimeout(() => {
      sessionStorage.setItem(storageKey, JSON.stringify(value));
      restored.current = true;
      setHasDraft(true);
      setStatus('saved');
    }, 450);
    return () => window.clearTimeout(timer);
  }, [enabled, storageKey, value]);
  const clear = () => {
    sessionStorage.removeItem(storageKey);
    restored.current = false;
    setHasDraft(false);
    setStatus('idle');
  };
  const discard = () => {
    clear();
    setValue(initialValue.current);
  };
  return { value, setValue, status, hasDraft, clear, discard };
}
