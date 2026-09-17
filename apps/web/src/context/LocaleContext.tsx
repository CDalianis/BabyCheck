import { createContext, useContext, useMemo, useState } from "react";
import {
  translations,
  type Locale,
  type TranslationKey,
} from "../i18n/translations";

const STORAGE_KEY = "babycheck-locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    localStorage.getItem(STORAGE_KEY) === "el" ? "el" : "en"
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale(next) {
        localStorage.setItem(STORAGE_KEY, next);
        setLocaleState(next);
      },
      t: (key) => translations[locale][key],
    }),
    [locale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
