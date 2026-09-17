import crypto from "crypto";
import { and, desc, eq } from "drizzle-orm";
import type { InviteCaregiverInput } from "@babycheck/shared";
import { db } from "../db/index.js";
import { babies } from "../db/schema/babies.js";
import { babyInvites, babyMembers } from "../db/schema/caregivers.js";
import { users } from "../db/schema/users.js";
import { AppError } from "../utils/errors.js";
import { assertBabyOwner } from "./babies.service.js";

function mapMember(row: {
  id: string;
  babyId: string;
  userId: string;
  role: string;
  createdAt: Date;
  email: string;
  name: string;
}) {
  return {
    id: row.id,
    babyId: row.babyId,
    userId: row.userId,
    email: row.email,
    name: row.name,
    role: row.role as "owner" | "caregiver",
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listMembers(userId: string, babyId: string) {
  await assertBabyOwner(userId, babyId);

  const memberRows = await db
    .select({
      id: babyMembers.id,
      babyId: babyMembers.babyId,
      userId: babyMembers.userId,
      role: babyMembers.role,
      createdAt: babyMembers.createdAt,
      email: users.email,
      name: users.name,
    })
    .from(babyMembers)
    .innerJoin(users, eq(babyMembers.userId, users.id))
    .where(eq(babyMembers.babyId, babyId))
    .orderBy(desc(babyMembers.createdAt));

  if (memberRows.length > 0) {
    return memberRows
      .map(mapMember)
      .sort((a, b) => Number(b.role === "owner") - Number(a.role === "owner"));
  }

  // Fallback if membership row missing for legacy data
  const [owner] = await db
    .select({
      babyId: babies.id,
      userId: babies.userId,
      createdAt: babies.createdAt,
      email: users.email,
      name: users.name,
    })
    .from(babies)
    .innerJoin(users, eq(babies.userId, users.id))
    .where(eq(babies.id, babyId))
    .limit(1);

  if (!owner) return [];

  return [
    mapMember({
      id: `owner-${owner.userId}`,
      babyId: owner.babyId,
      userId: owner.userId,
      role: "owner",
      createdAt: owner.createdAt,
      email: owner.email,
      name: owner.name,
    }),
  ];
}

export async function listInvites(userId: string, babyId: string) {
  await assertBabyOwner(userId, babyId);

  const rows = await db
    .select()
    .from(babyInvites)
    .where(
      and(eq(babyInvites.babyId, babyId), eq(babyInvites.status, "pending"))
    )
    .orderBy(desc(babyInvites.createdAt));

  return rows.map((row) => ({
    id: row.id,
    babyId: row.babyId,
    email: row.email,
    role: row.role as "owner" | "caregiver",
    status: row.status as "pending" | "accepted" | "revoked",
    invitedByUserId: row.invitedByUserId,
    createdAt: row.createdAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
  }));
}

export async function inviteCaregiver(
  userId: string,
  babyId: string,
  input: InviteCaregiverInput
) {
  await assertBabyOwner(userId, babyId);

  const email = input.email.toLowerCase();

  const [inviter] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (inviter && inviter.email.toLowerCase() === email) {
    throw new AppError(400, "You already own this baby profile");
  }

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    if (existingUser.id === userId) {
      throw new AppError(400, "You already own this baby profile");
    }

    const [alreadyMember] = await db
      .select()
      .from(babyMembers)
      .where(
        and(
          eq(babyMembers.babyId, babyId),
          eq(babyMembers.userId, existingUser.id)
        )
      )
      .limit(1);

    if (alreadyMember) {
      throw new AppError(400, "This user already has access");
    }
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  const [row] = await db
    .insert(babyInvites)
    .values({
      babyId,
      email,
      role: "caregiver",
      status: "pending",
      invitedByUserId: userId,
      token,
      expiresAt,
    })
    .returning();

  if (existingUser) {
    await db.insert(babyMembers).values({
      babyId,
      userId: existingUser.id,
      role: "caregiver",
    });
    await db
      .update(babyInvites)
      .set({ status: "accepted" })
      .where(eq(babyInvites.id, row!.id));

    return {
      invite: {
        id: row!.id,
        babyId: row!.babyId,
        email: row!.email,
        role: "caregiver" as const,
        status: "accepted" as const,
        invitedByUserId: row!.invitedByUserId,
        createdAt: row!.createdAt.toISOString(),
        expiresAt: row!.expiresAt.toISOString(),
      },
      autoAccepted: true,
    };
  }

  return {
    invite: {
      id: row!.id,
      babyId: row!.babyId,
      email: row!.email,
      role: "caregiver" as const,
      status: "pending" as const,
      invitedByUserId: row!.invitedByUserId,
      createdAt: row!.createdAt.toISOString(),
      expiresAt: row!.expiresAt.toISOString(),
    },
    autoAccepted: false,
  };
}

export async function listMyPendingInvites(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return [];

  const rows = await db
    .select({
      invite: babyInvites,
      babyName: babies.name,
    })
    .from(babyInvites)
    .innerJoin(babies, eq(babyInvites.babyId, babies.id))
    .where(
      and(
        eq(babyInvites.email, user.email.toLowerCase()),
        eq(babyInvites.status, "pending")
      )
    )
    .orderBy(desc(babyInvites.createdAt));

  return rows.map(({ invite, babyName }) => ({
    id: invite.id,
    babyId: invite.babyId,
    babyName,
    email: invite.email,
    role: invite.role as "owner" | "caregiver",
    status: invite.status as "pending" | "accepted" | "revoked",
    invitedByUserId: invite.invitedByUserId,
    createdAt: invite.createdAt.toISOString(),
    expiresAt: invite.expiresAt.toISOString(),
  }));
}

export async function acceptInvite(userId: string, inviteId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new AppError(401, "Unauthorized");

  const [invite] = await db
    .select()
    .from(babyInvites)
    .where(eq(babyInvites.id, inviteId))
    .limit(1);

  if (!invite || invite.status !== "pending") {
    throw new AppError(404, "Invite not found");
  }

  if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
    throw new AppError(403, "This invite is for a different email");
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    throw new AppError(400, "Invite has expired");
  }

  const [existing] = await db
    .select()
    .from(babyMembers)
    .where(
      and(
        eq(babyMembers.babyId, invite.babyId),
        eq(babyMembers.userId, userId)
      )
    )
    .limit(1);

  if (!existing) {
    await db.insert(babyMembers).values({
      babyId: invite.babyId,
      userId,
      role: "caregiver",
    });
  }

  await db
    .update(babyInvites)
    .set({ status: "accepted" })
    .where(eq(babyInvites.id, inviteId));

  return { babyId: invite.babyId };
}

export async function removeMember(
  userId: string,
  babyId: string,
  memberUserId: string
) {
  await assertBabyOwner(userId, babyId);

  if (memberUserId === userId) {
    throw new AppError(400, "Cannot remove the owner");
  }

  await db
    .delete(babyMembers)
    .where(
      and(
        eq(babyMembers.babyId, babyId),
        eq(babyMembers.userId, memberUserId)
      )
    );
}

export async function revokeInvite(
  userId: string,
  babyId: string,
  inviteId: string
) {
  await assertBabyOwner(userId, babyId);

  await db
    .update(babyInvites)
    .set({ status: "revoked" })
    .where(
      and(eq(babyInvites.id, inviteId), eq(babyInvites.babyId, babyId))
    );
}
