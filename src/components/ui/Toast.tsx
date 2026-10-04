import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, Undo2 } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title: string;
  message?: string;
  variant?: ToastVariant;
  /** Milliseconds before auto-dismiss. Pass 0 to require manual dismissal. */
  duration?: number;
  action?: ToastAction;
}

interface ToastItem extends ToastOptions {
  id: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextType {
  toast: (options: ToastOptions) => string;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const VARIANT_STYLES: Record<ToastVariant, { icon: React.ElementType; ring: string; iconColor: string }> = {
  success: { icon: CheckCircle2, ring: 'border-emerald-200 dark:border-emerald-500/40', iconColor: 'text-emerald-600' },
  error: { icon: AlertCircle, ring: 'border-rose-200 dark:border-rose-500/40', iconColor: 'text-rose-600' },
  warning: { icon: AlertTriangle, ring: 'border-amber-200 dark:border-amber-500/40', iconColor: 'text-amber-600' },
  info: { icon: Info, ring: 'border-indigo-200 dark:border-indigo-500/40', iconColor: 'text-indigo-600' },
};

let toastCounter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (options: ToastOptions): string => {
      toastCounter += 1;
      const id = `toast-${toastCounter}`;
      const variant = options.variant ?? 'info';
      const duration = options.duration ?? (variant === 'error' ? 6000 : 4000);

      setToasts((current) => [...current.slice(-3), { ...options, id, variant, duration }]);

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }

      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const value = useMemo<ToastContextType>(
    () => ({
      toast,
      dismiss,
      success: (title, message) => toast({ title, message, variant: 'success' }),
      error: (title, message) => toast({ title, message, variant: 'error' }),
      warning: (title, message) => toast({ title, message, variant: 'warning' }),
      info: (title, message) => toast({ title, message, variant: 'info' }),
    }),
    [toast, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastCard: React.FC<{ item: ToastItem; onDismiss: () => void }> = ({ item, onDismiss }) => {
  const { icon: Icon, ring, iconColor } = VARIANT_STYLES[item.variant];

  return (
    <div
      role={item.variant === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border ${ring} shadow-lg shadow-slate-900/5 animate-slide-in-right`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
        {item.message && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 break-words">{item.message}</p>
        )}
        {item.action && (
          <button
            onClick={() => {
              item.action?.onClick();
              onDismiss();
            }}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            <Undo2 className="w-3.5 h-3.5" />
            {item.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
