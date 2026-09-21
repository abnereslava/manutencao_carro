import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes
} from 'react';
import { AlertTriangle, ChevronDown, Inbox, X } from 'lucide-react';

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}) {
  return <button className={`button ${variant} ${className}`} {...props} />;
}
export function IconButton({
  label,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button className={`icon-button ${className}`} aria-label={label} title={label} {...props} />
  );
}
export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`card ${className}`} {...props} />;
}
export function Badge({
  tone = 'neutral',
  icon,
  children
}: {
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className={`badge ${tone}`}>
      {icon}
      {children}
    </span>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
}
export function Input({
  label,
  error,
  hint,
  id: providedId,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & FieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  return (
    <label className="field" htmlFor={id}>
      <span>
        {label}
        {props.required && <b aria-hidden="true"> *</b>}
      </span>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {hint && <small>{hint}</small>}
      {error && (
        <small id={`${id}-error`} className="field-error">
          <AlertTriangle size={14} />
          {error}
        </small>
      )}
    </label>
  );
}
export function Textarea({
  label,
  error,
  id: providedId,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <textarea id={id} aria-invalid={!!error} {...props} />
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
export function Select({
  label,
  children,
  id: providedId,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & FieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <select id={id} {...props}>
        {children}
      </select>
    </label>
  );
}

export function Modal({
  open,
  title,
  children,
  onClose,
  size = 'normal'
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: 'normal' | 'wide';
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelector<HTMLElement>('input, select, textarea, button, [href]');
    focusable?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && dialog) {
        const items = [
          ...dialog.querySelectorAll<HTMLElement>('input, select, textarea, button, [href]')
        ].filter((item) => !item.hasAttribute('disabled'));
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          last.focus();
          event.preventDefault();
        } else if (!event.shiftKey && document.activeElement === last) {
          first.focus();
          event.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', keydown);
    document.body.classList.add('no-scroll');
    return () => {
      document.removeEventListener('keydown', keydown);
      document.body.classList.remove('no-scroll');
      previousFocus.current?.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.currentTarget === event.target && onClose()}
    >
      <div
        ref={dialogRef}
        className={`modal ${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header>
          <h2 id="modal-title">{title}</h2>
          <IconButton label="Fechar" onClick={onClose}>
            <X />
          </IconButton>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Collapse({
  title,
  children,
  defaultOpen = false
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="collapse" open={defaultOpen}>
      <summary>
        {title}
        <ChevronDown size={18} />
      </summary>
      <div>{children}</div>
    </details>
  );
}
export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <Inbox size={30} />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="skeleton" aria-label="Carregando">
      {Array.from({ length: lines }, (_, index) => (
        <i key={index} />
      ))}
    </div>
  );
}
export function Tabs({
  items,
  active,
  onChange
}: {
  items: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="tabs" role="tablist" aria-label="Filtros">
      {items.map((item) => (
        <button
          key={item.id}
          role="tab"
          aria-selected={active === item.id}
          className={active === item.id ? 'active' : ''}
          onClick={() => onChange(item.id)}
        >
          {item.label}
          {item.count !== undefined && <span>{item.count}</span>}
        </button>
      ))}
    </div>
  );
}
