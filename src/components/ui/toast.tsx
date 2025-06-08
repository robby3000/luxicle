'use client';

import * as React from 'react';

// Types
export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  type?: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: ToastAction;
}

export interface Toast extends ToastOptions {
  id: string;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

// Context
const ToastContext = React.createContext<ToastContextType | null>(null);

// Default duration for toasts (5 seconds)
const DEFAULT_DURATION = 5000;

// Toast Component
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const { id, title, description, type = 'default', action } = toast;

  return (
    <div
      className={`flex items-start justify-between rounded-md p-4 shadow-lg min-w-[300px] ${
        type === 'error'
          ? 'bg-red-500 text-white'
          : type === 'success'
          ? 'bg-green-500 text-white'
          : type === 'warning'
          ? 'bg-yellow-500 text-white'
          : 'bg-gray-800 text-white'
      }`}
    >
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        {description && <div className="text-sm mt-1 opacity-90">{description}</div>}
      </div>
      <div className="flex items-center space-x-2 ml-4">
        {action && (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              onDismiss(id);
            }}
            className="px-2 py-1 text-sm font-medium rounded hover:bg-black/10 transition-colors"
          >
            {action.label}
          </button>
        )}
        <button
          type="button"
          onClick={() => onDismiss(id)}
          className="text-xl opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

// Toast Container Component
function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
}

// Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  // Add a new toast
  const addToast = React.useCallback((options: ToastOptions): string => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = options.duration || DEFAULT_DURATION;

    const newToast: Toast = {
      id,
      ...options,
    };

    setToasts((currentToasts) => [...currentToasts, newToast]);

    // Auto-dismiss if duration is set
    if (duration > 0) {
      const timer = setTimeout(() => {
        setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
      }, duration);
      
      // Store cleanup function separately
      const cleanup = () => clearTimeout(timer);
      
      // Return the ID after setting up the timer
      return id;
    }

    return id;
  }, []);

  // Remove a toast by ID
  const removeToast = React.useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
  }, []);

  // Memoize the context value
  const contextValue = React.useMemo(
    () => ({
      toasts,
      toast: addToast,
      dismiss: removeToast,
    }),
    [toasts, addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Hook to use the toast context
export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Direct toast function for convenience
export function toast(options: ToastOptions) {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('toast must be used within a ToastProvider');
  }
  return context.toast(options);
}

export { ToastItem };
