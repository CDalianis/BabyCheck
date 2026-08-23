export const EVENT_TYPES = [
  "feeding",
  "diaper",
  "sleep",
  "weight",
  "medication",
  "pumping",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  feeding: "Feeding",
  diaper: "Diaper",
  sleep: "Sleep",
  weight: "Weight",
  medication: "Medication",
  pumping: "Pumping",
};
