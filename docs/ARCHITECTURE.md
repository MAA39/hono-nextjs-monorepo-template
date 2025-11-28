# アーキテクチャ設計

## 概要

このテンプレートは、2025年時点のHono + Next.js モノレポのベストプラクティスを実装しています。

## 設計原則

### 1. 型安全性の最大化

Hono RPC と TypeScript Project References を組み合わせることで、フロントエンド・バックエンド間の型安全性を確保します。

### 2. テスト容易性

DI（依存性注入）パターンにより、各層を独立してテスト可能な設計にしています。

### 3. 関心の分離

認証・データアクセス・ビジネスロジック・プレゼンテーションを明確に分離します。

## 技術選定の理由

### Turborepo + pnpm

- インクリメンタルビルドによる高速化
- Remote Caching（Vercel連携）
- タスク依存関係の自動解決

### Hono + RPC

- 軽量（~7KB）で高速
- Web Standard 準拠
- 複数ランタイム対応（Node.js, Bun, Cloudflare Workers等）

### TypeScript Project References

**設定のポイント：**

```json
// apps/api/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true
  }
}

// apps/web/tsconfig.json
{
  "references": [{ "path": "../api" }]
}
```

### Better Auth

- Hono との親和性が高い
- Drizzle アダプター提供
- 型推論が優秀（`auth.$Infer`）

### Drizzle ORM

- TypeScript ファーストな設計
- SQL に近い直感的な API
- 軽量（Prisma の約 1/10）

## Hono RPC 型共有の仕組み

### 問題

モノレポで `apps/api` から `apps/web` へ型をインポートする際、TypeScript が型を `any` と推論してしまう問題。

### 解決策

**1. チェーン形式でルートを定義**

```typescript
// ❌ Bad - 型推論が効かない
app.get('/users', handler1)
app.post('/users', handler2)

// ✅ Good - チェーンで型が保持される
const app = new Hono()
  .get('/users', handler1)
  .post('/users', handler2)

export type AppType = typeof app
```

**2. Hono バージョンの統一**

```json
// ルート package.json で統一
{
  "pnpm": {
    "overrides": {
      "hono": "^4.6.0"
    }
  }
}
```

## 次のステップ

- [GETTING_STARTED.md](./GETTING_STARTED.md) - セットアップ手順
- [TESTING.md](./TESTING.md) - テスト戦略
- [DI_PATTERNS.md](./DI_PATTERNS.md) - DI パターン詳細
