import type { Baby, User, BabyEvent, UserTodo } from "@babycheck/shared";
import type { BabyRow } from "../db/schema/babies.js";
import type { EventRow } from "../db/schema/events.js";
import type { TodoRow } from "../db/schema/todos.js";
import type { UserRow } from "../db/schema/users.js";
import type { EventType } from "@babycheck/shared";

export function mapUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapBaby(row: BabyRow): Baby {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    birthDate: row.birthDate,
    gender: row.gender,
    photoUrl: row.photoUrl,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapTodo(row: TodoRow): UserTodo {
  return {
    id: row.id,
    userId: row.userId,
    text: row.text,
    completed: row.completed,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapEvent(row: EventRow): BabyEvent {
  return {
    id: row.id,
    babyId: row.babyId,
    userId: row.userId,
    type: row.type as EventType,
    occurredAt: row.occurredAt.toISOString(),
    payload: row.payload as BabyEvent["payload"],
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
