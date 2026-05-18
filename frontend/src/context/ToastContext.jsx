import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  };

  const iconMap = { success: 'check_circle', error: 'error', info: 'info', warning: 'warning' };
  const colorMap = {
    success: 'bg-success/20 border-success/30 text-success',
    error: 'bg-error/20 border-error/30 text-error',
    info: 'bg-primary/20 border-primary/30 text-primary',
    warning: 'bg-warning/20 border-warning/30 text-warning'
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Toast Portal */}
      <div className="fixed bottom-6 right-6 z-[9999] space-y-3 flex flex-col items-end pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-5 py-4 rounded-xl border shadow-2xl backdrop-blur-sm pointer-events-auto max-w-sm animate-slide-up ${colorMap[t.type]}`}
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            <span className="material-symbols-outlined text-[20px] shrink-0">{iconMap[t.type]}</span>
            <span className="font-semibold text-sm">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
