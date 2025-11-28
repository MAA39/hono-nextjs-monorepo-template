import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { eq, and } from "drizzle-orm"
import { todo } from "@repo/db/schema"
import { getDb } from "../lib/db"
import { requireAuth, type AuthEnv } from "../middleware/auth"
import { nanoid } from "nanoid"

const createTodoSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
})

const updateTodoSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
})

const todoRoutes = new Hono<AuthEnv>()
  .use("/*", requireAuth)
  // List todos
  .get("/", async (c) => {
    const user = c.get("user")!
    const db = getDb()
    const todos = await db
      .select()
      .from(todo)
      .where(eq(todo.userId, user.id))
      .orderBy(todo.createdAt)
    return c.json(todos)
  })
  // Create todo
  .post("/", zValidator("json", createTodoSchema), async (c) => {
    const user = c.get("user")!
    const data = c.req.valid("json")
    const db = getDb()
    const [newTodo] = await db
      .insert(todo)
      .values({
        id: nanoid(),
        title: data.title,
        description: data.description,
        userId: user.id,
      })
      .returning()
    return c.json(newTodo, 201)
  })
  // Get single todo
  .get("/:id", async (c) => {
    const user = c.get("user")!
    const id = c.req.param("id")
    const db = getDb()
    const [found] = await db
      .select()
      .from(todo)
      .where(and(eq(todo.id, id), eq(todo.userId, user.id)))
    if (!found) return c.json({ error: "Not found" }, 404)
    return c.json(found)
  })
  // Update todo
  .patch("/:id", zValidator("json", updateTodoSchema), async (c) => {
    const user = c.get("user")!
    const id = c.req.param("id")
    const data = c.req.valid("json")
    const db = getDb()
    const [updated] = await db
      .update(todo)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(todo.id, id), eq(todo.userId, user.id)))
      .returning()
    if (!updated) return c.json({ error: "Not found" }, 404)
    return c.json(updated)
  })
  // Delete todo
  .delete("/:id", async (c) => {
    const user = c.get("user")!
    const id = c.req.param("id")
    const db = getDb()
    const [deleted] = await db
      .delete(todo)
      .where(and(eq(todo.id, id), eq(todo.userId, user.id)))
      .returning()
    if (!deleted) return c.json({ error: "Not found" }, 404)
    return c.json({ success: true })
  })

export { todoRoutes }
