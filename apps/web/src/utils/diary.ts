import type { BabyEvent } from "@babycheck/shared";

export const HOUR_HEIGHT = 56;
export const DAY_HEIGHT = 24 * HOUR_HEIGHT;
export const VISIBLE_DAYS = 7;

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: VISIBLE_DAYS }, (_, i) => addDays(weekStart, i));
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDayHeader(date: Date): { weekday: string; day: string } {
  return {
    weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
    day: date.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
  };
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, VISIBLE_DAYS - 1);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${weekStart.toLocaleDateString(undefined, opts)} – ${weekEnd.toLocaleDateString(undefined, { ...opts, year: "numeric" })}`;
}

export function getMinutesFromMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export const DRAG_SNAP_MINUTES = 15;

export function snapMinutes(
  minutes: number,
  step = DRAG_SNAP_MINUTES
): number {
  const snapped = Math.round(minutes / step) * step;
  return Math.max(0, Math.min(24 * 60 - 1, snapped));
}

export function minutesFromPointerY(
  clientY: number,
  dayElement: HTMLElement
): number {
  const rect = dayElement.getBoundingClientRect();
  const y = Math.max(0, Math.min(clientY - rect.top, DAY_HEIGHT));
  return snapMinutes((y / HOUR_HEIGHT) * 60);
}

export function topPxFromMinutes(minutes: number): number {
  return (minutes / 60) * HOUR_HEIGHT;
}

export function dateAtMinutes(day: Date, minutes: number): Date {
  const result = new Date(day);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  result.setHours(hours, mins, 0, 0);
  return result;
}

export function findDiaryDayElement(x: number, y: number): HTMLElement | null {
  const elements = document.elementsFromPoint(x, y);
  for (const element of elements) {
    if (element instanceof HTMLElement && element.dataset.diaryDay) {
      return element;
    }
  }
  return null;
}

export function getEventTopPx(occurredAt: string): number {
  const date = new Date(occurredAt);
  return (getMinutesFromMidnight(date) / 60) * HOUR_HEIGHT;
}

export function getEventHeightPx(event: BabyEvent): number {
  if (event.type === "sleep") {
    const duration = (event.payload as { durationMinutes: number }).durationMinutes;
    return Math.max((duration / 60) * HOUR_HEIGHT, 40);
  }
  return 44;
}

export interface PlacedEvent {
  event: BabyEvent;
  top: number;
  height: number;
  leftPercent: number;
  widthPercent: number;
}

interface EventTimeGroup {
  occurredAt: string;
  events: BabyEvent[];
  top: number;
  height: number;
}

function groupEventsByTime(events: BabyEvent[]): EventTimeGroup[] {
  const groups = new Map<string, BabyEvent[]>();

  for (const event of events) {
    const bucket = groups.get(event.occurredAt);
    if (bucket) {
      bucket.push(event);
    } else {
      groups.set(event.occurredAt, [event]);
    }
  }

  return [...groups.entries()]
    .map(([occurredAt, groupEvents]) => ({
      occurredAt,
      events: groupEvents,
      top: getEventTopPx(occurredAt),
      height: Math.max(
        ...groupEvents.map((event) => getEventHeightPx(event)),
        40
      ),
    }))
    .sort((a, b) => a.top - b.top);
}

export function layoutDayEvents(events: BabyEvent[]): PlacedEvent[] {
  const groups = groupEventsByTime(events);
  const placed: PlacedEvent[] = [];
  let columnBottom = 0;

  for (const group of groups) {
    let top = group.top;

    if (top < columnBottom) {
      top = columnBottom + 4;
    }

    const count = group.events.length;
    const widthPercent = 100 / count;

    for (let index = 0; index < group.events.length; index++) {
      placed.push({
        event: group.events[index]!,
        top,
        height: group.height,
        leftPercent: widthPercent * index,
        widthPercent,
      });
    }

    columnBottom = top + group.height;
  }

  return placed;
}

export function groupEventsByDay(
  events: BabyEvent[],
  weekDays: Date[]
): Map<string, BabyEvent[]> {
  const keys = weekDays.map(toDateKey);
  const map = new Map<string, BabyEvent[]>(keys.map((k) => [k, []]));

  for (const event of events) {
    const key = toDateKey(new Date(event.occurredAt));
    if (map.has(key)) {
      map.get(key)!.push(event);
    }
  }

  return map;
}

export function weekRangeIso(weekStart: Date): { from: string; to: string } {
  const from = new Date(weekStart);
  from.setHours(0, 0, 0, 0);
  const to = addDays(weekStart, VISIBLE_DAYS);
  to.setHours(0, 0, 0, 0);
  return { from: from.toISOString(), to: to.toISOString() };
}
