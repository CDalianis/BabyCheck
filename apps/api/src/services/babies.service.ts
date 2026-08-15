import fs from "fs";
import path from "path";
import { and, desc, eq } from "drizzle-orm";
import type { CreateBabyInput, UpdateBabyInput } from "@babycheck/shared";
import { BABY_PHOTOS_DIR } from "../config/paths.js";
import { db } from "../db/index.js";
import { babies } from "../db/schema/babies.js";
import { AppError } from "../utils/errors.js";
import { mapBaby } from "../utils/mappers.js";

const PHOTO_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

function removeBabyPhotoFiles(babyId: string) {
  for (const ext of PHOTO_EXTENSIONS) {
    const filePath = path.join(BABY_PHOTOS_DIR, `${babyId}${ext}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

function photoPublicPath(babyId: string, ext: string): string {
  return `/uploads/babies/${babyId}${ext}`;
}

export async function listBabies(userId: string) {
  const rows = await db
    .select()
    .from(babies)
    .where(eq(babies.userId, userId))
    .orderBy(desc(babies.createdAt));
  return rows.map(mapBaby);
}

export async function getBaby(userId: string, babyId: string) {
  const [row] = await db
    .select()
    .from(babies)
    .where(and(eq(babies.id, babyId), eq(babies.userId, userId)))
    .limit(1);

  if (!row) {
    throw new AppError(404, "Baby not found");
  }

  return mapBaby(row);
}

export async function createBaby(userId: string, input: CreateBabyInput) {
  const [row] = await db
    .insert(babies)
    .values({
      userId,
      name: input.name,
      birthDate: input.birthDate,
      gender: input.gender ?? null,
    })
    .returning();

  return mapBaby(row);
}

export async function updateBaby(
  userId: string,
  babyId: string,
  input: UpdateBabyInput
) {
  await getBaby(userId, babyId);

  const [row] = await db
    .update(babies)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(babies.id, babyId), eq(babies.userId, userId)))
    .returning();

  return mapBaby(row);
}

export async function setBabyPhoto(
  userId: string,
  babyId: string,
  filename: string
) {
  await getBaby(userId, babyId);

  const ext = path.extname(filename).toLowerCase();
  const photoUrl = photoPublicPath(babyId, ext);

  const [row] = await db
    .update(babies)
    .set({ photoUrl, updatedAt: new Date() })
    .where(and(eq(babies.id, babyId), eq(babies.userId, userId)))
    .returning();

  return mapBaby(row);
}

export async function removeBabyPhoto(userId: string, babyId: string) {
  await getBaby(userId, babyId);
  removeBabyPhotoFiles(babyId);

  const [row] = await db
    .update(babies)
    .set({ photoUrl: null, updatedAt: new Date() })
    .where(and(eq(babies.id, babyId), eq(babies.userId, userId)))
    .returning();

  return mapBaby(row);
}

export async function deleteBaby(userId: string, babyId: string) {
  await getBaby(userId, babyId);
  removeBabyPhotoFiles(babyId);
  await db
    .delete(babies)
    .where(and(eq(babies.id, babyId), eq(babies.userId, userId)));
}

export function cleanupUploadedPhoto(filename: string) {
  const filePath = path.join(BABY_PHOTOS_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function prepareBabyPhotoUpload(userId: string, babyId: string) {
  return getBaby(userId, babyId).then(() => {
    removeBabyPhotoFiles(babyId);
  });
}
