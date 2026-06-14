import type { Baby } from "@babycheck/shared";
import { useEffect } from "react";
import { resolveBabyPhotoUrl } from "../../utils/photo";

interface BabyPhotoModalProps {
  baby: Pick<Baby, "name" | "photoUrl" | "updatedAt">;
  open: boolean;
  onClose: () => void;
}

export default function BabyPhotoModal({
  baby,
  open,
  onClose,
}: BabyPhotoModalProps) {
  const photoSrc = resolveBabyPhotoUrl(baby.photoUrl, baby.updatedAt);

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

  if (!open || !photoSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close photo"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${baby.name}'s photo`}
        className="relative z-10 flex flex-col items-center gap-4"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-2 -top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-theme bg-theme-surface text-xl text-theme-muted shadow-lg hover:bg-theme-surface-hover hover:text-theme-body sm:-right-4 sm:-top-4"
          aria-label="Close"
        >
          ×
        </button>

        <div className="h-56 w-56 overflow-hidden rounded-full border-4 border-theme-surface bg-theme-surface-elevated shadow-2xl ring-4 ring-theme-brand/25 sm:h-72 sm:w-72 md:h-80 md:w-80">
          <img
            src={photoSrc}
            alt={baby.name}
            className="h-full w-full object-cover"
          />
        </div>

        <p className="rounded-full border border-theme bg-theme-surface/95 px-4 py-1.5 text-sm font-semibold text-theme-body shadow-lg backdrop-blur-sm">
          {baby.name}
        </p>
      </div>
    </div>
  );
}
