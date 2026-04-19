import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';

export type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextProps {
  showToast: (options: ToastOptions | string) => void;
  hideToast: () => void;
  toast: ToastOptions | null;
  isVisible: boolean;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((options: ToastOptions | string) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const opts = typeof options === 'string' ? { message: options, type: 'info' as ToastType } : { type: 'info' as ToastType, ...options };
    
    setToast(opts);
    setIsVisible(true);

    const duration = opts.duration || 3000;
    const id = setTimeout(() => {
      setIsVisible(false);
    }, duration);
    
    setTimeoutId(id);
  }, [timeoutId]);

  // Escuchar errores globales de conexión (desde el apiClient)
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('global-connection-error', (data) => {
      showToast({
        message: data.message || 'Error de conexión',
        type: 'error',
        duration: 5000,
      });
    });

    return () => subscription.remove();
  }, [showToast]);

  const hideToast = useCallback(() => {
    setIsVisible(false);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }, [timeoutId]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, toast, isVisible }}>
      {children}
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
