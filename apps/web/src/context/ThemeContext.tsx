import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type BabyTheme = "boy" | "girl";
export type ColorMode = "light" | "dark";

const STORAGE_KEY = "babycheck-theme";
const MODE_STORAGE_KEY = "babycheck-mode";

interface ThemeContextValue {
  theme: BabyTheme;
  mode: ColorMode;
  setTheme: (theme: BabyTheme) => void;
  toggleTheme: () => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): BabyTheme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "girl" ? "girl" : "boy";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<BabyTheme>(() => readStoredTheme());
  const [mode, setMode] = useState<ColorMode>(() =>
    localStorage.getItem(MODE_STORAGE_KEY) === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-mode", mode);
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [mode]);

  const setTheme = useCallback((next: BabyTheme) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (t === "boy" ? "girl" : "boy"));
  }, []);
  const toggleMode = useCallback(() => {
    setMode((current) => (current === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(
    () => ({ theme, mode, setTheme, toggleTheme, toggleMode }),
    [theme, mode, setTheme, toggleTheme, toggleMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
