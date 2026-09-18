import { z } from "zod";

export const inviteCaregiverSchema = z.object({
  email: z.string().trim().email().max(255),
});

export type InviteCaregiverInput = z.infer<typeof inviteCaregiverSchema>;
