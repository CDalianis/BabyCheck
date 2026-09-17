import { and, desc, eq } from "drizzle-orm";
import type {
  CreateMilestoneInput,
  UpdateMilestoneInput,
} from "@babycheck/shared";
import { db } from "../db/index.js";
import { milestones } from "../db/schema/milestones.js";
import { AppError } from "../utils/errors.js";
import { assertBabyAccess } from "./babies.service.js";

function mapMilestone(row: typeof milestones.$inferSelect) {
  return {
    id: row.id,
    babyId: row.babyId,
    userId: row.userId,
    title: row.title,
    notes: row.notes,
    occurredAt: row.occurredAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listMilestones(userId: string, babyId: string) {
  await assertBabyAccess(userId, babyId);

  const rows = await db
    .select()
    .from(milestones)
    .where(eq(milestones.babyId, babyId))
    .orderBy(desc(milestones.occurredAt));

  return rows.map(mapMilestone);
}

export async function createMilestone(
  userId: string,
  babyId: string,
  input: CreateMilestoneInput
) {
  await assertBabyAccess(userId, babyId);

  const [row] = await db
    .insert(milestones)
    .values({
      babyId,
      userId,
      title: input.title,
      notes: input.notes ?? null,
      occurredAt: new Date(input.occurredAt),
    })
    .returning();

  return mapMilestone(row!);
}

export async function updateMilestone(
  userId: string,
  milestoneId: string,
  input: UpdateMilestoneInput
) {
  const [existing] = await db
    .select()
    .from(milestones)
    .where(eq(milestones.id, milestoneId))
    .limit(1);

  if (!existing) throw new AppError(404, "Milestone not found");
  await assertBabyAccess(userId, existing.babyId);

  const [row] = await db
    .update(milestones)
    .set({
      title: input.title ?? existing.title,
      notes: input.notes !== undefined ? input.notes : existing.notes,
      occurredAt: input.occurredAt
        ? new Date(input.occurredAt)
        : existing.occurredAt,
      updatedAt: new Date(),
    })
    .where(eq(milestones.id, milestoneId))
    .returning();

  return mapMilestone(row!);
}

export async function deleteMilestone(userId: string, milestoneId: string) {
  const [existing] = await db
    .select()
    .from(milestones)
    .where(eq(milestones.id, milestoneId))
    .limit(1);

  if (!existing) throw new AppError(404, "Milestone not found");
  await assertBabyAccess(userId, existing.babyId);

  await db.delete(milestones).where(eq(milestones.id, milestoneId));
}
