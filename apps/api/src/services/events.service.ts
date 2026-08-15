import { and, count, desc, eq, gte, lte } from "drizzle-orm";
import type {
  CreateEventInput,
  ListEventsQuery,
  UpdateEventInput,
} from "@babycheck/shared";
import { validatePayloadForType } from "@babycheck/shared";
import { db } from "../db/index.js";
import { events } from "../db/schema/events.js";
import { AppError } from "../utils/errors.js";
import { mapEvent } from "../utils/mappers.js";
import { getBaby } from "./babies.service.js";

export async function listEvents(
  userId: string,
  babyId: string,
  query: ListEventsQuery
) {
  await getBaby(userId, babyId);

  const conditions = [
    eq(events.babyId, babyId),
    eq(events.userId, userId),
  ];

  if (query.type) {
    conditions.push(eq(events.type, query.type));
  }
  if (query.from) {
    conditions.push(gte(events.occurredAt, new Date(query.from)));
  }
  if (query.to) {
    conditions.push(lte(events.occurredAt, new Date(query.to)));
  }

  const where = and(...conditions);

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(events)
      .where(where)
      .orderBy(desc(events.occurredAt))
      .limit(query.limit)
      .offset(query.offset),
    db.select({ count: count() }).from(events).where(where),
  ]);

  return {
    data: rows.map(mapEvent),
    total: totalResult[0]?.count ?? 0,
    limit: query.limit,
    offset: query.offset,
  };
}

export async function getEvent(userId: string, eventId: string) {
  const [row] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.userId, userId)))
    .limit(1);

  if (!row) {
    throw new AppError(404, "Event not found");
  }

  return mapEvent(row);
}

export async function createEvent(
  userId: string,
  babyId: string,
  input: CreateEventInput
) {
  await getBaby(userId, babyId);

  const [row] = await db
    .insert(events)
    .values({
      babyId,
      userId,
      type: input.type,
      occurredAt: new Date(input.occurredAt),
      payload: input.payload,
      notes: input.notes ?? null,
    })
    .returning();

  return mapEvent(row);
}

export async function updateEvent(
  userId: string,
  eventId: string,
  input: UpdateEventInput
) {
  const existing = await getEvent(userId, eventId);

  let payload = existing.payload;
  if (input.payload) {
    payload = validatePayloadForType(existing.type, input.payload);
  }

  const occurredAt = input.occurredAt
    ? new Date(input.occurredAt)
    : new Date(existing.occurredAt);

  const [row] = await db
    .update(events)
    .set({
      occurredAt,
      notes: input.notes !== undefined ? input.notes : existing.notes,
      payload,
      updatedAt: new Date(),
    })
    .where(and(eq(events.id, eventId), eq(events.userId, userId)))
    .returning();

  return mapEvent(row);
}

export async function deleteEvent(userId: string, eventId: string) {
  await getEvent(userId, eventId);
  await db
    .delete(events)
    .where(and(eq(events.id, eventId), eq(events.userId, userId)));
}

export async function getTodayStats(userId: string, babyId: string) {
  await getBaby(userId, babyId);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todayEvents = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.babyId, babyId),
        eq(events.userId, userId),
        gte(events.occurredAt, startOfDay),
        lte(events.occurredAt, endOfDay)
      )
    )
    .orderBy(desc(events.occurredAt));

  const mapped = todayEvents.map(mapEvent);

  const feedingCount = mapped.filter((e) => e.type === "feeding").length;
  const diaperCount = mapped.filter((e) => e.type === "diaper").length;
  const sleepTotalMinutes = mapped
    .filter((e) => e.type === "sleep")
    .reduce((sum, e) => sum + (e.payload as { durationMinutes: number }).durationMinutes, 0);
  const pumpingTotalMl = mapped
    .filter((e) => e.type === "pumping")
    .reduce((sum, e) => sum + (e.payload as { amountMl: number }).amountMl, 0);

  const lastFeeding =
    mapped.find((e) => e.type === "feeding") ?? null;
  const lastDiaper = mapped.find((e) => e.type === "diaper") ?? null;
  const lastSleep = mapped.find((e) => e.type === "sleep") ?? null;

  return {
    date: startOfDay.toISOString().slice(0, 10),
    feedingCount,
    diaperCount,
    sleepTotalMinutes,
    pumpingTotalMl,
    lastFeeding: lastFeeding as typeof lastFeeding,
    lastDiaper: lastDiaper as typeof lastDiaper,
    lastSleep: lastSleep as typeof lastSleep,
  };
}
