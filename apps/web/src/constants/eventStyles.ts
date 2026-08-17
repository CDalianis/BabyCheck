import type { EventType } from "@babycheck/shared";

export const EVENT_STYLES: Record<
  EventType,
  { bg: string; border: string; text: string; dot: string }
> = {
  feeding: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-800",
    dot: "bg-rose-400",
  },
  diaper: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    dot: "bg-amber-400",
  },
  sleep: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-900",
    dot: "bg-indigo-400",
  },
  weight: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-900",
    dot: "bg-emerald-400",
  },
  medication: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-900",
    dot: "bg-violet-400",
  },
  pumping: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-900",
    dot: "bg-sky-400",
  },
};
