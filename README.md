# Hono + Next.js Monorepo Template

> 🔥 2025年ベストプラクティスに基づいた、Hono + Next.js + Better Auth + Drizzle のモノレポテンプレート

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
│   ├── api/          # Hono API サーバー
│   └── web/          # Next.js フロントエンド
├── packages/
│   ├── db/           # Drizzle スキーマ・クライアント
│   ├── typescript-config/
│   └── eslint-config/
├── turbo.json
└── pnpm-workspace.yaml
```

## 📚 ドキュメント

| ドキュメント | 説明 |
|-------------|------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | アーキテクチャ設計・技術選定の理由 |
| [GETTING_STARTED.md](./docs/GETTING_STARTED.md) | 詳細なセットアップ手順 |
| [TESTING.md](./docs/TESTING.md) | テスト戦略・実装パターン |
| [DI_PATTERNS.md](./docs/DI_PATTERNS.md) | 依存性注入パターンの解説 |

## 🛠️ 技術スタック

- **モノレポ**: Turborepo + pnpm
- **API**: Hono v4.x
- **フロントエンド**: Next.js 15 (App Router)
- **認証**: Better Auth v1.x
- **ORM**: Drizzle ORM v0.44.x
- **DB**: PostgreSQL
- **テスト**: Vitest
- **型共有**: TypeScript Project References

## 📄 License

MIT
