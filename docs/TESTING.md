# テスト戦略

> 🚧 このドキュメントは実装に合わせて更新予定です

## 概要

このテンプレートでは、以下のテスト戦略を採用しています：

1. **Unit Tests** - UseCase / Repository 層
2. **Integration Tests** - Hono ハンドラー（`testClient` 使用）
3. **E2E Tests** - フロントエンド〜API 全体

## テストツール

- **Vitest** - テストランナー
- **testClient** - Hono 公式の型安全なテストクライアント

## Unit Tests

### UseCase のテスト

```typescript
import { describe, it, expect, vi } from 'vitest'
import { getUser } from './get-user'

describe('getUser', () => {
  it('should return user when found', async () => {
    const mockRepo = {
      findById: vi.fn().mockResolvedValue({ id: '1', name: 'John' })
    }
    
    const result = await getUser({ userRepository: mockRepo }, { id: '1' })
    
    expect(result).toEqual({ id: '1', name: 'John' })
  })
})
```

## Integration Tests

### Hono ハンドラーのテスト（testClient）

```typescript
import { describe, it, expect } from 'vitest'
import { testClient } from 'hono/testing'
import { createApp } from '../src/app'

describe('GET /users/:id', () => {
  const app = createApp({
    userRepository: {
      findById: async (id) => ({ id, name: 'Test User' })
    }
  })
  
  const client = testClient(app)
  
  it('should return 200 with user data', async () => {
    const res = await client.users[':id'].$get({
      param: { id: '1' }
    })
    
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ id: '1', name: 'Test User' })
  })
})
```

## テストの実行

```bash
# すべてのテストを実行
pnpm test

# 特定のパッケージのテストを実行
pnpm test --filter=api

# ウォッチモード
pnpm test:watch

# カバレッジ
pnpm test:coverage
```

## ベストプラクティス

### 1. testClient を使う

```typescript
// ❌ app.request() - 型が効かない
const res = await app.request('/users/1')

// ✅ testClient() - 型安全
const client = testClient(app)
const res = await client.users[':id'].$get({ param: { id: '1' } })
```

### 2. DI でモック注入

```typescript
// ❌ vi.mock() - グローバルに影響
vi.mock('../db', () => ({ ... }))

// ✅ DI - テストごとに独立
const app = createApp({ db: mockDb })
```

## 次のステップ

- [DI_PATTERNS.md](./DI_PATTERNS.md) - DI パターンの詳細
