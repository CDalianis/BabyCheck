import { describe, expect, it } from "vitest";
import type { BabyEvent } from "@babycheck/shared";
import { buildFilterCategories, computeFilterCounts, eventMatchesFilter } from "./eventFilters";

const event = {
  id: "1",
  babyId: "baby",
  userId: "user",
  type: "diaper",
  occurredAt: "2026-01-01T10:00:00.000Z",
  payload: { wet: true, dirty: false },
  notes: null,
  createdAt: "2026-01-01T10:00:00.000Z",
  updatedAt: "2026-01-01T10:00:00.000Z",
} as BabyEvent;

describe("event filters", () => {
  it("matches diaper sub-types", () => {
    expect(eventMatchesFilter(event, "diaper:wet")).toBe(true);
    expect(eventMatchesFilter(event, "diaper:dirty")).toBe(false);
  });

  it("computes all and subtype counts", () => {
    const categories = buildFilterCategories([event]);
    const counts = computeFilterCounts([event], categories);
    expect(counts.all).toBe(1);
    expect(counts["diaper:wet"]).toBe(1);
  });
});
