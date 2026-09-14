import fs from "fs";
import path from "path";
import { and, desc, eq } from "drizzle-orm";
import type { CreateBabyInput, UpdateBabyInput } from "@babycheck/shared";
import { BABY_PHOTOS_DIR } from "../config/paths.js";
import { db } from "../db/index.js";
import { babies } from "../db/schema/babies.js";
import { babyMembers } from "../db/schema/caregivers.js";
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

export async function assertBabyAccess(userId: string, babyId: string) {
  const [owned] = await db
    .select()
    .from(babies)
    .where(and(eq(babies.id, babyId), eq(babies.userId, userId)))
    .limit(1);

  if (owned) return mapBaby(owned);

  const [member] = await db
    .select({ baby: babies })
    .from(babyMembers)
    .innerJoin(babies, eq(babyMembers.babyId, babies.id))
    .where(and(eq(babyMembers.babyId, babyId), eq(babyMembers.userId, userId)))
    .limit(1);

  if (!member) {
    throw new AppError(404, "Baby not found");
  }

  return mapBaby(member.baby);
}

export async function assertBabyOwner(userId: string, babyId: string) {
  const [row] = await db
    .select()
    .from(babies)
    .where(and(eq(babies.id, babyId), eq(babies.userId, userId)))
    .limit(1);

  if (!row) {
    throw new AppError(403, "Only the baby owner can do this");
  }

  return mapBaby(row);
}

export async function listBabies(userId: string) {
  const owned = await db
    .select()
    .from(babies)
    .where(eq(babies.userId, userId));

  const shared = await db
    .select({ baby: babies })
    .from(babyMembers)
    .innerJoin(babies, eq(babyMembers.babyId, babies.id))
    .where(eq(babyMembers.userId, userId));

  const byId = new Map(owned.map((row) => [row.id, row]));
  for (const { baby } of shared) {
    if (!byId.has(baby.id)) byId.set(baby.id, baby);
  }

  return [...byId.values()]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map(mapBaby);
}

export async function getBaby(userId: string, babyId: string) {
  return assertBabyAccess(userId, babyId);
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

  await db.insert(babyMembers).values({
    babyId: row!.id,
    userId,
    role: "owner",
  });

  return mapBaby(row!);
}

export async function updateBaby(
  userId: string,
  babyId: string,
  input: UpdateBabyInput
) {
  await assertBabyOwner(userId, babyId);

  const [row] = await db
    .update(babies)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(babies.id, babyId), eq(babies.userId, userId)))
    .returning();

  return mapBaby(row!);
}

export async function setBabyPhoto(
  userId: string,
  babyId: string,
  filename: string
) {
  await assertBabyAccess(userId, babyId);

  const inputPath = path.join(BABY_PHOTOS_DIR, filename);
  const outputName = `${babyId}.webp`;
  const outputPath = path.join(BABY_PHOTOS_DIR, outputName);

  try {
    const sharp = (await import("sharp")).default;
    await sharp(inputPath)
      .rotate()
      .resize(800, 800, { fit: "cover", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outputPath);

    if (inputPath !== outputPath && fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }

    for (const ext of PHOTO_EXTENSIONS) {
      if (ext === ".webp") continue;
      const other = path.join(BABY_PHOTOS_DIR, `${babyId}${ext}`);
      if (fs.existsSync(other)) fs.unlinkSync(other);
    }
  } catch {
    // If sharp fails, keep the original upload
    const photoUrl = photoPublicPath(babyId, path.extname(filename).toLowerCase());
    const [row] = await db
      .update(babies)
      .set({ photoUrl, updatedAt: new Date() })
      .where(eq(babies.id, babyId))
      .returning();
    return mapBaby(row!);
  }

  const photoUrl = photoPublicPath(babyId, ".webp");
  const [row] = await db
    .update(babies)
    .set({ photoUrl, updatedAt: new Date() })
    .where(eq(babies.id, babyId))
    .returning();

  return mapBaby(row!);
}

export async function removeBabyPhoto(userId: string, babyId: string) {
  await assertBabyAccess(userId, babyId);
  removeBabyPhotoFiles(babyId);

  const [row] = await db
    .update(babies)
    .set({ photoUrl: null, updatedAt: new Date() })
    .where(eq(babies.id, babyId))
    .returning();

  return mapBaby(row!);
}

export async function deleteBaby(userId: string, babyId: string) {
  await assertBabyOwner(userId, babyId);
  removeBabyPhotoFiles(babyId);
  await db.delete(babies).where(and(eq(babies.id, babyId), eq(babies.userId, userId)));
}

export function cleanupUploadedPhoto(filename: string) {
  const filePath = path.join(BABY_PHOTOS_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function prepareBabyPhotoUpload(userId: string, babyId: string) {
  return assertBabyAccess(userId, babyId).then(() => {
    removeBabyPhotoFiles(babyId);
  });
}
