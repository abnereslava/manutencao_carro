import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastItem {
  id: number;
  message: string;
}
const ToastContext = createContext<{ toast: (message: string) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const toast = useCallback((message: string) => {
    const id = Date.now();
    setItems((current) => [...current, { id, message }]);
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 4000);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite">
        {items.map((item) => (
          <div className="toast" key={item.id}>
            <CheckCircle2 size={18} />
            <span>{item.message}</span>
            <button
              className="icon-button compact"
              aria-label="Fechar aviso"
              onClick={() =>
                setItems((current) => current.filter((toastItem) => toastItem.id !== item.id))
              }
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast deve ser usado dentro de ToastProvider.');
  return value;
}
