import { z } from "zod";

export const createMilestoneSchema = z.object({
  title: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(2000).optional(),
  occurredAt: z.string().datetime(),
});

export const updateMilestoneSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  occurredAt: z.string().datetime().optional(),
});

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
