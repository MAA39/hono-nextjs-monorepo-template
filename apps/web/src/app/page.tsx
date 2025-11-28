import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">
          Hono + Next.js 16 Todo App
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Better Auth + Drizzle ORM + TanStack Query
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ログイン
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            新規登録
          </Link>
        </div>

        <div className="mt-12 p-6 bg-gray-100 dark:bg-gray-900 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">技術スタック</h2>
          <ul className="text-left space-y-2 text-sm">
            <li>✅ Next.js 16 (App Router, Turbopack, Cache Components)</li>
            <li>✅ Hono v4.6 (RPC, Zod Validator)</li>
            <li>✅ Better Auth v1.1 (Email/Password)</li>
            <li>✅ Drizzle ORM (PostgreSQL)</li>
            <li>✅ TanStack Query v5</li>
            <li>✅ Tailwind CSS v3</li>
            <li>✅ TypeScript 5.7</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
