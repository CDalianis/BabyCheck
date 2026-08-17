import type { ReactNode } from "react";

const STICKY_PANEL_CLASS =
  "sticky top-[4.75rem] z-20 max-h-[calc(100vh-5.75rem)] overflow-y-auto rounded-2xl border border-theme bg-theme-surface-95/95 p-3 shadow-lg backdrop-blur-md";

interface StickySidebarPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
  sticky?: boolean;
}

export function StickySidebarPanel({
  title,
  children,
  className = "",
  sticky = true,
}: StickySidebarPanelProps) {
  return (
    <div className={`${sticky ? STICKY_PANEL_CLASS : `rounded-2xl border border-theme bg-theme-surface-95 p-3 ${className}`}`}>
      <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-theme-muted">
        {title}
      </h2>
      {children}
    </div>
  );
}

interface StickySidebarProps {
  title: string;
  children: ReactNode;
  widthClass?: string;
}

export default function StickySidebar({
  title,
  children,
  widthClass = "w-56 xl:w-60",
}: StickySidebarProps) {
  return (
    <aside
      className={`hidden lg:flex lg:h-full lg:flex-1 lg:flex-col ${widthClass}`}
    >
      <StickySidebarPanel title={title}>{children}</StickySidebarPanel>
    </aside>
  );
}
