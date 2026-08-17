import { NavLink } from "react-router-dom";
import { useBabyProfileModal } from "../../context/BabyProfileModalContext";
import { useLogEventModal } from "../../context/LogEventModalContext";

export default function BottomNav() {
  const { open: openLog } = useLogEventModal();
  const { open: openProfile } = useBabyProfileModal();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-theme bg-theme-nav/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-lg">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex-1 py-3 text-center text-sm font-medium transition-colors ${
              isActive
                ? "text-theme-brand-strong"
                : "text-theme-muted hover:text-theme-body"
            }`
          }
        >
          {({ isActive }) => (
            <span className={isActive ? "font-semibold" : ""}>Diary</span>
          )}
        </NavLink>
        <button
          type="button"
          onClick={() => openLog()}
          className="flex-1 py-3 text-center text-sm font-medium text-theme-muted hover:text-theme-body"
        >
          Log
        </button>
        <button
          type="button"
          onClick={openProfile}
          className="flex-1 py-3 text-center text-sm font-medium text-theme-muted hover:text-theme-body"
        >
          Profile
        </button>
      </div>
    </nav>
  );
}
