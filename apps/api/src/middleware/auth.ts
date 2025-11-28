import { createMiddleware } from "hono/factory"
import { auth } from "../lib/auth"

type User = typeof auth.$Infer.Session.user
type Session = typeof auth.$Infer.Session.session

export type AuthEnv = {
  Variables: {
    user: User | null
    session: Session | null
  }
}

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  c.set("user", session?.user ?? null)
  c.set("session", session?.session ?? null)

  await next()
})

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const user = c.get("user")
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401)
  }
  await next()
})
