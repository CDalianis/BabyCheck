import { describe, expect, it } from "vitest";
import { aggregateDailyTrends, formatDurationMinutes, formatTimeSince } from "./insights";

describe("insight utilities", () => {
  it("formats durations", () => {
    expect(formatDurationMinutes(90)).toBe("1h 30m");
    expect(formatTimeSince(60)).toBe("1h ago");
  });

  it("creates the requested daily buckets", () => {
    expect(aggregateDailyTrends([], 7)).toHaveLength(7);
  });
});
