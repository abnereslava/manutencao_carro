import { useEffect, useState } from 'react';

export function usePersistentState<T>(
  key: string,
  initial: T,
  enabled: boolean,
  overrides?: Partial<T>
) {
  const storageKey = `carango-preference-${key}`;
  const [value, setValue] = useState<T>(() => {
    if (!enabled) return initial;
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? { ...(JSON.parse(stored) as T), ...overrides } : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    if (enabled) localStorage.setItem(storageKey, JSON.stringify(value));
    else localStorage.removeItem(storageKey);
  }, [enabled, storageKey, value]);

  const reset = () => {
    localStorage.removeItem(storageKey);
    setValue(initial);
  };

  return { value, setValue, reset };
}
