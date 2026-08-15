import { and, asc, desc, eq } from "drizzle-orm";
import type { CreateTodoInput, UpdateTodoInput } from "@babycheck/shared";
import { db } from "../db/index.js";
import { todos } from "../db/schema/todos.js";
import { AppError } from "../utils/errors.js";
import { mapTodo } from "../utils/mappers.js";

export async function listTodos(userId: string) {
  const rows = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, userId))
    .orderBy(asc(todos.completed), desc(todos.createdAt));

  return rows.map(mapTodo);
}

async function getTodoRow(userId: string, todoId: string) {
  const [row] = await db
    .select()
    .from(todos)
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId)));

  if (!row) {
    throw new AppError(404, "Todo not found");
  }

  return row;
}

export async function createTodo(userId: string, input: CreateTodoInput) {
  const [row] = await db
    .insert(todos)
    .values({
      userId,
      text: input.text,
      completed: false,
    })
    .returning();

  return mapTodo(row!);
}

export async function updateTodo(
  userId: string,
  todoId: string,
  input: UpdateTodoInput
) {
  await getTodoRow(userId, todoId);

  const [row] = await db
    .update(todos)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
    .returning();

  return mapTodo(row!);
}

export async function deleteTodo(userId: string, todoId: string) {
  await getTodoRow(userId, todoId);
  await db
    .delete(todos)
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId)));
}

export async function clearCompletedTodos(userId: string) {
  await db
    .delete(todos)
    .where(and(eq(todos.userId, userId), eq(todos.completed, true)));
}
