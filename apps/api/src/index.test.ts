import { describe, it, expect } from 'vitest'
import { testClient } from 'hono/testing'
import { Hono } from 'hono'

// シンプルなヘルスチェック用のアプリ
describe('API Health Check', () => {
  it('should return hello message on root', async () => {
    const app = new Hono().get('/', (c) =>
      c.json({ message: 'Hello from Hono API!' })
    )
    const client = testClient(app)

    const res = await client.index.$get()
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.message).toBe('Hello from Hono API!')
  })
})

describe('Hono testClient basics', () => {
  it('should handle JSON responses', async () => {
    const app = new Hono()
      .get('/users', (c) => c.json({ users: [{ id: 1, name: 'Alice' }] }))
      .get('/users/:id', (c) => {
        const id = c.req.param('id')
        return c.json({ user: { id: Number(id), name: 'Alice' } })
      })

    const client = testClient(app)

    // リスト取得
    const listRes = await client.users.$get()
    const listData = await listRes.json()
    expect(listData.users).toHaveLength(1)

    // 単一取得
    const singleRes = await client.users[':id'].$get({ param: { id: '1' } })
    const singleData = await singleRes.json()
    expect(singleData.user.name).toBe('Alice')
  })

  it('should handle POST with JSON body', async () => {
    const app = new Hono().post('/echo', async (c) => {
      const body = await c.req.json()
      return c.json({ received: body })
    })

    const client = testClient(app)
    const res = await client.echo.$post({
      json: { message: 'Hello' },
    })
    const data = await res.json()

    expect(data.received.message).toBe('Hello')
  })

  it('should handle query parameters', async () => {
    const app = new Hono().get('/search', (c) => {
      const q = c.req.query('q')
      return c.json({ query: q })
    })

    const client = testClient(app)
    const res = await client.search.$get({ query: { q: 'test' } })
    const data = await res.json()

    expect(data.query).toBe('test')
  })

  it('should handle headers', async () => {
    const app = new Hono().get('/auth', (c) => {
      const auth = c.req.header('Authorization')
      return c.json({ hasAuth: !!auth })
    })

    const client = testClient(app)
    const res = await client.auth.$get({
      header: { Authorization: 'Bearer token' },
    })
    const data = await res.json()

    expect(data.hasAuth).toBe(true)
  })
})
