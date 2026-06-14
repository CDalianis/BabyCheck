import type { BabyEvent } from "@babycheck/shared";
import type { DiaryDropTarget } from "../../hooks/useDiaryDrag";
import { formatDropMinutes } from "../../hooks/useDiaryDrag";
import {
  DAY_HEIGHT,
  HOUR_HEIGHT,
  formatDayHeader,
  isSameDay,
  layoutDayEvents,
  toDateKey,
  topPxFromMinutes,
} from "../../utils/diary";
import EventBlock from "./EventBlock";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface DayColumnProps {
  date: Date;
  events: BabyEvent[];
  onHourClick: (date: Date, hour: number) => void;
  draggingEventId: string | null;
  dropTarget: DiaryDropTarget | null;
  onEventPointerDown: (
    event: BabyEvent,
    e: React.PointerEvent<HTMLElement>
  ) => void;
  onOpenEvent: (event: BabyEvent) => void;
}

export default function DayColumn({
  date,
  events,
  onHourClick,
  draggingEventId,
  dropTarget,
  onEventPointerDown,
  onOpenEvent,
}: DayColumnProps) {
  const { weekday, day } = formatDayHeader(date);
  const today = isSameDay(date, new Date());
  const dayKey = toDateKey(date);
  const placed = layoutDayEvents(events);
  const isActiveDrop = dropTarget?.dayKey === dayKey;

  return (
    <div className="flex min-w-28 flex-1 flex-col">
      <div
        className={`sticky top-0 z-20 border-b border-theme px-2 py-2 text-center ${
          today ? "bg-theme-today-95" : "bg-theme-surface-95"
        }`}
      >
        <p
          className={`text-xs font-medium ${
            today ? "text-theme-brand-strong" : "text-theme-muted"
          }`}
        >
          {weekday}
        </p>
        <p
          className={`text-sm font-bold ${
            today ? "text-theme-brand-strong" : "text-theme-body"
          }`}
        >
          {day}
        </p>
      </div>

      <div
        data-diary-day={dayKey}
        data-day-date={date.toISOString()}
        className={`relative bg-theme-surface-95 ${
          isActiveDrop ? "bg-theme-brand/5" : ""
        }`}
        style={{ height: DAY_HEIGHT }}
      >
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="absolute left-0 right-0 border-t border-theme-grid"
            style={{ top: hour * HOUR_HEIGHT }}
          />
        ))}

        {HOURS.map((hour) => (
          <button
            key={`slot-${dayKey}-${hour}`}
            type="button"
            onClick={() => onHourClick(date, hour)}
            className="absolute left-0 right-0 transition-colors hover:bg-theme-slot"
            style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            aria-label={`Log event on ${day} at ${hour}:00`}
          />
        ))}

        {isActiveDrop && dropTarget && (
          <>
            <div
              className="pointer-events-none absolute left-0 right-0 z-10 border-t-2 border-dashed border-theme-brand"
              style={{ top: topPxFromMinutes(dropTarget.minutes) }}
            />
            <div
              className="pointer-events-none absolute left-1 z-10 rounded bg-theme-brand px-1.5 py-0.5 text-[10px] font-semibold text-white"
              style={{ top: topPxFromMinutes(dropTarget.minutes) + 2 }}
            >
              {formatDropMinutes(dropTarget.minutes)}
            </div>
          </>
        )}

        {placed.map((p) => (
          <EventBlock
            key={p.event.id}
            placed={p}
            isDragging={draggingEventId === p.event.id}
            onPointerDown={onEventPointerDown}
            onOpen={onOpenEvent}
          />
        ))}
      </div>
    </div>
  );
}
