---
title: アクセス制御
description: コレクション・フィールド・グローバルのアクセス制御パターン
tags: [payload, access-control, security, permissions, rbac]
---

# Payload CMS アクセス制御

## アクセス制御の階層

1. **コレクションレベル**: ドキュメント全体の操作を制御（create・read・update・delete・admin）
2. **フィールドレベル**: 個別フィールドへのアクセスを制御（create・read・update）
3. **グローバルレベル**: グローバルドキュメントへのアクセスを制御（read・update）

## コレクションのアクセス制御

```typescript
import type { Access } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    // boolean: ログイン済みユーザーのみ作成可能
    create: ({ req: { user } }) => Boolean(user),

    // クエリ制約: 未ログインは公開済みのみ、ログイン済みは全件
    read: ({ req: { user } }) => {
      if (user) return true
      return { status: { equals: 'published' } }
    },

    // ユーザー固有: 管理者またはドキュメントのオーナー
    update: ({ req: { user }, id }) => {
      if (user?.roles?.includes('admin')) return true
      return { author: { equals: user?.id } }
    },

    // 非同期: 関連データを確認
    delete: async ({ req, id }) => {
      const hasComments = await req.payload.count({
        collection: 'comments',
        where: { post: { equals: id } },
      })
      return hasComments === 0
    },
  },
}
```

## よく使うアクセスパターン

```typescript
// 誰でも OK
export const anyone: Access = () => true

// ログイン済みのみ
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

// 管理者のみ
export const adminOnly: Access = ({ req: { user } }) => {
  return user?.roles?.includes('admin')
}

// 管理者または自分自身
export const adminOrSelf: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true
  return { id: { equals: user?.id } }
}

// 公開済みまたはログイン済み
export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}
```

## 行レベルセキュリティ（Row-Level Security）

```typescript
// 組織スコープのアクセス制御
export const organizationScoped: Access = ({ req: { user } }) => {
  if (user?.roles?.includes('admin')) return true

  // ユーザーは自分の組織のデータのみ見える
  return {
    organization: {
      equals: user?.organization,
    },
  }
}

// チームベースのアクセス制御
export const teamMemberAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('admin')) return true

  return {
    'team.members': {
      contains: user.id,
    },
  }
}
```

## フィールドのアクセス制御

**フィールドアクセスは boolean のみ返します**（クエリ制約は使えません）。

```typescript
{
  name: 'salary',
  type: 'number',
  access: {
    read: ({ req: { user }, doc }) => {
      // 自分自身は自分の給与を読める
      if (user?.id === doc?.id) return true
      // 管理者は全員読める
      return user?.roles?.includes('admin')
    },
    update: ({ req: { user } }) => {
      // 管理者のみ更新可能
      return user?.roles?.includes('admin')
    },
  },
}
```

## RBAC パターン

Payload はデフォルトでロールシステムを提供しません。認証コレクションに `roles` フィールドを追加してください。

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: ['admin', 'editor', 'user'],
      defaultValue: ['user'],
      required: true,
      saveToJWT: true, // JWT に含めることで高速なアクセスチェックが可能
      access: {
        update: ({ req: { user } }) => user?.roles?.includes('admin'),
      },
    },
  ],
}
```

## マルチテナントのアクセス制御

```typescript
interface User {
  id: string
  tenantId: string
  roles?: string[]
}

const tenantAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('super-admin')) return true

  return {
    tenant: {
      equals: (user as User).tenantId,
    },
  }
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    create: tenantAccess,
    read: tenantAccess,
    update: tenantAccess,
    delete: tenantAccess,
  },
  fields: [
    {
      name: 'tenant',
      type: 'text',
      required: true,
      access: {
        update: ({ req: { user } }) => user?.roles?.includes('super-admin'),
      },
      hooks: {
        beforeChange: [
          ({ req, operation, value }) => {
            if (operation === 'create' && !value) {
              return (req.user as User)?.tenantId
            }
            return value
          },
        ],
      },
    },
  ],
}
```

## 重要な注意点

1. **Local API のデフォルト**: Local API ではアクセス制御がデフォルトで**スキップされます**（`overrideAccess: true`）。`user` パラメータを渡す場合は必ず `overrideAccess: false` を設定してください:

```typescript
// ❌ 間違い: user を渡してもアクセス制御がスキップされる
await payload.find({
  collection: 'posts',
  user: someUser,
})

// ✅ 正しい: ユーザーの権限を正しく適用する
await payload.find({
  collection: 'posts',
  user: someUser,
  overrideAccess: false, // アクセス制御の強制に必須
})
```

2. **フィールドアクセスの制限**: フィールドレベルのアクセス制御はクエリ制約をサポートしません。boolean のみ返します。

3. **管理画面の表示**: `admin` アクセス制御はコレクションが管理画面に表示されるかを制御します。
