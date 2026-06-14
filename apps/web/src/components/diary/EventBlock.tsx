import { EVENT_STYLES } from "../../constants/eventStyles";
import type { PlacedEvent } from "../../utils/diary";
import { formatEventTime, getEventSummary } from "../../utils/eventSummary";
import type { BabyEvent } from "@babycheck/shared";

interface EventBlockProps {
  placed: PlacedEvent;
  isDragging?: boolean;
  onPointerDown?: (event: BabyEvent, e: React.PointerEvent<HTMLElement>) => void;
  onOpen?: (event: BabyEvent) => void;
}

export default function EventBlock({
  placed,
  isDragging,
  onPointerDown,
  onOpen,
}: EventBlockProps) {
  const { event, top, height, leftPercent, widthPercent } = placed;
  const styles = EVENT_STYLES[event.type];
  const narrow = widthPercent < 50;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`absolute z-20 touch-none rounded-lg border px-1 py-0.5 text-left shadow-sm overflow-hidden transition select-none ${
        isDragging
          ? "pointer-events-none cursor-grabbing opacity-40"
          : "cursor-grab hover:brightness-95"
      } ${styles.bg} ${styles.border}`}
      style={{
        top,
        height: Math.max(height, 40),
        left: `calc(${leftPercent}% + 2px)`,
        width: `calc(${widthPercent}% - 4px)`,
      }}
      title={`${formatEventTime(event.occurredAt)} · ${getEventSummary(event)}`}
      onPointerDown={(e) => onPointerDown?.(event, e)}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && onOpen) {
          e.preventDefault();
          onOpen(event);
        }
      }}
    >
      <div className="pointer-events-none flex min-w-0 items-start gap-0.5">
        <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} />
        <div className="min-w-0 flex-1">
          <p
            className={`font-mono font-semibold leading-tight text-theme-muted ${narrow ? "text-[8px]" : "text-[9px]"}`}
          >
            {formatEventTime(event.occurredAt)}
          </p>
          <p
            className={`truncate font-semibold leading-tight ${styles.text} ${narrow ? "text-[8px]" : "text-[10px]"}`}
          >
            {getEventSummary(event)}
          </p>
        </div>
      </div>
    </div>
  );
}
