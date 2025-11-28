'use client'

import { useRouter } from 'next/navigation'
import { useSession, signOut } from '@/lib/auth-client'

export function UserNav() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  async function handleSignOut() {
    await signOut()
    router.push('/')
    router.refresh()
  }

  if (isPending) {
    return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-24 rounded" />
  }

  if (!session) {
    return null
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {session.user.name || session.user.email}
      </span>
      <button
        onClick={handleSignOut}
        className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        ログアウト
      </button>
    </div>
  )
}
