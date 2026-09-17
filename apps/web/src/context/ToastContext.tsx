import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface ToastOptions {
  message: string;
  undo?: () => void | Promise<void>;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);

  const showToast = useCallback((options: ToastOptions) => {
    const id = Date.now();
    setToast({ ...options, id });
    window.setTimeout(
      () => setToast((current) => (current?.id === id ? null : current)),
      8000
    );
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-4 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl"
        >
          <span>{toast.message}</span>
          {toast.undo && (
            <button
              type="button"
              className="font-bold text-sky-300 hover:text-sky-200"
              onClick={() => {
                void toast.undo?.();
                setToast(null);
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
