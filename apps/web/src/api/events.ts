import type {
  BabyEvent,
  CreateEventInput,
  PaginatedResponse,
  TodayStats,
  UpdateEventInput,
} from "@babycheck/shared";
import { apiFetch } from "./client";

export interface EventListQuery {
  type?: BabyEvent["type"];
  from?: string;
  to?: string;
  q?: string;
  includeDeleted?: boolean;
  limit?: number;
  offset?: number;
}

export function listEvents(babyId: string, query: EventListQuery = {}) {
  const params = new URLSearchParams();
  if (query.type) params.set("type", query.type);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.q) params.set("q", query.q);
  if (query.includeDeleted) params.set("includeDeleted", "true");
  if (query.limit) params.set("limit", String(query.limit));
  if (query.offset) params.set("offset", String(query.offset));

  const qs = params.toString();
  return apiFetch<PaginatedResponse<BabyEvent>>(
    `/api/babies/${babyId}/events${qs ? `?${qs}` : ""}`
  );
}

export function createEvent(babyId: string, input: CreateEventInput) {
  return apiFetch<{ event: BabyEvent }>(`/api/babies/${babyId}/events`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function createEventsBatch(babyId: string, events: CreateEventInput[]) {
  return apiFetch<{ events: BabyEvent[] }>(
    `/api/babies/${babyId}/events/batch`,
    {
      method: "POST",
      body: JSON.stringify({ events }),
    }
  );
}

export function getTodayStats(babyId: string) {
  return apiFetch<{ stats: TodayStats }>(`/api/babies/${babyId}/stats/today`);
}

export function updateEvent(id: string, input: UpdateEventInput) {
  return apiFetch<{ event: BabyEvent }>(`/api/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteEvent(id: string) {
  return apiFetch<{ event: BabyEvent }>(`/api/events/${id}`, {
    method: "DELETE",
  });
}

export function restoreEvent(id: string) {
  return apiFetch<{ event: BabyEvent }>(`/api/events/${id}/restore`, {
    method: "POST",
  });
}
