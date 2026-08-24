import type { EventType } from "../constants/eventTypes.js";

export interface FeedingPayload {
  method: "breast" | "bottle" | "mixed";
  amountMl?: number;
  side?: "left" | "right" | "both";
  durationMinutes?: number;
}

export interface DiaperPayload {
  wet: boolean;
  dirty: boolean;
}

export interface SleepPayload {
  durationMinutes: number;
}

export interface WeightPayload {
  weightKg: number;
}

export interface MedicationPayload {
  name: string;
  dose: string;
}

export interface PumpingPayload {
  amountMl: number;
  side?: "left" | "right" | "both";
  durationMinutes?: number;
}

export type EventPayloadMap = {
  feeding: FeedingPayload;
  diaper: DiaperPayload;
  sleep: SleepPayload;
  weight: WeightPayload;
  medication: MedicationPayload;
  pumping: PumpingPayload;
};

export interface BabyEvent<T extends EventType = EventType> {
  id: string;
  babyId: string;
  userId: string;
  type: T;
  occurredAt: string;
  payload: EventPayloadMap[T];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
