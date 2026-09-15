import type { BabyTheme } from "../../context/ThemeContext";
import { useTheme } from "../../context/ThemeContext";

const options: { id: BabyTheme; label: string; emoji: string }[] = [
  { id: "boy", label: "Boy", emoji: "💙" },
  { id: "girl", label: "Girl", emoji: "💗" },
];

export default function ThemeToggle() {
  const { theme, mode, setTheme, toggleMode } = useTheme();

  return (
    <div className="flex items-center gap-1">
      <div
        className="hidden rounded-xl border border-theme bg-theme-surface p-0.5 md:inline-flex"
        role="group"
        aria-label="Baby theme"
      >
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            className={`rounded-lg px-2 py-1 text-xs font-semibold ${
              theme === opt.id
                ? "bg-theme-brand text-white"
                : "text-theme-muted"
            }`}
            aria-pressed={theme === opt.id}
            title={opt.label}
          >
            {opt.emoji}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={toggleMode}
        className="rounded-lg border border-theme bg-theme-surface px-2 py-1.5 text-xs"
        aria-label={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
        title="Toggle dark mode"
      >
        {mode === "light" ? "🌙" : "☀️"}
      </button>
    </div>
  );
}
