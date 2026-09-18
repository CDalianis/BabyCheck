import type { CreateEventInput } from "@babycheck/shared";
import { createEvent } from "../api/events";

const STORAGE_KEY = "babycheck-offline-events";

interface QueuedEvent {
  id: string;
  babyId: string;
  input: CreateEventInput;
}

function readQueue(): QueuedEvent[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as QueuedEvent[];
  } catch {
    return [];
  }
}

export function queueEvent(babyId: string, input: CreateEventInput) {
  const queue = readQueue();
  queue.push({ id: crypto.randomUUID(), babyId, input });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export async function createEventOrQueue(
  babyId: string,
  input: CreateEventInput
) {
  if (!navigator.onLine) {
    queueEvent(babyId, input);
    return { queued: true };
  }
  return createEvent(babyId, input);
}

export async function flushOfflineQueue() {
  if (!navigator.onLine) return;
  const queue = readQueue();
  const remaining: QueuedEvent[] = [];
  for (const item of queue) {
    try {
      await createEvent(item.babyId, item.input);
    } catch {
      remaining.push(item);
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
}
