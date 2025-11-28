# Next.js 16 + Hono RPC + Better Auth ベストプラクティス

> 最終更新: 2025年11月
> Next.js 16 (2025年10月21日リリース) ベース

## 🎯 このプロジェクトの構成

```
apps/web/          # Next.js 16 App Router フロントエンド
apps/api/          # Hono API サーバー（別デプロイ）
packages/db/       # Drizzle ORM + スキーマ
packages/typescript-config/  # 共有TSConfig
```

---

## 📦 Next.js 16 主要な変更点

### 🚀 Turbopack（デフォルト化・Stable）

Next.js 16からTurbopackがデフォルトバンドラーに。

```bash
# デフォルトでTurbopack使用
next dev
next build

# Webpackに戻す場合
next dev --webpack
next build --webpack
```

**パフォーマンス:**
- 2-5x 高速なプロダクションビルド
- 最大10x 高速な Fast Refresh

**ファイルシステムキャッシュ（beta）:**
```ts
// next.config.ts
const nextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
}
export default nextConfig
```

---

### 🗃️ Cache Components & `use cache`

Next.js 16の新しいキャッシュモデル。**明示的なopt-in方式**。

```ts
// next.config.ts
const nextConfig = {
  cacheComponents: true,
}
export default nextConfig
```

**使用例:**
```tsx
// 関数レベルのキャッシュ
async function getProducts() {
  'use cache'
  const res = await fetch('https://api.example.com/products')
  return res.json()
}

// コンポーネントレベルのキャッシュ
async function ProductList() {
  'use cache'
  const products = await getProducts()
  return <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>
}
```

**重要な変更:**
- `experimental.ppr` → 削除（Cache Componentsに統合）
- `experimental.dynamicIO` → `cacheComponents` にリネーム
- デフォルトで動的（キャッシュはopt-in）

---

### 🔄 PPR (Partial Pre-Rendering)

静的シェル + 動的コンテンツのハイブリッドレンダリング。

```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <>
      {/* 静的: ビルド時にプリレンダリング */}
      <StaticHeader />
      <StaticSidebar />
      
      {/* 動的: リクエスト時にストリーミング */}
      <Suspense fallback={<Skeleton />}>
        <DynamicContent />
      </Suspense>
    </>
  )
}
```

---

### 🔐 proxy.ts（旧 middleware.ts）

Next.js 16で `middleware.ts` → `proxy.ts` にリネーム。

```ts
// proxy.ts（プロジェクトルート）
import { NextRequest, NextResponse } from 'next/server'

export default function proxy(request: NextRequest) {
  // 認証チェックなど
  const token = request.cookies.get('session')
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}
```

**注意:** `middleware.ts` は非推奨。将来のバージョンで削除予定。

---

### 📊 新しいキャッシュAPI

#### `revalidateTag()` - 更新された署名

```ts
import { revalidateTag } from 'next/cache'

// ✅ 新しい書き方（第2引数必須）
revalidateTag('blog-posts', 'max')      // 組み込みプロファイル
revalidateTag('products', { expire: 3600 })  // カスタム

// ⚠️ 非推奨
revalidateTag('blog-posts')  // 単一引数は非推奨
```

#### `updateTag()` - 新API（Server Actions専用）

```ts
'use server'
import { updateTag } from 'next/cache'

export async function updateProfile(userId: string, data: Profile) {
  await db.users.update(userId, data)
  // 即座にキャッシュ無効化 + 再取得
  updateTag(`user-${userId}`)
}
```

#### `refresh()` - 新API（Server Actions専用）

```ts
'use server'
import { refresh } from 'next/cache'

export async function markAsRead(notificationId: string) {
  await db.notifications.markAsRead(notificationId)
  // キャッシュされていないデータのリフレッシュ
  refresh()
}
```

---

### ⚛️ React 19.2 サポート

**新機能:**
- **View Transitions**: ページ遷移アニメーション
- **useEffectEvent()**: Effect内の非リアクティブロジック
- **\<Activity />**: バックグラウンドレンダリング

```tsx
import { ViewTransition } from 'react'

function Page() {
  return (
    <ViewTransition>
      <Content />
    </ViewTransition>
  )
}
```

---

### ⚙️ React Compiler（Stable）

自動メモ化。`useMemo`/`useCallback` が不要に。

```ts
// next.config.ts
const nextConfig = {
  reactCompiler: true,  // experimentalから昇格
}
export default nextConfig
```

```bash
npm install babel-plugin-react-compiler@latest
```

---

## 🗂️ App Router フォルダ構成

```
src/
├── app/
│   ├── layout.tsx          # 必須: Root Layout
│   ├── page.tsx            # ホームページ
│   ├── loading.tsx         # Suspense fallback
│   ├── error.tsx           # Error boundary
│   ├── not-found.tsx       # 404
│   ├── (auth)/             # Route Group（URLに影響なし）
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx      # 認証画面共通レイアウト
│   ├── (main)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── todos/
│   │   │   └── page.tsx
│   │   └── layout.tsx      # メイン画面共通レイアウト
│   └── providers.tsx       # Client Providers
├── components/
│   ├── ui/                 # 汎用UIコンポーネント
│   └── features/           # 機能別コンポーネント
├── lib/
│   ├── api.ts              # Hono RPC Client
│   └── auth-client.ts      # Better Auth Client
├── hooks/
└── types/
```

---

## ⚡ Server Components vs Client Components

### デフォルト: Server Components

```tsx
// app/page.tsx - デフォルトでServer Component
export default async function Page() {
  const data = await fetchData()  // サーバーで実行
  return <div>{data.title}</div>
}
```

### Client Components（必要な場合のみ）

```tsx
'use client'

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### パターン: Client Islands

```tsx
// Server Component内でClient Componentを使用
export default async function Page() {
  const data = await fetchData()  // サーバーで取得
  return (
    <div>
      <h1>{data.title}</h1>           {/* 静的 */}
      <InteractiveWidget data={data} /> {/* Client Component */}
    </div>
  )
}
```

---

## 🔗 Hono RPC Client セットアップ

### クライアント作成

```ts
// src/lib/api.ts
import { hc } from 'hono/client'
import type { AppType } from '@repo/api'

// 環境変数でAPIサーバーURLを指定
export const client = hc<AppType>(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787',
  {
    // クッキーを含める（認証用）
    init: {
      credentials: 'include',
    },
  }
)
```

### TanStack Query との組み合わせ

```tsx
// src/lib/api.ts
import { hc, InferResponseType, InferRequestType } from 'hono/client'
import type { AppType } from '@repo/api'

export const client = hc<AppType>(process.env.NEXT_PUBLIC_API_URL!, {
  init: { credentials: 'include' },
})

// 型推論ヘルパー
export type TodosResponse = InferResponseType<typeof client.api.todos.$get>
export type CreateTodoRequest = InferRequestType<typeof client.api.todos.$post>['json']
```

```tsx
// hooks/useTodos.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { client } from '@/lib/api'

export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const res = await client.api.todos.$get()
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })
}

export function useCreateTodo() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const res = await client.api.todos.$post({ json: data })
      if (!res.ok) throw new Error('Failed to create')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
```

---

## 🔐 Better Auth Client セットアップ

### クライアント作成

```ts
// src/lib/auth-client.ts
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787',
})

// 便利なエクスポート
export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient
```

### Provider設定

```tsx
// src/app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1分
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### 認証フック使用例

```tsx
// components/auth/user-button.tsx
'use client'

import { useSession, signOut } from '@/lib/auth-client'

export function UserButton() {
  const { data: session, isPending } = useSession()

  if (isPending) return <div>Loading...</div>
  
  if (!session) {
    return <a href="/login">ログイン</a>
  }

  return (
    <div>
      <span>{session.user.name}</span>
      <button onClick={() => signOut()}>ログアウト</button>
    </div>
  )
}
```

### ログインフォーム例

```tsx
// app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth-client'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const { data, error } = await signIn.email({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard')
    router.refresh()  // キャッシュクリア
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      {error && <p>{error}</p>}
      <button type="submit">ログイン</button>
    </form>
  )
}
```

---

## 🛡️ 認証保護 (proxy.ts)

```ts
// proxy.ts
import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/dashboard', '/todos', '/settings']
const authRoutes = ['/login', '/signup']

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('better-auth.session_token')

  // 保護されたルートへの未認証アクセス
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 認証済みユーザーの認証ページアクセス
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 📋 Breaking Changes サマリー

### 必須対応

| 変更 | 対応 |
|------|------|
| Node.js 20.9+ | Node 18は非サポート |
| TypeScript 5+ | 最低5.1.0 |
| `middleware.ts` | `proxy.ts` にリネーム |
| `params`, `searchParams` | `await` 必須 |
| `cookies()`, `headers()` | `await` 必須 |
| `revalidateTag()` | 第2引数（profile）必須 |

### 削除された機能

- AMP サポート
- `next lint` コマンド（ESLint/Biome直接使用）
- `experimental.ppr` フラグ
- `experimental.dynamicIO` → `cacheComponents`

---

## 🔧 推奨設定

### next.config.ts

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Cache Components有効化
  cacheComponents: true,
  
  // React Compiler有効化（オプション）
  reactCompiler: true,
  
  // 画像最適化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com',
      },
    ],
  },
  
  // 実験的機能
  experimental: {
    // Turbopackファイルシステムキャッシュ
    turbopackFileSystemCacheForDev: true,
  },
}

export default nextConfig
```

### package.json scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx"
  }
}
```

---

## 📚 参考リンク

- [Next.js 16 公式ブログ](https://nextjs.org/blog/next-16)
- [Next.js 16 アップグレードガイド](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Hono RPC ドキュメント](https://hono.dev/docs/guides/rpc)
- [Better Auth Next.js統合](https://www.better-auth.com/docs/integrations/next)
- [TanStack Query](https://tanstack.com/query/latest)
