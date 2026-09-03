import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { clsx } from 'clsx';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-emerald-50/90 text-emerald-950',
    error: 'border-red-200 bg-red-50/90 text-red-950',
    info: 'border-blue-200 bg-blue-50/90 text-blue-950',
    warning: 'border-amber-200 bg-amber-50/90 text-amber-950',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            'flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-sm transition-all duration-300 animate-slide-in',
            borders[toast.type]
          )}
        >
          {icons[toast.type]}
          <div className="flex-1 text-sm">
            {toast.title && <h4 className="font-semibold">{toast.title}</h4>}
            <p className="text-slate-700 text-xs mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-0.5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
