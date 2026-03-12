import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (opts: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

// ─── Icon map ─────────────────────────────────────────────────────────────────
const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
  error: <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
  warning: <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
  info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
};

const styles: Record<ToastType, string> = {
  success: 'border-l-4 border-emerald-500',
  error: 'border-l-4 border-rose-500',
  warning: 'border-l-4 border-amber-500',
  info: 'border-l-4 border-blue-500',
};

// ─── Single Toast Item ────────────────────────────────────────────────────────
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`flex items-start gap-3 bg-white rounded-2xl shadow-xl px-4 py-3.5 min-w-[300px] max-w-sm pointer-events-auto ${styles[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 mt-0.5"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = opts.duration ?? 4500;

    setToasts(prev => {
      // Cap at 5 toasts max — remove oldest if needed
      const next = prev.length >= 5 ? prev.slice(-4) : prev;
      return [...next, { ...opts, id }];
    });

    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
  }, [dismiss]);

  const success = useCallback((title: string, message?: string) =>
    toast({ type: 'success', title, message }), [toast]);

  const error = useCallback((title: string, message?: string) =>
    toast({ type: 'error', title, message }), [toast]);

  const warning = useCallback((title: string, message?: string) =>
    toast({ type: 'warning', title, message }), [toast]);

  const info = useCallback((title: string, message?: string) =>
    toast({ type: 'info', title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss }}>
      {children}

      {/* Toast Container - fixed bottom-right */}
      <div
        className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2.5 pointer-events-none"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
