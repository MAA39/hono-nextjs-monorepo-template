import { UserNav } from '@/components/user-nav'
import Link from 'next/link'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold">
            Todo App
          </Link>
          <UserNav />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
