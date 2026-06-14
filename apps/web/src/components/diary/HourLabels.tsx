import { DAY_HEIGHT, HOUR_HEIGHT } from "../../utils/diary";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function HourLabels() {
  return (
    <div
      className="relative w-14 shrink-0 border-r border-theme bg-theme-surface-elevated-95 sm:w-16"
      style={{ height: DAY_HEIGHT }}
    >
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="absolute right-2 -translate-y-1/2 text-[10px] font-medium tabular-nums text-theme-muted sm:text-xs"
          style={{ top: hour * HOUR_HEIGHT }}
        >
          {`${String(hour).padStart(2, "0")}:00`}
        </div>
      ))}
    </div>
  );
}
