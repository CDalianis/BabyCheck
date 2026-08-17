import type { BabyTheme } from "../../context/ThemeContext";
import { useTheme } from "../../context/ThemeContext";

const options: { id: BabyTheme; label: string; emoji: string }[] = [
  { id: "boy", label: "Boy", emoji: "💙" },
  { id: "girl", label: "Girl", emoji: "💗" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="inline-flex rounded-xl border border-theme p-0.5 bg-theme-surface"
      role="group"
      aria-label="Baby theme"
    >
      {options.map((opt) => {
        const active = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
              active
                ? "bg-theme-brand text-white shadow-sm"
                : "text-theme-muted hover:text-theme-body"
            }`}
            aria-pressed={active}
          >
            <span className="mr-1" aria-hidden>
              {opt.emoji}
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
