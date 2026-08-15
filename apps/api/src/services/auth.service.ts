import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import type { LoginInput, RegisterInput } from "@babycheck/shared";
import { db } from "../db/index.js";
import { users } from "../db/schema/users.js";
import { AppError } from "../utils/errors.js";
import { mapUser } from "../utils/mappers.js";

export async function registerUser(input: RegisterInput) {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);

  if (existing) {
    throw new AppError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const [row] = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name,
    })
    .returning();

  return mapUser(row);
}

export async function loginUser(input: LoginInput) {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);

  if (!row) {
    throw new AppError(401, "Invalid email or password");
  }

  const valid = await bcrypt.compare(input.password, row.passwordHash);
  if (!valid) {
    throw new AppError(401, "Invalid email or password");
  }

  return mapUser(row);
}

export async function getUserById(userId: string) {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) {
    throw new AppError(404, "User not found");
  }

  return mapUser(row);
}
