import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { babies } from "./babies.js";
import { users } from "./users.js";

export const milestones = pgTable("milestones", {
  id: uuid("id").defaultRandom().primaryKey(),
  babyId: uuid("baby_id")
    .notNull()
    .references(() => babies.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  notes: text("notes"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type MilestoneRow = typeof milestones.$inferSelect;
export type NewMilestoneRow = typeof milestones.$inferInsert;
