'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { client, type CreateTodoRequest, type UpdateTodoRequest } from '@/lib/api'

export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const res = await client.api.todos.$get()
      if (!res.ok) {
        throw new Error('Failed to fetch todos')
      }
      return res.json()
    },
  })
}

export function useCreateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTodoRequest) => {
      const res = await client.api.todos.$post({ json: data })
      if (!res.ok) {
        throw new Error('Failed to create todo')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useUpdateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTodoRequest }) => {
      const res = await client.api.todos[':id'].$patch({
        param: { id },
        json: data,
      })
      if (!res.ok) {
        throw new Error('Failed to update todo')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.todos[':id'].$delete({
        param: { id },
      })
      if (!res.ok) {
        throw new Error('Failed to delete todo')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
