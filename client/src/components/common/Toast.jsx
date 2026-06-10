import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, RotateCcw, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const duration = toast.type === 'error' ? 5000 : (toast.type === 'undo' ? 5000 : 3000);
    
    setToasts((prev) => [...prev, { ...toast, id, duration }]);
    
    if (toast.type !== 'undo') {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 100 }}
              className="pointer-events-auto w-full bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden p-4 flex flex-col gap-3"
            >
              <div className="flex items-start gap-3">
                {toast.type === 'success' && (
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                    <CheckCircle size={18} />
                  </div>
                )}
                {toast.type === 'error' && (
                  <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg shrink-0">
                    <AlertTriangle size={18} />
                  </div>
                )}
                {toast.type === 'undo' && (
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                    <RotateCcw size={18} />
                  </div>
                )}

                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-800">
                    {toast.title || (toast.type === 'success' ? 'Success' : 'Notification')}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">{toast.message}</p>
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {toast.type === 'undo' && (
                <div className="flex items-center justify-between gap-4 mt-1 border-t border-gray-100 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (toast.onUndo) toast.onUndo();
                      removeToast(toast.id);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors border border-emerald-100 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    Undo Delete
                  </button>
                  <CountdownProgressBar duration={toast.duration} onComplete={() => {
                    if (toast.onTimeout) toast.onTimeout();
                    removeToast(toast.id);
                  }} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// Internal component to handle the undo countdown bar
const CountdownProgressBar = ({ duration, onComplete }) => {
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (elapsed >= duration) {
        clearInterval(interval);
        onComplete();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
      <div className="bg-emerald-600 h-full rounded-full transition-all duration-75" style={{ width: `${progress}%` }} />
    </div>
  );
};
