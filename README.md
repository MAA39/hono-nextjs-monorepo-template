# Hono + Next.js 16 Monorepo Template

> 🔥 2025年ベストプラクティスに基づいた、Hono + Next.js 16 + Better Auth + Drizzle のモノレポテンプレート

## 📖 概要

このテンプレートは、以下の課題を解決します：

- **型安全なAPI通信**: Hono RPC + TypeScript Project References
- **テスト容易性**: DI（依存性注入）パターンによるモック可能な設計
- **認証の統合**: Better Auth による堅牢な認証基盤
- **モノレポ管理**: Turborepo による効率的なビルド・開発体験

## 🏗️ アーキテクチャ

```
hono-nextjs-monorepo-template/
├── apps/
│   ├── api/          # Hono API サーバー (port 8787)
│   └── web/          # Next.js 16 フロントエンド (port 3000)
├── packages/
│   ├── db/           # Drizzle スキーマ・クライアント
│   └── typescript-config/
├── turbo.json
└── pnpm-workspace.yaml
```

## 🚀 Quick Start

```bash
# クローン
git clone https://github.com/MAA39/hono-nextjs-monorepo-template.git
cd hono-nextjs-monorepo-template

# 依存関係インストール
pnpm install

# 環境変数設定
cp .env.example .env
# DATABASE_URL, BETTER_AUTH_SECRET を設定

# DBマイグレーション
pnpm db:push

# 開発サーバー起動
pnpm dev
```

- API: http://localhost:8787
- Web: http://localhost:3000

## 📚 ドキュメント

| ドキュメント | 説明 |
|-------------|------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | アーキテクチャ設計・技術選定の理由 |
| [GETTING_STARTED.md](./docs/GETTING_STARTED.md) | 詳細なセットアップ手順 |
| [TESTING.md](./docs/TESTING.md) | テスト戦略・実装パターン |
| [DI_PATTERNS.md](./docs/DI_PATTERNS.md) | 依存性注入パターンの解説 |
| [apps/web/CLAUDE.md](./apps/web/CLAUDE.md) | Next.js 16 ベストプラクティス |

## 🛠️ 技術スタック

| カテゴリ | 技術 |
|---------|------|
| モノレポ | Turborepo v2.3 + pnpm v9 |
| API | Hono v4.6 (RPC, Zod Validator) |
| フロントエンド | Next.js 16 (App Router, Turbopack, Cache Components) |
| 認証 | Better Auth v1.1 |
| ORM | Drizzle ORM v0.38 |
| DB | PostgreSQL (Neon) |
| 状態管理 | TanStack Query v5 |
| スタイリング | Tailwind CSS v3.4 |
| テスト | Vitest (予定) |
| 型共有 | TypeScript Project References |

## ✨ Next.js 16 新機能

このテンプレートは Next.js 16 の新機能を活用しています：

- **Turbopack**: デフォルトバンドラー（5-10x高速）
- **Cache Components**: `use cache` ディレクティブによる明示的キャッシュ
- **proxy.ts**: 新しい認証保護パターン（旧 middleware.ts）
- **React 19.2**: View Transitions, useEffectEvent 対応

詳細は [apps/web/CLAUDE.md](./apps/web/CLAUDE.md) を参照。

## 📁 プロジェクト構成

```
apps/
├── api/                    # Hono API サーバー
│   ├── src/
│   │   ├── index.ts       # エントリーポイント + AppType エクスポート
│   │   ├── routes/        # API ルート (auth, todos)
│   │   ├── middleware/    # 認証ミドルウェア
│   │   └── lib/           # DB, Auth 設定
│   └── tsconfig.json      # composite: true
│
└── web/                    # Next.js 16 フロントエンド
    ├── src/
    │   ├── app/           # App Router
    │   │   ├── (auth)/    # 認証ページ (login, signup)
    │   │   └── (main)/    # メインページ (dashboard)
    │   ├── components/    # React コンポーネント
    │   ├── hooks/         # カスタムフック (useTodos)
    │   └── lib/           # API Client, Auth Client
    ├── proxy.ts           # 認証保護 (Next.js 16)
    └── CLAUDE.md          # ベストプラクティス
```

## 📄 License

MIT
