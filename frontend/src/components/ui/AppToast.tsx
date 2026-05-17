import { X, CheckCircle, AlertTriangle, Info, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
  type: 'success' | 'error' | 'info' | 'loading';
  title: string;
  message?: string;
  onClose?: () => void;
}

export function AppToast({ type, title, message, onClose }: ToastProps) {
  const config = {
    success: {
      icon: CheckCircle,
      bg: 'bg-green-500/10 border-green-500/20',
      iconColor: 'text-green-400',
      titleColor: 'text-green-400'
    },
    error: {
      icon: AlertTriangle,
      bg: 'bg-red-500/10 border-red-500/20',
      iconColor: 'text-red-400',
      titleColor: 'text-red-400'
    },
    info: {
      icon: Info,
      bg: 'bg-blue-500/10 border-blue-500/20',
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-400'
    },
    loading: {
      icon: Loader2,
      bg: 'bg-primary/10 border-primary/20',
      iconColor: 'text-primary animate-spin',
      titleColor: 'text-primary'
    }
  };

  const cfg = config[type];
  const Icon = cfg.icon;

  return (
    <motion.div
      className={`fixed top-4 right-4 z-[9999] max-w-sm w-full`}
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-2xl ${cfg.bg}`}>
        <div className="flex items-start gap-3">
          <Icon size={20} className={`mt-0.5 shrink-0 ${cfg.iconColor}`} />
          <div className="flex-1">
            <h4 className={`font-bold text-sm ${cfg.titleColor}`}>{title}</h4>
            {message && (
              <p className="text-xs text-gray-400 mt-1">{message}</p>
            )}
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Toast container for managing multiple toasts
import { useState, useEffect } from "react";

interface ToastManagerProps {
  toasts: Array<{
    id: number;
    type: 'success' | 'error' | 'info' | 'loading';
    title: string;
    message?: string;
  }>;
  removeToast: (id: number) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastManagerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map(toast => (
          <AppToast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for using toasts
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: number;
    type: 'success' | 'error' | 'info' | 'loading';
    title: string;
    message?: string;
  }>>([]);

  const addToast = (type: 'success' | 'error' | 'info' | 'loading', title: string, message?: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    if (type !== 'loading') {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    }
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}
