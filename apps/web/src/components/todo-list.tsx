'use client'

import { useTodos, useUpdateTodo, useDeleteTodo } from '@/hooks/useTodos'

export function TodoList() {
  const { data, isLoading, error } = useTodos()
  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()

  if (isLoading) {
    return <div className="text-center py-4">読み込み中...</div>
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        エラー: {error.message}
      </div>
    )
  }

  const todos = data?.todos ?? []

  if (todos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Todoがありません。新しいTodoを追加してください。
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <li
          key={todo.id}
          className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() =>
              updateTodo.mutate({
                id: todo.id,
                data: { completed: !todo.completed },
              })
            }
            className="w-5 h-5 rounded"
          />
          <div className="flex-1">
            <p
              className={`font-medium ${
                todo.completed ? 'line-through text-gray-400' : ''
              }`}
            >
              {todo.title}
            </p>
            {todo.description && (
              <p className="text-sm text-gray-500">{todo.description}</p>
            )}
          </div>
          <button
            onClick={() => deleteTodo.mutate(todo.id)}
            className="px-3 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
          >
            削除
          </button>
        </li>
      ))}
    </ul>
  )
}
