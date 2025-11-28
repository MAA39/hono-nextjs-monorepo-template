import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { serve } from "@hono/node-server"
import { authMiddleware, type AuthEnv } from "./middleware/auth"
import { authRoutes } from "./routes/auth"
import { todoRoutes } from "./routes/todos"

const app = new Hono<AuthEnv>()
  .use("*", logger())
  .use(
    "*",
    cors({
      origin: ["http://localhost:3000"],
      credentials: true,
    })
  )
  .use("*", authMiddleware)
  .get("/", (c) => c.json({ message: "Hello from Hono API!" }))
  .get("/me", (c) => {
    const user = c.get("user")
    if (!user) return c.json({ error: "Unauthorized" }, 401)
    return c.json({ user })
  })
  .route("/api/auth", authRoutes)
  .route("/api/todos", todoRoutes)

export type AppType = typeof app

const port = 8787
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
