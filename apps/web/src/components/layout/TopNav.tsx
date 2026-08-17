import { useAuth } from "../../context/AuthContext";
import { useBaby } from "../../context/BabyContext";
import { useBabyProfileModal } from "../../context/BabyProfileModalContext";
import { btnSecondaryClass } from "../ui/form";
import ThemeToggle from "./ThemeToggle";

export default function TopNav() {
  const { user, logout } = useAuth();
  const { activeBaby } = useBaby();
  const { open: openProfile } = useBabyProfileModal();

  return (
    <header className="sticky top-0 z-40 border-b border-theme bg-theme-nav/95 backdrop-blur">
      <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-theme-brand-strong leading-tight">
            BabyCheck
          </p>
          <p className="truncate text-[10px] text-theme-muted sm:text-xs">
            {activeBaby ? activeBaby.name : "Baby diary"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={openProfile}
            className={btnSecondaryClass + " hidden px-3 py-1.5 text-xs sm:inline-flex"}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={logout}
            className={
              btnSecondaryClass +
              " px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 sm:px-3"
            }
            title={user?.email}
          >
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
