import { and, count, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";
import type {
  CreateEventInput,
  CreateEventsBatchInput,
  ListEventsQuery,
  UpdateEventInput,
} from "@babycheck/shared";
import { validatePayloadForType } from "@babycheck/shared";
import { db } from "../db/index.js";
import { events } from "../db/schema/events.js";
import { AppError } from "../utils/errors.js";
import { mapEvent } from "../utils/mappers.js";
import { assertBabyAccess } from "./babies.service.js";

export async function listEvents(
  userId: string,
  babyId: string,
  query: ListEventsQuery
) {
  await assertBabyAccess(userId, babyId);

  const conditions = [eq(events.babyId, babyId)];

  if (!query.includeDeleted) {
    conditions.push(isNull(events.deletedAt));
  }
  if (query.type) {
    conditions.push(eq(events.type, query.type));
  }
  if (query.from) {
    conditions.push(gte(events.occurredAt, new Date(query.from)));
  }
  if (query.to) {
    conditions.push(lte(events.occurredAt, new Date(query.to)));
  }
  if (query.q) {
    const q = `%${query.q.toLowerCase()}%`;
    conditions.push(
      sql`(
        lower(coalesce(${events.notes}, '')) like ${q}
        or lower(coalesce(${events.payload}::text, '')) like ${q}
        or lower(${events.type}) like ${q}
      )`
    );
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

async function getEventWithAccess(userId: string, eventId: string) {
  const [row] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);

  if (!row) {
    throw new AppError(404, "Event not found");
  }

  await assertBabyAccess(userId, row.babyId);
  return row;
}

export async function getEvent(userId: string, eventId: string) {
  const row = await getEventWithAccess(userId, eventId);
  return mapEvent(row);
}

export async function createEvent(
  userId: string,
  babyId: string,
  input: CreateEventInput
) {
  await assertBabyAccess(userId, babyId);

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

  return mapEvent(row!);
}

export async function createEventsBatch(
  userId: string,
  babyId: string,
  input: CreateEventsBatchInput
) {
  await assertBabyAccess(userId, babyId);

  const rows = await db
    .insert(events)
    .values(
      input.events.map((item) => ({
        babyId,
        userId,
        type: item.type,
        occurredAt: new Date(item.occurredAt),
        payload: item.payload,
        notes: item.notes ?? null,
      }))
    )
    .returning();

  return rows.map(mapEvent);
}

export async function updateEvent(
  userId: string,
  eventId: string,
  input: UpdateEventInput
) {
  const existingRow = await getEventWithAccess(userId, eventId);
  if (existingRow.deletedAt) {
    throw new AppError(400, "Cannot update a deleted event");
  }
  const existing = mapEvent(existingRow);

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
    .where(eq(events.id, eventId))
    .returning();

  return mapEvent(row!);
}

export async function deleteEvent(userId: string, eventId: string) {
  await getEventWithAccess(userId, eventId);
  const [row] = await db
    .update(events)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(events.id, eventId))
    .returning();
  return mapEvent(row!);
}

export async function restoreEvent(userId: string, eventId: string) {
  await getEventWithAccess(userId, eventId);
  const [row] = await db
    .update(events)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(events.id, eventId))
    .returning();
  return mapEvent(row!);
}

export async function getTodayStats(userId: string, babyId: string) {
  await assertBabyAccess(userId, babyId);

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
        isNull(events.deletedAt),
        gte(events.occurredAt, startOfDay),
        lte(events.occurredAt, endOfDay)
      )
    )
    .orderBy(desc(events.occurredAt));

  const mapped = todayEvents.map(mapEvent);

  const feedingCount = mapped.filter((e) => e.type === "feeding").length;
  const diaperCount = mapped.filter((e) => e.type === "diaper").length;
  const medicationCount = mapped.filter((e) => e.type === "medication").length;
  const sleepTotalMinutes = mapped
    .filter((e) => e.type === "sleep")
    .reduce(
      (sum, e) =>
        sum + (e.payload as { durationMinutes: number }).durationMinutes,
      0
    );
  const pumpingTotalMl = mapped
    .filter((e) => e.type === "pumping")
    .reduce((sum, e) => sum + (e.payload as { amountMl: number }).amountMl, 0);

  const lastFeedingToday = mapped.find((e) => e.type === "feeding") ?? null;
  const lastDiaper = mapped.find((e) => e.type === "diaper") ?? null;
  const lastSleep = mapped.find((e) => e.type === "sleep") ?? null;
  const lastMedication = mapped.find((e) => e.type === "medication") ?? null;

  const [lastFeedRow] = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.babyId, babyId),
        eq(events.type, "feeding"),
        isNull(events.deletedAt)
      )
    )
    .orderBy(desc(events.occurredAt))
    .limit(1);

  const lastFeedingOverall = lastFeedRow ? mapEvent(lastFeedRow) : null;
  const lastFeeding =
    (lastFeedingToday as typeof lastFeedingToday) ??
    (lastFeedingOverall as typeof lastFeedingOverall);

  const minutesSinceLastFeed = lastFeedingOverall
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(lastFeedingOverall.occurredAt).getTime()) /
            60000
        )
      )
    : null;

  return {
    date: startOfDay.toISOString().slice(0, 10),
    feedingCount,
    diaperCount,
    sleepTotalMinutes,
    pumpingTotalMl,
    medicationCount,
    lastFeeding: lastFeeding as typeof lastFeeding,
    lastDiaper: lastDiaper as typeof lastDiaper,
    lastSleep: lastSleep as typeof lastSleep,
    lastMedication: lastMedication as typeof lastMedication,
    minutesSinceLastFeed,
  };
}
