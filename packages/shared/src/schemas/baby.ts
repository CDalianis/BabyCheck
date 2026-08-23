import { z } from "zod";

export const createBabySchema = z.object({
  name: z.string().min(1).max(100),
  birthDate: z.string().date(),
  gender: z.enum(["male", "female", "other"]).optional(),
});

export const updateBabySchema = createBabySchema
  .partial()
  .extend({
    gender: z.enum(["male", "female", "other"]).nullable().optional(),
  });

export type CreateBabyInput = z.infer<typeof createBabySchema>;
export type UpdateBabyInput = z.infer<typeof updateBabySchema>;
