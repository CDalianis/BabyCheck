import { NavLink } from "react-router-dom";
import { useBabyProfileModal } from "../../context/BabyProfileModalContext";
import { useLogEventModal } from "../../context/LogEventModalContext";
import { useLocale } from "../../context/LocaleContext";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex-1 py-2.5 text-center text-[11px] font-medium transition-colors sm:text-sm ${
    isActive
      ? "font-semibold text-theme-brand-strong"
      : "text-theme-muted hover:text-theme-body"
  }`;

export default function BottomNav() {
  const { open: openLog } = useLogEventModal();
  const { open: openProfile } = useBabyProfileModal();
  const { t } = useLocale();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-theme bg-theme-nav/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-lg">
        <NavLink to="/today" className={linkClass}>
          {t("today")}
        </NavLink>
        <NavLink to="/" end className={linkClass}>
          {t("diary")}
        </NavLink>
        <button
          type="button"
          onClick={() => openLog()}
          className="flex-1 py-2.5 text-center text-[11px] font-medium text-theme-muted hover:text-theme-body sm:text-sm"
        >
          {t("log")}
        </button>
        <NavLink to="/trends" className={linkClass}>
          {t("trends")}
        </NavLink>
        <NavLink to="/search" className={linkClass}>{t("search")}</NavLink>
        <NavLink to="/calendar" className={linkClass}>{t("calendar")}</NavLink>
        <button
          type="button"
          onClick={openProfile}
          className="flex-1 py-2.5 text-center text-[11px] font-medium text-theme-muted hover:text-theme-body sm:text-sm"
        >
          {t("more")}
        </button>
      </div>
    </nav>
  );
}
