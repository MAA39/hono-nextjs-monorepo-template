'use client'

import { useState } from 'react'
import { useCreateTodo } from '@/hooks/useTodos'

export function CreateTodoForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const createTodo = useCreateTodo()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    await createTodo.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
    })

    setTitle('')
    setDescription('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="新しいTodoを入力..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        />
      </div>
      <div>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="説明（任意）"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        />
      </div>
      <button
        type="submit"
        disabled={!title.trim() || createTodo.isPending}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {createTodo.isPending ? '追加中...' : 'Todoを追加'}
      </button>
    </form>
  )
}
