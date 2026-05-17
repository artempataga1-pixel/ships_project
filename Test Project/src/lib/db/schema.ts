import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const generations = sqliteTable("generations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status", {
    enum: ["queued", "processing", "completed", "failed"],
  })
    .notNull()
    .default("queued"),
  style: text("style").notNull(),
  prompt: text("prompt").default(""),
  aspectRatio: text("aspect_ratio", { enum: ["1:1", "9:16", "16:9"] })
    .notNull()
    .default("1:1"),
  sourceImagePaths: text("source_image_paths").notNull().default("[]"),
  resultImagePath: text("result_image_path"),
  errorMessage: text("error_message"),
  queuePosition: integer("queue_position"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const dailyLimits = sqliteTable("daily_limits", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  count: integer("count").notNull().default(0),
});

export type User = typeof users.$inferSelect;
export type Generation = typeof generations.$inferSelect;
export type DailyLimit = typeof dailyLimits.$inferSelect;
