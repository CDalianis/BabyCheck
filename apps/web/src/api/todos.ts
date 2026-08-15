import type {
  CreateTodoInput,
  UpdateTodoInput,
  UserTodo,
} from "@babycheck/shared";
import { apiFetch } from "./client";

export function listTodos() {
  return apiFetch<{ data: UserTodo[] }>("/api/todos");
}

export function createTodo(input: CreateTodoInput) {
  return apiFetch<{ todo: UserTodo }>("/api/todos", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTodo(id: string, input: UpdateTodoInput) {
  return apiFetch<{ todo: UserTodo }>(`/api/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteTodo(id: string) {
  return apiFetch<void>(`/api/todos/${id}`, {
    method: "DELETE",
  });
}

export function clearCompletedTodos() {
  return apiFetch<void>("/api/todos/completed", {
    method: "DELETE",
  });
}
