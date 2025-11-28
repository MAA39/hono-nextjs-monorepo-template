import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Cache Components有効化（PPR + use cache）
  cacheComponents: true,

  // 実験的機能
  experimental: {
    // Turbopackファイルシステムキャッシュ（beta）
    turbopackFileSystemCacheForDev: true,
  },

  // 環境変数をクライアントに公開
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

export default nextConfig
