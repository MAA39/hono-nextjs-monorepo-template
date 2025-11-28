# Getting Started

> 🚧 このドキュメントは実装に合わせて更新予定です

## 前提条件

- Node.js v20 以上
- pnpm v9 以上
- PostgreSQL（ローカル or Supabase等）

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/MAA39/hono-nextjs-monorepo-template.git
cd hono-nextjs-monorepo-template
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env
```

`.env` ファイルを編集：

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:8787"

# Next.js
NEXT_PUBLIC_API_URL="http://localhost:8787"
```

### 4. データベースのセットアップ

```bash
# スキーマをDBにプッシュ
pnpm db:push

# （オプション）マイグレーションファイル生成
pnpm db:generate
```

### 5. 開発サーバーの起動

```bash
# すべてのアプリを起動
pnpm dev

# または個別に起動
pnpm dev --filter=api
pnpm dev --filter=web
```

## アクセス

- **Web**: http://localhost:3000
- **API**: http://localhost:8787

## 次のステップ

- [ARCHITECTURE.md](./ARCHITECTURE.md) - アーキテクチャを理解する
- [TESTING.md](./TESTING.md) - テストを書く
- [DI_PATTERNS.md](./DI_PATTERNS.md) - DI パターンを学ぶ
