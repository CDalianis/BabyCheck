import type { BabyEvent } from "@babycheck/shared";
import { useCallback } from "react";
import { useEventDetailModal } from "../../context/EventDetailModalContext";
import { useDiaryDrag } from "../../hooks/useDiaryDrag";
import { getWeekDays, groupEventsByDay, toDateKey } from "../../utils/diary";
import DayColumn from "./DayColumn";
import DragGhost from "./DragGhost";
import HourLabels from "./HourLabels";

interface DiaryGridProps {
  weekStart: Date;
  events: BabyEvent[];
  onHourClick: (date: Date, hour: number) => void;
  onEventMove: (eventId: string, occurredAt: string) => void;
}

export default function DiaryGrid({
  weekStart,
  events,
  onHourClick,
  onEventMove,
}: DiaryGridProps) {
  const { open: openEvent } = useEventDetailModal();
  const weekDays = getWeekDays(weekStart);
  const byDay = groupEventsByDay(events, weekDays);

  const handleOpenEvent = useCallback(
    (event: BabyEvent) => openEvent(event),
    [openEvent]
  );

  const { dragState, draggingEventId, handlePointerDown, isDropTarget } =
    useDiaryDrag({
      onEventMove,
      onOpenEvent: handleOpenEvent,
    });

  return (
    <>
      <div className="flex w-full min-w-0 overflow-x-auto rounded-xl border border-theme bg-theme-surface-95 shadow-sm backdrop-blur-[2px]">
        <div className="sticky left-0 z-30 shrink-0">
          <div className="h-[52px] border-b border-r border-theme bg-theme-surface-elevated-95" />
          <HourLabels />
        </div>

        <div className="flex min-w-0 flex-1 divide-x divide-theme">
          {weekDays.map((date) => {
            const dayKey = toDateKey(date);
            return (
              <DayColumn
                key={date.toISOString()}
                date={date}
                events={byDay.get(dayKey) ?? []}
                onHourClick={onHourClick}
                draggingEventId={draggingEventId}
                dropTarget={isDropTarget(dayKey)}
                onEventPointerDown={handlePointerDown}
                onOpenEvent={handleOpenEvent}
              />
            );
          })}
        </div>
      </div>

      {dragState && <DragGhost dragState={dragState} />}
    </>
  );
}
