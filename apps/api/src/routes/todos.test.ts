import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { testClient } from 'hono/testing'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

// テスト用のモックデータ
const mockTodos = [
  {
    id: 'todo-1',
    title: 'Test Todo 1',
    description: 'Description 1',
    completed: false,
    userId: 'user-1',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'todo-2',
    title: 'Test Todo 2',
    description: null,
    completed: true,
    userId: 'user-1',
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
  },
]

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
}

// テスト用のTodo Routesを作成（DBをモック）
function createTestTodoRoutes(mockDb: any) {
  const app = new Hono()
    // 認証ミドルウェアのモック
    .use('*', async (c, next) => {
      c.set('user', mockUser)
      c.set('session', { id: 'session-1' })
      await next()
    })
    .get('/', async (c) => {
      const user = c.get('user')
      const todos = mockDb.getTodos(user.id)
      return c.json({ todos })
    })
    .post(
      '/',
      zValidator(
        'json',
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
        })
      ),
      async (c) => {
        const user = c.get('user')
        const { title, description } = c.req.valid('json')
        const todo = mockDb.createTodo({ title, description, userId: user.id })
        return c.json({ todo }, 201)
      }
    )
    .patch(
      '/:id',
      zValidator(
        'json',
        z.object({
          title: z.string().min(1).optional(),
          description: z.string().optional(),
          completed: z.boolean().optional(),
        })
      ),
      async (c) => {
        const user = c.get('user')
        const id = c.req.param('id')
        const data = c.req.valid('json')
        const todo = mockDb.updateTodo(id, user.id, data)
        if (!todo) {
          return c.json({ error: 'Todo not found' }, 404)
        }
        return c.json({ todo })
      }
    )
    .delete('/:id', async (c) => {
      const user = c.get('user')
      const id = c.req.param('id')
      const deleted = mockDb.deleteTodo(id, user.id)
      if (!deleted) {
        return c.json({ error: 'Todo not found' }, 404)
      }
      return c.json({ message: 'Deleted' })
    })

  return app
}

describe('Todo Routes', () => {
  let mockDb: {
    getTodos: ReturnType<typeof vi.fn>
    createTodo: ReturnType<typeof vi.fn>
    updateTodo: ReturnType<typeof vi.fn>
    deleteTodo: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockDb = {
      getTodos: vi.fn(),
      createTodo: vi.fn(),
      updateTodo: vi.fn(),
      deleteTodo: vi.fn(),
    }
  })

  describe('GET /todos', () => {
    it('should return todos for authenticated user', async () => {
      mockDb.getTodos.mockReturnValue(mockTodos)
      const app = createTestTodoRoutes(mockDb)
      const client = testClient(app)

      const res = await client.index.$get()
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.todos).toHaveLength(2)
      expect(data.todos[0].title).toBe('Test Todo 1')
      expect(mockDb.getTodos).toHaveBeenCalledWith('user-1')
    })

    it('should return empty array when no todos', async () => {
      mockDb.getTodos.mockReturnValue([])
      const app = createTestTodoRoutes(mockDb)
      const client = testClient(app)

      const res = await client.index.$get()
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.todos).toHaveLength(0)
    })
  })

  describe('POST /todos', () => {
    it('should create a new todo', async () => {
      const newTodo = {
        id: 'todo-new',
        title: 'New Todo',
        description: 'New Description',
        completed: false,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockDb.createTodo.mockReturnValue(newTodo)
      const app = createTestTodoRoutes(mockDb)
      const client = testClient(app)

      const res = await client.index.$post({
        json: {
          title: 'New Todo',
          description: 'New Description',
        },
      })
      const data = await res.json()

      expect(res.status).toBe(201)
      expect(data.todo.title).toBe('New Todo')
      expect(mockDb.createTodo).toHaveBeenCalledWith({
        title: 'New Todo',
        description: 'New Description',
        userId: 'user-1',
      })
    })

    it('should reject empty title', async () => {
      const app = createTestTodoRoutes(mockDb)
      const client = testClient(app)

      const res = await client.index.$post({
        json: {
          title: '',
        },
      })

      expect(res.status).toBe(400)
    })
  })

  describe('PATCH /todos/:id', () => {
    it('should update a todo', async () => {
      const updatedTodo = { ...mockTodos[0], completed: true }
      mockDb.updateTodo.mockReturnValue(updatedTodo)
      const app = createTestTodoRoutes(mockDb)
      const client = testClient(app)

      const res = await client[':id'].$patch({
        param: { id: 'todo-1' },
        json: { completed: true },
      })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.todo.completed).toBe(true)
    })

    it('should return 404 for non-existent todo', async () => {
      mockDb.updateTodo.mockReturnValue(null)
      const app = createTestTodoRoutes(mockDb)
      const client = testClient(app)

      const res = await client[':id'].$patch({
        param: { id: 'non-existent' },
        json: { completed: true },
      })

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /todos/:id', () => {
    it('should delete a todo', async () => {
      mockDb.deleteTodo.mockReturnValue(true)
      const app = createTestTodoRoutes(mockDb)
      const client = testClient(app)

      const res = await client[':id'].$delete({
        param: { id: 'todo-1' },
      })
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.message).toBe('Deleted')
    })

    it('should return 404 for non-existent todo', async () => {
      mockDb.deleteTodo.mockReturnValue(false)
      const app = createTestTodoRoutes(mockDb)
      const client = testClient(app)

      const res = await client[':id'].$delete({
        param: { id: 'non-existent' },
      })

      expect(res.status).toBe(404)
    })
  })
})
