import type { BabyEvent } from "@babycheck/shared";
import { EVENT_TYPE_LABELS } from "@babycheck/shared";

export function formatEventTime(occurredAt: string): string {
  return new Date(occurredAt).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function getEventSummary(event: BabyEvent): string {
  switch (event.type) {
    case "feeding": {
      const e = event as BabyEvent<"feeding">;
      const parts = [EVENT_TYPE_LABELS.feeding, e.payload.method];
      if (e.payload.amountMl) parts.push(`${e.payload.amountMl}ml`);
      return parts.join(" · ");
    }
    case "diaper": {
      const e = event as BabyEvent<"diaper">;
      const tags = [e.payload.wet && "wet", e.payload.dirty && "dirty"].filter(
        Boolean
      );
      return tags.length
        ? `${EVENT_TYPE_LABELS.diaper} · ${tags.join(", ")}`
        : EVENT_TYPE_LABELS.diaper;
    }
    case "sleep": {
      const e = event as BabyEvent<"sleep">;
      return `${EVENT_TYPE_LABELS.sleep} · ${e.payload.durationMinutes}min`;
    }
    case "weight": {
      const e = event as BabyEvent<"weight">;
      return `${EVENT_TYPE_LABELS.weight} · ${e.payload.weightKg}kg`;
    }
    case "medication": {
      const e = event as BabyEvent<"medication">;
      return `${EVENT_TYPE_LABELS.medication} · ${e.payload.name}`;
    }
    case "pumping": {
      const e = event as BabyEvent<"pumping">;
      return `${EVENT_TYPE_LABELS.pumping} · ${e.payload.amountMl}ml`;
    }
    default:
      return EVENT_TYPE_LABELS[event.type];
  }
}
