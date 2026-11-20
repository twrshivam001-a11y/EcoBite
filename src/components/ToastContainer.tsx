import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useAppData();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'error' ? AlertCircle : toast.type === 'info' ? Info : CheckCircle2;
        const tone =
          toast.type === 'error'
            ? 'bg-red-950 text-white border-red-800'
            : toast.type === 'info'
              ? 'bg-stone-900 text-white border-stone-700'
              : 'bg-[#166534] text-white border-emerald-700';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium transition-all ${tone}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="p-1 opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
