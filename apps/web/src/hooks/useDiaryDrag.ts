import type { BabyEvent } from "@babycheck/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  dateAtMinutes,
  findDiaryDayElement,
  minutesFromPointerY,
} from "../utils/diary";

const DRAG_THRESHOLD_PX = 6;

export interface DiaryDropTarget {
  dayKey: string;
  day: Date;
  minutes: number;
}

export interface DiaryDragState {
  event: BabyEvent;
  ghostX: number;
  ghostY: number;
  ghostWidth: number;
  dropTarget: DiaryDropTarget | null;
}

interface UseDiaryDragOptions {
  onEventMove: (eventId: string, occurredAt: string) => void;
  onOpenEvent: (event: BabyEvent) => void;
}

export function useDiaryDrag({ onEventMove, onOpenEvent }: UseDiaryDragOptions) {
  const [dragState, setDragState] = useState<DiaryDragState | null>(null);
  const dragRef = useRef<{
    event: BabyEvent;
    pointerId: number;
    startX: number;
    startY: number;
    didMove: boolean;
    ghostWidth: number;
  } | null>(null);

  const updateDropTarget = useCallback((clientX: number, clientY: number) => {
    const dayElement = findDiaryDayElement(clientX, clientY);
    if (!dayElement?.dataset.diaryDay || !dayElement.dataset.dayDate) {
      return null;
    }

    return {
      dayKey: dayElement.dataset.diaryDay,
      day: new Date(dayElement.dataset.dayDate),
      minutes: minutesFromPointerY(clientY, dayElement),
    } satisfies DiaryDropTarget;
  }, []);

  const handlePointerDown = useCallback(
    (event: BabyEvent, e: React.PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;

      const rect = e.currentTarget.getBoundingClientRect();
      dragRef.current = {
        event,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        didMove: false,
        ghostWidth: rect.width,
      };
    },
    []
  );

  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      const drag = dragRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;

      const deltaX = Math.abs(e.clientX - drag.startX);
      const deltaY = Math.abs(e.clientY - drag.startY);

      if (!drag.didMove) {
        if (deltaX < DRAG_THRESHOLD_PX && deltaY < DRAG_THRESHOLD_PX) return;
        drag.didMove = true;
        document.body.style.userSelect = "none";
        document.body.style.cursor = "grabbing";
      }

      e.preventDefault();
      const dropTarget = updateDropTarget(e.clientX, e.clientY);

      setDragState({
        event: drag.event,
        ghostX: e.clientX,
        ghostY: e.clientY,
        ghostWidth: drag.ghostWidth,
        dropTarget,
      });
    }

    function finishDrag(e: PointerEvent) {
      const drag = dragRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;

      document.body.style.userSelect = "";
      document.body.style.cursor = "";

      if (drag.didMove) {
        const dropTarget = updateDropTarget(e.clientX, e.clientY);
        if (dropTarget) {
          const nextOccurredAt = dateAtMinutes(
            dropTarget.day,
            dropTarget.minutes
          ).toISOString();
          const current = new Date(drag.event.occurredAt).getTime();
          if (current !== new Date(nextOccurredAt).getTime()) {
            onEventMove(drag.event.id, nextOccurredAt);
          }
        }
      } else {
        onOpenEvent(drag.event);
      }

      dragRef.current = null;
      setDragState(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [onEventMove, onOpenEvent, updateDropTarget]);

  const draggingEventId = dragState?.event.id ?? null;

  return {
    dragState,
    draggingEventId,
    handlePointerDown,
    isDropTarget: (dayKey: string) =>
      dragState?.dropTarget?.dayKey === dayKey ? dragState.dropTarget : null,
  };
}

export function formatDropMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}
