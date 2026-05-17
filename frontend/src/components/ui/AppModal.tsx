import { X, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  loading?: boolean;
}

export default function AppModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancelar',
  onConfirm,
  loading = false
}: ModalProps) {
  const config = {
    info: {
      icon: Info,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      confirmBg: 'bg-primary hover:bg-blue-600',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-400',
      confirmBg: 'bg-yellow-500 hover:bg-yellow-600',
    },
    error: {
      icon: AlertTriangle,
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-400',
      confirmBg: 'bg-red-500 hover:bg-red-600',
    },
    success: {
      icon: CheckCircle,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-400',
      confirmBg: 'bg-green-500 hover:bg-green-600',
    },
  };

  const cfg = config[type];
  const Icon = cfg.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-surface border border-border rounded-3xl max-w-lg w-full shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${cfg.iconBg}`}>
                <Icon size={20} className={cfg.iconColor} />
              </div>
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-300 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/10 transition-all"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 ${cfg.confirmBg} ${loading ? 'opacity-50 cursor-wait' : ''}`}
            >
              {loading ? (
                <span className="animate-spin">⟳</span>
              ) : null}
              {confirmText}
            </button>
          )}
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Confirmation Modal Hook
import { useState } from "react";

export function useConfirm() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
  } | null>(null);

  const confirm = (
    title: string,
    message: string,
    type: 'info' | 'warning' | 'error' | 'success' = 'info'
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        type,
        onConfirm: async () => {
          setModalState(null);
          resolve(true);
        },
        onCancel: () => {
          setModalState(null);
          resolve(false);
        }
      });
    });
  };

  const ConfirmModal = () => (
    modalState ? (
      <AppModal
        isOpen={modalState.isOpen}
        onClose={modalState.onCancel}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={modalState.onConfirm}
      />
    ) : null
  );

  return { confirm, ConfirmModal };
}
