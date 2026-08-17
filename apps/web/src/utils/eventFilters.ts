import type { BabyEvent, EventType } from "@babycheck/shared";
import {
  DIAPER_FILTER_OPTIONS,
  DIAPER_FILTER_LABELS,
  EVENT_TYPE_LABELS,
  FEEDING_METHODS,
  FEEDING_METHOD_LABELS,
  PUMPING_SIDES,
  PUMPING_SIDE_LABELS,
} from "@babycheck/shared";

export type EventFilterId = "all" | EventType | `${EventType}:${string}`;

export interface FilterOption {
  id: EventFilterId;
  label: string;
}

export interface FilterCategory {
  type: EventType;
  label: string;
  options: FilterOption[];
}

const CATEGORY_ONLY: EventType[] = ["sleep", "weight"];

export function categoryHasSubFilters(category: FilterCategory): boolean {
  if (CATEGORY_ONLY.includes(category.type)) return false;
  if (category.type === "feeding" || category.type === "diaper") return true;
  return category.options.length > 0;
}

function feedingOptionId(method: string): EventFilterId {
  return `feeding:${method}`;
}

function diaperOptionId(option: string): EventFilterId {
  return `diaper:${option}`;
}

function medicationOptionId(name: string): EventFilterId {
  return `medication:${name}`;
}

function pumpingOptionId(side: string): EventFilterId {
  return `pumping:${side}`;
}

export function buildFilterCategories(events: BabyEvent[]): FilterCategory[] {
  const medicationNames = new Set<string>();
  const pumpingSides = new Set<string>();

  for (const event of events) {
    if (event.type === "medication") {
      const name = (event as BabyEvent<"medication">).payload?.name?.trim();
      if (name) medicationNames.add(name);
    }
    if (event.type === "pumping") {
      const side = (event as BabyEvent<"pumping">).payload.side;
      if (side) pumpingSides.add(side);
    }
  }

  return (Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((type) => {
    if (CATEGORY_ONLY.includes(type)) {
      return {
        type,
        label: EVENT_TYPE_LABELS[type],
        options: [{ id: type, label: `All ${EVENT_TYPE_LABELS[type].toLowerCase()}` }],
      };
    }

    if (type === "feeding") {
      return {
        type,
        label: EVENT_TYPE_LABELS[type],
        options: FEEDING_METHODS.map((method) => ({
          id: feedingOptionId(method),
          label: FEEDING_METHOD_LABELS[method],
        })),
      };
    }

    if (type === "diaper") {
      return {
        type,
        label: EVENT_TYPE_LABELS[type],
        options: DIAPER_FILTER_OPTIONS.map((option) => ({
          id: diaperOptionId(option),
          label: DIAPER_FILTER_LABELS[option],
        })),
      };
    }

    if (type === "medication") {
      const sortedNames = [...medicationNames].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
      );
      return {
        type,
        label: EVENT_TYPE_LABELS[type],
        options: sortedNames.map((name) => ({
          id: medicationOptionId(name),
          label: name,
        })),
      };
    }

    if (type === "pumping") {
      const sideOptions = PUMPING_SIDES.filter((side) => pumpingSides.has(side));
      if (sideOptions.length === 0) {
        return {
          type,
          label: EVENT_TYPE_LABELS[type],
          options: [{ id: type, label: "All pumping" }],
        };
      }
      return {
        type,
        label: EVENT_TYPE_LABELS[type],
        options: sideOptions.map((side) => ({
          id: pumpingOptionId(side),
          label: PUMPING_SIDE_LABELS[side],
        })),
      };
    }

    return {
      type,
      label: EVENT_TYPE_LABELS[type],
      options: [{ id: type, label: EVENT_TYPE_LABELS[type] }],
    };
  });
}

export function eventMatchesFilter(
  event: BabyEvent,
  filter: EventFilterId
): boolean {
  if (filter === "all") return true;

  if (!filter.includes(":")) {
    return event.type === filter;
  }

  const colon = filter.indexOf(":");
  const type = filter.slice(0, colon) as EventType;
  const option = filter.slice(colon + 1);

  if (event.type !== type) return false;

  switch (type) {
    case "feeding":
      return (event as BabyEvent<"feeding">).payload?.method === option;
    case "diaper": {
      const payload = (event as BabyEvent<"diaper">).payload;
      if (!payload) return false;
      if (option === "wet") return payload.wet && !payload.dirty;
      if (option === "dirty") return payload.dirty && !payload.wet;
      if (option === "both") return payload.wet && payload.dirty;
      return false;
    }
    case "medication":
      return (
        (event as BabyEvent<"medication">).payload?.name?.trim() === option
      );
    case "pumping":
      return (event as BabyEvent<"pumping">).payload.side === option;
    default:
      return false;
  }
}

export function computeFilterCounts(
  events: BabyEvent[],
  categories: FilterCategory[]
): Record<string, number> {
  const counts: Record<string, number> = { all: events.length };

  for (const category of categories) {
    counts[category.type] = events.filter((event) =>
      eventMatchesFilter(event, category.type)
    ).length;

    for (const option of category.options) {
      counts[option.id] = events.filter((event) =>
        eventMatchesFilter(event, option.id)
      ).length;
    }
  }

  return counts;
}

export function getFilterLabel(
  filter: EventFilterId,
  categories: FilterCategory[]
): string {
  if (filter === "all") return "All events";

  if (!filter.includes(":")) {
    return EVENT_TYPE_LABELS[filter as EventType];
  }

  for (const category of categories) {
    const match = category.options.find((option) => option.id === filter);
    if (match) return `${category.label} · ${match.label}`;
  }

  return filter;
}
