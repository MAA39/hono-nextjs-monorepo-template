import { hc, InferResponseType, InferRequestType } from 'hono/client'
import type { AppType } from '@repo/api'

// Hono RPC Client
export const client = hc<AppType>(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787',
  {
    init: {
      credentials: 'include', // クッキーを含める（認証用）
    },
  }
)

// 型推論ヘルパー
export type TodosResponse = InferResponseType<typeof client.api.todos.$get>
export type TodoResponse = InferResponseType<typeof client.api.todos[':id']['$get']>
export type CreateTodoRequest = InferRequestType<typeof client.api.todos.$post>['json']
export type UpdateTodoRequest = InferRequestType<typeof client.api.todos[':id']['$patch']>['json']
