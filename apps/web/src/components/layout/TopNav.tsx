import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useBaby } from "../../context/BabyContext";
import { useBabyProfileModal } from "../../context/BabyProfileModalContext";
import { btnSecondaryClass } from "../ui/form";
import ThemeToggle from "./ThemeToggle";
import { useLocale } from "../../context/LocaleContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `hidden rounded-lg px-2.5 py-1.5 text-xs font-medium sm:inline-flex ${
    isActive
      ? "bg-theme-brand/15 text-theme-brand-strong"
      : "text-theme-muted hover:bg-theme-surface-hover hover:text-theme-body"
  }`;

export default function TopNav() {
  const { user, logout } = useAuth();
  const { activeBaby } = useBaby();
  const { open: openProfile } = useBabyProfileModal();
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="sticky top-0 z-40 border-b border-theme bg-theme-nav/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-theme-brand-strong leading-tight">
            BabyCheck
          </p>
          <p className="truncate text-[10px] text-theme-muted sm:text-xs">
            {activeBaby ? activeBaby.name : t("babyDiary")}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <NavLink to="/today" className={navLinkClass}>
            {t("today")}
          </NavLink>
          <NavLink to="/" end className={navLinkClass}>
            {t("diary")}
          </NavLink>
          <NavLink to="/trends" className={navLinkClass}>
            {t("trends")}
          </NavLink>
          <NavLink to="/milestones" className={navLinkClass}>
            {t("notes")}
          </NavLink>
          <NavLink to="/search" className={navLinkClass}>{t("search")}</NavLink>
          <NavLink to="/calendar" className={navLinkClass}>{t("calendar")}</NavLink>
          <button
            type="button"
            onClick={() => setLocale(locale === "en" ? "el" : "en")}
            className="rounded-lg border border-theme bg-theme-surface px-2 py-1.5 text-xs font-bold text-theme-body"
            aria-label="Change language"
          >
            {locale === "en" ? "EL" : "EN"}
          </button>
          <ThemeToggle />
          <button
            type="button"
            onClick={openProfile}
            className={btnSecondaryClass + " hidden px-3 py-1.5 text-xs sm:inline-flex"}
          >
            {t("profile")}
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
            <span className="hidden sm:inline">{t("logout")}</span>
            <span className="sm:hidden">Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
