import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { babies } from "./babies.js";
import { users } from "./users.js";

export const babyMembers = pgTable(
  "baby_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    babyId: uuid("baby_id")
      .notNull()
      .references(() => babies.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("caregiver"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("baby_members_baby_user_idx").on(table.babyId, table.userId)]
);

export const babyInvites = pgTable("baby_invites", {
  id: uuid("id").defaultRandom().primaryKey(),
  babyId: uuid("baby_id")
    .notNull()
    .references(() => babies.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull().default("caregiver"),
  status: text("status").notNull().default("pending"),
  invitedByUserId: uuid("invited_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type BabyMemberRow = typeof babyMembers.$inferSelect;
export type BabyInviteRow = typeof babyInvites.$inferSelect;
