import type { BabyEvent } from "./events.js";

export interface ApiError {
  error: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface TodayStats {
  date: string;
  feedingCount: number;
  diaperCount: number;
  sleepTotalMinutes: number;
  pumpingTotalMl: number;
  medicationCount: number;
  lastFeeding: BabyEvent<"feeding"> | null;
  lastDiaper: BabyEvent<"diaper"> | null;
  lastSleep: BabyEvent<"sleep"> | null;
  lastMedication: BabyEvent<"medication"> | null;
  /** Minutes since the most recent feeding (any day), null if none logged. */
  minutesSinceLastFeed: number | null;
}
