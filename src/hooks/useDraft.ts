import { useEffect, useState } from 'react';

export function useDraft<T>(key: string, initial: T) {
  const storageKey = `carango-draft-${key}`;
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  useEffect(() => {
    setStatus('saving');
    const timer = window.setTimeout(() => {
      sessionStorage.setItem(storageKey, JSON.stringify(value));
      setStatus('saved');
    }, 450);
    return () => window.clearTimeout(timer);
  }, [storageKey, value]);
  const clear = () => {
    sessionStorage.removeItem(storageKey);
    setStatus('idle');
  };
  return { value, setValue, status, clear };
}
