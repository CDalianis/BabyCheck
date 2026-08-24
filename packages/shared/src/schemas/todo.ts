import { z } from "zod";

export const createTodoSchema = z.object({
  text: z.string().trim().min(1).max(200),
});

export const updateTodoSchema = z.object({
  text: z.string().trim().min(1).max(200).optional(),
  completed: z.boolean().optional(),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
