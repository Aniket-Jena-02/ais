import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isDangerous = true,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-9999"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-9999 w-full max-w-sm"
          >
            <div className="bg-brand-surface border border-white/8 ring-1 ring-white/4 rounded-2xl shadow-2xl p-7 relative overflow-hidden">
              {/* Top light line */}
              <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

              {/* Icon */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${isDangerous ? "bg-red-500/10 text-red-400" : "bg-brand-accent/10 text-brand-accent"}`}>
                <AlertTriangle size={20} strokeWidth={2.5} />
              </div>

              {/* Content */}
              <h3 className="text-[17px] font-black text-white tracking-tight mb-2">{title}</h3>
              <p className="text-sm text-white/40 font-medium leading-relaxed mb-7">{description}</p>

              {/* Actions */}
              <div className="flex flex-col-reverse items-center gap-3 sm:flex-row">
                <button
                  onClick={onCancel}
                  className="w-full flex-1 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider text-white/50 hover:text-white bg-white/5 hover:bg-white/8 border border-white/5 transition-all duration-200"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className={`w-full flex-1 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] shadow-lg ${
                    isDangerous
                      ? "bg-red-500 hover:bg-red-400 shadow-red-500/20"
                      : "bg-brand-accent hover:bg-brand-accent-soft shadow-brand-accent/20"
                  }`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
