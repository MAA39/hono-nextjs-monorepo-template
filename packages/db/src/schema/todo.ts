import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core"
import { user } from "./auth"

// Todo table
export const todo = pgTable("todo", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").notNull().default(false),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Types
export type Todo = typeof todo.$inferSelect
export type NewTodo = typeof todo.$inferInsert
