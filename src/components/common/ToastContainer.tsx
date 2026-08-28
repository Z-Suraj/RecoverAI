import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = usePlatform();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-md w-full px-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = Info;
          let border = 'border-blue-200 bg-white text-slate-900 shadow-lg';
          let iconColor = 'text-blue-600';

          if (toast.type === 'success') {
            Icon = CheckCircle2;
            border = 'border-emerald-200 bg-white text-slate-900 shadow-lg shadow-emerald-500/5';
            iconColor = 'text-emerald-600';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            border = 'border-amber-200 bg-white text-slate-900 shadow-lg';
            iconColor = 'text-amber-600';
          } else if (toast.type === 'error') {
            Icon = XCircle;
            border = 'border-red-200 bg-white text-slate-900 shadow-lg';
            iconColor = 'text-red-600';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-start p-3.5 rounded-xl border ${border} transition-all`}
            >
              <Icon className={`w-5 h-5 ${iconColor} mt-0.5 shrink-0 mr-3`} />
              <div className="flex-1 min-w-0 pr-2">
                <h4 className="text-xs font-bold text-slate-900">{toast.title}</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
