import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-theme bg-theme-surface shadow-2xl"
      >
        <div className="shrink-0 border-b border-theme px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-theme-body">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 text-sm text-theme-muted">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-xl leading-none text-theme-muted hover:bg-theme-surface-hover hover:text-theme-body"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
