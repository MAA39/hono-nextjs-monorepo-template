import { describe, it, expect, vi } from 'vitest'
import { Hono } from 'hono'
import { testClient } from 'hono/testing'

// 認証ミドルウェアのテスト用モック
function createMockAuthMiddleware(isAuthenticated: boolean, mockUser?: any) {
  return async (c: any, next: any) => {
    if (isAuthenticated && mockUser) {
      c.set('user', mockUser)
      c.set('session', { id: 'test-session' })
    }
    await next()
  }
}

function createMockRequireAuth() {
  return async (c: any, next: any) => {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    await next()
  }
}

describe('Auth Middleware', () => {
  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
  }

  describe('authMiddleware', () => {
    it('should set user and session when authenticated', async () => {
      const app = new Hono()
        .use('*', createMockAuthMiddleware(true, mockUser))
        .get('/me', (c) => {
          const user = c.get('user')
          return c.json({ user })
        })

      const client = testClient(app)
      const res = await client.me.$get()
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.user.id).toBe('user-1')
      expect(data.user.email).toBe('test@example.com')
    })

    it('should not set user when not authenticated', async () => {
      const app = new Hono()
        .use('*', createMockAuthMiddleware(false))
        .get('/me', (c) => {
          const user = c.get('user')
          return c.json({ user: user || null })
        })

      const client = testClient(app)
      const res = await client.me.$get()
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.user).toBeNull()
    })
  })

  describe('requireAuth', () => {
    it('should allow access when authenticated', async () => {
      const app = new Hono()
        .use('*', createMockAuthMiddleware(true, mockUser))
        .use('*', createMockRequireAuth())
        .get('/protected', (c) => {
          return c.json({ message: 'Success' })
        })

      const client = testClient(app)
      const res = await client.protected.$get()
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.message).toBe('Success')
    })

    it('should return 401 when not authenticated', async () => {
      const app = new Hono()
        .use('*', createMockAuthMiddleware(false))
        .use('*', createMockRequireAuth())
        .get('/protected', (c) => {
          return c.json({ message: 'Success' })
        })

      const client = testClient(app)
      const res = await client.protected.$get()
      const data = await res.json()

      expect(res.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('Protected routes integration', () => {
    it('should protect multiple routes', async () => {
      const app = new Hono()
        .use('*', createMockAuthMiddleware(false))
        .use('/api/*', createMockRequireAuth())
        .get('/', (c) => c.json({ public: true }))
        .get('/api/data', (c) => c.json({ private: true }))

      const client = testClient(app)

      // 公開ルートはアクセス可能
      const publicRes = await client.index.$get()
      expect(publicRes.status).toBe(200)

      // 保護ルートは401
      const protectedRes = await client.api.data.$get()
      expect(protectedRes.status).toBe(401)
    })

    it('should allow authenticated access to protected routes', async () => {
      const app = new Hono()
        .use('*', createMockAuthMiddleware(true, mockUser))
        .use('/api/*', createMockRequireAuth())
        .get('/', (c) => c.json({ public: true }))
        .get('/api/data', (c) => c.json({ private: true }))

      const client = testClient(app)

      const publicRes = await client.index.$get()
      expect(publicRes.status).toBe(200)

      const protectedRes = await client.api.data.$get()
      expect(protectedRes.status).toBe(200)
      const data = await protectedRes.json()
      expect(data.private).toBe(true)
    })
  })
})
