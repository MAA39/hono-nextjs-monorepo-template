# DI（依存性注入）パターン

> 🚧 このドキュメントは実装に合わせて更新予定です

## なぜ DI が必要か？

### 素朴な実装の問題

```typescript
// ❌ Bad - 直接インポート
import { db } from './db'

app.get('/users/:id', async (c) => {
  const user = await db.query.users.findFirst({ ... })
  return c.json(user)
})
```

**問題点：**
- `db` をモックできない → テスト困難
- 実DBに依存 → テストが遅い・不安定

### DI による解決

```typescript
// ✅ Good - DI で注入
type Deps = { userRepository: IUserRepository }

const createApp = (deps: Deps) => {
  return new Hono()
    .get('/users/:id', async (c) => {
      const user = await deps.userRepository.findById(c.req.param('id'))
      return c.json(user)
    })
}

// テスト時
const app = createApp({ userRepository: mockUserRepository })
```

## Hono における DI パターン

### パターン 1: Factory パターン（推奨）

```typescript
import { createFactory } from 'hono/factory'

type Env = {
  Variables: {
    db: Database
    userRepository: IUserRepository
  }
}

const factory = createFactory<Env>({
  initApp: (app) => {
    app.use(async (c, next) => {
      c.set('db', db)
      c.set('userRepository', new UserRepository(db))
      await next()
    })
  }
})

const app = factory.createApp()
  .get('/users/:id', async (c) => {
    const repo = c.var.userRepository
    const user = await repo.findById(c.req.param('id'))
    return c.json(user)
  })
```

### パターン 2: Handler Factory パターン

```typescript
type Deps = { userRepository: IUserRepository }

const createUserHandlers = (deps: Deps) => {
  return new Hono()
    .get('/', async (c) => {
      const users = await deps.userRepository.findAll()
      return c.json(users)
    })
    .get('/:id', async (c) => {
      const user = await deps.userRepository.findById(c.req.param('id'))
      return c.json(user)
    })
}

// 本番
app.route('/users', createUserHandlers({ userRepository: new UserRepository(db) }))

// テスト
const testApp = createUserHandlers({ userRepository: mockUserRepository })
```

### パターン 3: UseCase パターン

```typescript
// usecase/get-user.ts
type Deps = { userRepository: IUserRepository }
type Input = { id: string }

export const getUser = async (deps: Deps, input: Input) => {
  return deps.userRepository.findById(input.id)
}

// handler
app.get('/users/:id', async (c) => {
  const user = await getUser(
    { userRepository: c.var.userRepository },
    { id: c.req.param('id') }
  )
  return c.json(user)
})
```

## まとめ

| パターン | 用途 | 複雑さ |
|---------|------|-------|
| Factory (createFactory) | 全体的な DI | ★★☆ |
| Handler Factory | ハンドラー単位の DI | ★★☆ |
| UseCase | ビジネスロジック分離 | ★★★ |

**推奨：** Factory + UseCase の組み合わせ
