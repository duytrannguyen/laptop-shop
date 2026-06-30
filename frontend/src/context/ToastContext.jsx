import React, { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'primary') => {
    const id = Date.now() + Math.random().toString(36).substring(2);
    setToasts(prev => [...prev, { id, message, type, time: new Date() }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      const id = Date.now() + Math.random().toString(36).substring(2);
      setToasts(prev => [...prev, { 
        id, 
        message, 
        type: 'light', 
        isConfirm: true,
        onResolve: (val) => {
          resolve(val);
          setToasts(current => current.filter(t => t.id !== id));
        }
      }]);
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, confirm }}>
      {children}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} className={`toast show align-items-center text-bg-${t.type} border-0 mb-2 shadow-lg`} role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header">
              <strong className="me-auto text-primary">{t.isConfirm ? 'Xác nhận' : 'Thông báo'}</strong>
              <small className="text-muted">vừa xong</small>
              {!t.isConfirm && (
                <button type="button" className="btn-close" onClick={() => removeToast(t.id)}>
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="toast-body">
              {t.message}
              {t.isConfirm && (
                <div className="mt-3 d-flex justify-content-end gap-2">
                  <button className="btn btn-sm btn-secondary" onClick={() => t.onResolve(false)}>Hủy</button>
                  <button className="btn btn-sm btn-danger" onClick={() => t.onResolve(true)}>OK</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
