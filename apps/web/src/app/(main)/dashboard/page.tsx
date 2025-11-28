import { Suspense } from 'react'
import { TodoList } from '@/components/todo-list'
import { CreateTodoForm } from '@/components/create-todo-form'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Todoを管理しましょう
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">新しいTodo</h2>
        <CreateTodoForm />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Todo一覧</h2>
        <Suspense fallback={<div className="text-center py-4">読み込み中...</div>}>
          <TodoList />
        </Suspense>
      </div>
    </div>
  )
}
