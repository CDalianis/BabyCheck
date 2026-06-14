import type { Baby } from "@babycheck/shared";
import { resolveBabyPhotoUrl } from "../../utils/photo";

interface BabyAvatarProps {
  baby: Pick<Baby, "name" | "photoUrl" | "updatedAt">;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

const sizeClass = {
  sm: "h-8 w-8 text-lg",
  md: "h-10 w-10 text-xl",
  lg: "h-12 w-12 text-2xl sm:h-14 sm:w-14",
};

export default function BabyAvatar({
  baby,
  size = "md",
  className = "",
  onClick,
}: BabyAvatarProps) {
  const photoSrc = resolveBabyPhotoUrl(baby.photoUrl, baby.updatedAt);
  const isInteractive = Boolean(onClick && photoSrc);

  const frameClass = `shrink-0 overflow-hidden rounded-full border-2 border-theme bg-theme-surface-elevated ${sizeClass[size]} ${className} ${
    isInteractive
      ? "cursor-pointer transition hover:border-theme-brand hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
      : ""
  }`;

  const content = photoSrc ? (
    <img src={photoSrc} alt="" className="h-full w-full object-cover" />
  ) : (
    <span className="flex h-full w-full items-center justify-center">👶</span>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={frameClass}
        aria-label={`View ${baby.name}'s photo`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={frameClass} aria-hidden>
      {content}
    </div>
  );
}
