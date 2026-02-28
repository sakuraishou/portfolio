---
title: アクセス制御 - 高度なパターン
description: コンテキスト対応・時間ベース・サブスクリプションベースのアクセス制御、ファクトリー関数、テンプレート
tags: [payload, access-control, security, advanced, performance]
priority: high
---

# 高度なアクセス制御パターン

コンテキスト対応アクセス・時間ベースの制限・ファクトリー関数・本番テンプレートを含む高度なアクセス制御パターンです。

## コンテキスト対応アクセスパターン

### ロケール別アクセス制御

```typescript
import type { Access } from 'payload'

export const localeSpecificAccess: Access = ({ req: { user, locale } }) => {
  // ログイン済みユーザーはすべてのロケールにアクセス可能
  if (user) return true

  // 未ログインユーザーは英語コンテンツのみ
  if (locale === 'en') return true

  return false
}
```

### デバイス別アクセス制御

```typescript
export const mobileOnlyAccess: Access = ({ req: { headers } }) => {
  const userAgent = headers?.get('user-agent') || ''
  return /mobile|android|iphone/i.test(userAgent)
}

export const desktopOnlyAccess: Access = ({ req: { headers } }) => {
  const userAgent = headers?.get('user-agent') || ''
  return !/mobile|android|iphone/i.test(userAgent)
}
```

### IP ベースのアクセス制御

```typescript
export const restrictedIpAccess = (allowedIps: string[]): Access => {
  return ({ req: { headers } }) => {
    const ip = headers?.get('x-forwarded-for') || headers?.get('x-real-ip')
    return allowedIps.includes(ip || '')
  }
}

// 使い方
const internalIps = ['192.168.1.0/24', '10.0.0.5']

export const InternalDocs: CollectionConfig = {
  slug: 'internal-docs',
  access: {
    read: restrictedIpAccess(internalIps),
  },
}
```

## 時間ベースのアクセスパターン

### 当日のレコードのみ

```typescript
export const todayOnlyAccess: Access = ({ req: { user } }) => {
  if (!user) return false

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

  return {
    createdAt: {
      greater_than_equal: startOfDay.toISOString(),
      less_than: endOfDay.toISOString(),
    },
  }
}
```

### 直近 N 日間のレコード

```typescript
export const recentRecordsAccess = (days: number): Access => {
  return ({ req: { user } }) => {
    if (!user) return false
    if (user.roles?.includes('admin')) return true

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    return {
      createdAt: {
        greater_than_equal: cutoff.toISOString(),
      },
    }
  }
}

// 使い方: ユーザーは直近30日間のみ、管理者は全件
export const Logs: CollectionConfig = {
  slug: 'logs',
  access: {
    read: recentRecordsAccess(30),
  },
}
```

### スケジュールコンテンツ（公開日時の範囲）

```typescript
export const scheduledContentAccess: Access = ({ req: { user } }) => {
  // 編集者・管理者はすべてのコンテンツを閲覧可能
  if (user?.roles?.includes('admin') || user?.roles?.includes('editor')) {
    return true
  }

  const now = new Date().toISOString()

  // 一般ユーザーは公開ウィンドウ内のコンテンツのみ
  return {
    and: [
      { publishDate: { less_than_equal: now } },
      {
        or: [{ unpublishDate: { exists: false } }, { unpublishDate: { greater_than: now } }],
      },
    ],
  }
}
```

## サブスクリプションベースのアクセス制御

### アクティブなサブスクリプションが必要

```typescript
export const activeSubscriptionAccess: Access = async ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('admin')) return true

  try {
    const subscription = await req.payload.findByID({
      collection: 'subscriptions',
      id: user.subscriptionId,
    })

    return subscription?.status === 'active'
  } catch {
    return false
  }
}
```

### サブスクリプションティアベースのアクセス制御

```typescript
export const tierBasedAccess = (requiredTier: string): Access => {
  const tierHierarchy = ['free', 'basic', 'pro', 'enterprise']

  return async ({ req: { user } }) => {
    if (!user) return false
    if (user.roles?.includes('admin')) return true

    try {
      const subscription = await req.payload.findByID({
        collection: 'subscriptions',
        id: user.subscriptionId,
      })

      if (subscription?.status !== 'active') return false

      const userTierIndex = tierHierarchy.indexOf(subscription.tier)
      const requiredTierIndex = tierHierarchy.indexOf(requiredTier)

      return userTierIndex >= requiredTierIndex
    } catch {
      return false
    }
  }
}

// 使い方
export const EnterpriseFeatures: CollectionConfig = {
  slug: 'enterprise-features',
  access: {
    read: tierBasedAccess('enterprise'),
  },
}
```

## ファクトリー関数

### createRoleBasedAccess

```typescript
export function createRoleBasedAccess(roles: string[]): Access {
  return ({ req: { user } }) => {
    if (!user) return false
    return roles.some((role) => user.roles?.includes(role))
  }
}

// 使い方
const adminOrEditor = createRoleBasedAccess(['admin', 'editor'])
const moderatorAccess = createRoleBasedAccess(['admin', 'moderator'])
```

### createOrgScopedAccess

```typescript
export function createOrgScopedAccess(allowAdmin = true): Access {
  return ({ req: { user } }) => {
    if (!user) return false
    if (allowAdmin && user.roles?.includes('admin')) return true

    return {
      organizationId: { in: user.organizationIds || [] },
    }
  }
}

// 使い方
const orgScoped = createOrgScopedAccess()        // 管理者はバイパス
const strictOrgScoped = createOrgScopedAccess(false) // 管理者もスコープ内
```

### createTeamBasedAccess

```typescript
export function createTeamBasedAccess(teamField = 'teamId'): Access {
  return ({ req: { user } }) => {
    if (!user) return false
    if (user.roles?.includes('admin')) return true

    return {
      [teamField]: { in: user.teamIds || [] },
    }
  }
}
```

### createTimeLimitedAccess

```typescript
export function createTimeLimitedAccess(daysAccess: number): Access {
  return ({ req: { user } }) => {
    if (!user) return false
    if (user.roles?.includes('admin')) return true

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - daysAccess)

    return {
      createdAt: {
        greater_than_equal: cutoff.toISOString(),
      },
    }
  }
}
```

## 設定テンプレート

### 公開 + 認証コレクション

```typescript
export const PublicAuthCollection: CollectionConfig = {
  slug: 'posts',
  access: {
    // 管理者・編集者のみ作成可能
    create: ({ req: { user } }) => {
      return user?.roles?.some((role) => ['admin', 'editor'].includes(role)) || false
    },

    // ログイン済みは全件、未ログインは公開済みのみ
    read: ({ req: { user } }) => {
      if (user) return true
      return { _status: { equals: 'published' } }
    },

    // 管理者・編集者のみ更新可能
    update: ({ req: { user } }) => {
      return user?.roles?.some((role) => ['admin', 'editor'].includes(role)) || false
    },

    // 管理者のみ削除可能
    delete: ({ req: { user } }) => {
      return user?.roles?.includes('admin') || false
    },
  },
  versions: {
    drafts: true,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'richText', required: true },
    { name: 'author', type: 'relationship', relationTo: 'users' },
  ],
}
```

### セルフサービスコレクション

```typescript
export const SelfServiceCollection: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    // 管理者のみユーザーを作成できる
    create: ({ req: { user } }) => user?.roles?.includes('admin') || false,

    // 誰でもユーザープロフィールを読める
    read: () => true,

    // ユーザーは自分自身、管理者は誰でも更新可能
    update: ({ req: { user }, id }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return user.id === id
    },

    // 管理者のみ削除可能
    delete: ({ req: { user } }) => user?.roles?.includes('admin') || false,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: ['admin', 'editor', 'user'],
      access: {
        // 管理者のみロールを読み書き可能
        read: ({ req: { user } }) => user?.roles?.includes('admin') || false,
        update: ({ req: { user } }) => user?.roles?.includes('admin') || false,
      },
    },
  ],
}
```

## パフォーマンスの考慮事項

### ホットパスでの非同期処理を避ける

```typescript
// ❌ 遅い: 複数の非同期呼び出しを直列で実行
export const slowAccess: Access = async ({ req: { user } }) => {
  const org = await req.payload.findByID({ collection: 'orgs', id: user.orgId })
  const team = await req.payload.findByID({ collection: 'teams', id: user.teamId })
  const subscription = await req.payload.findByID({ collection: 'subs', id: user.subId })

  return org.active && team.active && subscription.active
}

// ✅ 速い: クエリ制約を使うか context にキャッシュする
export const fastAccess: Access = ({ req: { user, context } }) => {
  // コストの高い処理をキャッシュ
  if (!context.orgStatus) {
    context.orgStatus = checkOrgStatus(user.orgId)
  }

  return context.orgStatus
}
```

### クエリ制約の最適化

```typescript
// ❌ 避ける: インデックスのないフィールドを制約に使う
export const slowQuery: Access = () => ({
  'metadata.internalCode': { equals: 'ABC123' }, // インデックスがないと遅い
})

// ✅ 良い: インデックス付きフィールドを使う
export const fastQuery: Access = () => ({
  status: { equals: 'active' },           // インデックス付きフィールド
  organizationId: { in: ['org1', 'org2'] }, // インデックス付きフィールド
})
```

### 大きな配列フィールドのアクセス制御

```typescript
// ❌ 遅い: 配列フィールドへの複雑なアクセス制御
{
  name: 'items',
  type: 'array',
  fields: [
    {
      name: 'secretData',
      type: 'text',
      access: {
        read: async ({ req }) => {
          // 配列の各アイテムに対して非同期呼び出しが走る
          const result = await expensiveCheck()
          return result
        },
      },
    },
  ],
}

// ✅ 速い: シンプルなチェックか結果をキャッシュ
{
  name: 'items',
  type: 'array',
  fields: [
    {
      name: 'secretData',
      type: 'text',
      access: {
        read: ({ req: { user }, context }) => {
          // 一度だけチェックして全アイテムで再利用
          if (context.canReadSecret === undefined) {
            context.canReadSecret = user?.roles?.includes('admin')
          }
          return context.canReadSecret
        },
      },
    },
  ],
}
```

### N+1 クエリを避ける

```typescript
// ❌ N+1 問題: アクセスチェックのたびにクエリが発生
export const n1Access: Access = async ({ req, id }) => {
  // 一覧の各ドキュメントに対して実行される
  const doc = await req.payload.findByID({ collection: 'docs', id })
  return doc.isPublic
}

// ✅ 良い: DB レベルでフィルタリングするクエリ制約を使う
export const efficientAccess: Access = () => {
  return { isPublic: { equals: true } }
}
```

## デバッグのヒント

### アクセスチェックのログ出力

```typescript
export const debugAccess: Access = ({ req: { user }, id }) => {
  console.log('アクセスチェック:', {
    userId: user?.id,
    userRoles: user?.roles,
    docId: id,
    timestamp: new Date().toISOString(),
  })
  return true
}
```

### 引数の確認

```typescript
export const checkArgsAccess: Access = (args) => {
  console.log('利用可能な引数:', {
    hasReq: 'req' in args,
    hasUser: args.req?.user ? 'あり' : 'なし',
    hasId: args.id ? '提供あり' : '未定義',
    hasData: args.data ? '提供あり' : '未定義',
  })
  return true
}
```

### ユーザーなしのアクセステスト

```typescript
// テスト・開発時
const testAccess = await payload.find({
  collection: 'posts',
  overrideAccess: false, // アクセス制御を強制
  user: undefined,       // 未ログイン状態をシミュレート
})

console.log('公開アクセス結果:', testAccess.docs.length)
```

## ベストプラクティス

1. **デフォルト拒否**: 制限的なアクセスから始めて、段階的に権限を追加する
2. **型ガード**: ユーザーの型安全性のために TypeScript を活用する
3. **データの検証**: フロントエンドから提供された ID やデータを信頼しない
4. **重要なチェックには非同期を使う**: 重要なセキュリティ判断には非同期処理を使う
5. **ロジックの一貫性**: フィールドとコレクションで同じルールを適用する
6. **エッジケースのテスト**: ユーザーなし・別ユーザー・管理者ユーザーでテストする
7. **アクセスの監視**: セキュリティ確認のためアクセス失敗をログに記録する
8. **定期的な監査**: 主要な変更後または四半期ごとにアクセスルールを見直す
9. **賢くキャッシュする**: コストの高い処理には `req.context` を使う
10. **意図を文書化する**: 複雑なアクセスルールにはコメントで説明を追加する
11. **クライアントに秘密を公開しない**: 機密ロジックをクライアントサイドに露出させない
12. **エラーを適切に処理する**: アクセス関数はエラー時に例外を投げず `false` を返す
13. **Local API をテストする**: テスト時は `overrideAccess: false` を設定することを忘れない
14. **パフォーマンスを考慮する**: 非同期処理の影響を計測する
15. **最小権限の原則**: 必要最小限のアクセス権のみを付与する

## パフォーマンスまとめ

**非同期処理を最小化する**: 可能な限り非同期ルックアップよりクエリ制約を使う

**コストの高いチェックをキャッシュする**: 再利用のために `req.context` に結果を保存する

**クエリフィールドにインデックスを付ける**: クエリ制約で使うフィールドにはインデックスを付ける

**配列フィールドの複雑なロジックを避ける**: シンプルな boolean チェックが望ましい

**クエリ制約を使う**: 全レコードを読み込むのではなくデータベースでフィルタリングする
