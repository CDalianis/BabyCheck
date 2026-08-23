import { z } from "zod";
import { EVENT_TYPES } from "../constants/eventTypes.js";

const feedingPayloadSchema = z.object({
  method: z.enum(["breast", "bottle", "mixed"]),
  amountMl: z.number().positive().optional(),
  side: z.enum(["left", "right", "both"]).optional(),
  durationMinutes: z.number().positive().optional(),
});

const diaperPayloadSchema = z.object({
  wet: z.boolean(),
  dirty: z.boolean(),
});

const sleepPayloadSchema = z.object({
  durationMinutes: z.number().positive(),
});

const weightPayloadSchema = z.object({
  weightKg: z.number().positive(),
});

const medicationPayloadSchema = z.object({
  name: z.string().min(1),
  dose: z.string().min(1),
});

const pumpingPayloadSchema = z.object({
  amountMl: z.number().positive(),
  side: z.enum(["left", "right", "both"]).optional(),
  durationMinutes: z.number().positive().optional(),
});

const payloadSchemas = {
  feeding: feedingPayloadSchema,
  diaper: diaperPayloadSchema,
  sleep: sleepPayloadSchema,
  weight: weightPayloadSchema,
  medication: medicationPayloadSchema,
  pumping: pumpingPayloadSchema,
} as const;

export const createEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("feeding"),
    occurredAt: z.string().datetime(),
    payload: feedingPayloadSchema,
    notes: z.string().max(500).optional(),
  }),
  z.object({
    type: z.literal("diaper"),
    occurredAt: z.string().datetime(),
    payload: diaperPayloadSchema,
    notes: z.string().max(500).optional(),
  }),
  z.object({
    type: z.literal("sleep"),
    occurredAt: z.string().datetime(),
    payload: sleepPayloadSchema,
    notes: z.string().max(500).optional(),
  }),
  z.object({
    type: z.literal("weight"),
    occurredAt: z.string().datetime(),
    payload: weightPayloadSchema,
    notes: z.string().max(500).optional(),
  }),
  z.object({
    type: z.literal("medication"),
    occurredAt: z.string().datetime(),
    payload: medicationPayloadSchema,
    notes: z.string().max(500).optional(),
  }),
  z.object({
    type: z.literal("pumping"),
    occurredAt: z.string().datetime(),
    payload: pumpingPayloadSchema,
    notes: z.string().max(500).optional(),
  }),
]);

export const updateEventSchema = z.object({
  occurredAt: z.string().datetime().optional(),
  notes: z.string().max(500).nullable().optional(),
  payload: z.record(z.unknown()).optional(),
});

export const listEventsQuerySchema = z.object({
  type: z.enum(EVENT_TYPES).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;

export function validatePayloadForType(
  type: keyof typeof payloadSchemas,
  payload: unknown
) {
  return payloadSchemas[type].parse(payload);
}
