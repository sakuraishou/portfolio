---
title: クエリ
description: Local API・REST・GraphQL のクエリパターン
tags: [payload, queries, local-api, rest, graphql]
---

# Payload CMS クエリ

## クエリ演算子

```typescript
// 等しい
{ color: { equals: 'blue' } }

// 等しくない
{ status: { not_equals: 'draft' } }

// より大きい / 以下
{ price: { greater_than: 100 } }
{ age: { less_than_equal: 65 } }

// 含む（大文字小文字を区別しない）
{ title: { contains: 'payload' } }

// Like（すべての単語が含まれる）
{ description: { like: 'cms headless' } }

// 配列内に含まれる / 含まれない
{ category: { in: ['tech', 'news'] } }

// 存在する
{ image: { exists: true } }

// 近くにある（ポイントフィールド）
{ location: { near: [10, 20, 5000] } } // [経度, 緯度, 最大距離]
```

## AND/OR ロジック

```typescript
{
  or: [
    { color: { equals: 'mint' } },
    {
      and: [
        { color: { equals: 'white' } },
        { featured: { equals: false } },
      ],
    },
  ],
}
```

## ネストプロパティ

```typescript
{
  'author.role': { equals: 'editor' },
  'meta.featured': { exists: true },
}
```

## Local API

```typescript
// ドキュメントを検索
const posts = await payload.find({
  collection: 'posts',
  where: {
    status: { equals: 'published' },
    'author.name': { contains: 'john' },
  },
  depth: 2,      // リレーションを展開
  limit: 10,
  page: 1,
  sort: '-createdAt',
  locale: 'en',
  select: {
    title: true,
    author: true,
  },
})

// ID で検索
const post = await payload.findByID({
  collection: 'posts',
  id: '123',
  depth: 2,
})

// 作成
const post = await payload.create({
  collection: 'posts',
  data: {
    title: '新しい投稿',
    status: 'draft',
  },
})

// 更新
await payload.update({
  collection: 'posts',
  id: '123',
  data: {
    status: 'published',
  },
})

// 削除
await payload.delete({
  collection: 'posts',
  id: '123',
})

// 件数カウント
const count = await payload.count({
  collection: 'posts',
  where: {
    status: { equals: 'published' },
  },
})
```

## Local API のアクセス制御

**重要**: Local API はデフォルトでアクセス制御をスキップします（`overrideAccess: true`）。

```typescript
// ❌ 間違い: user を渡してもアクセス制御がスキップされる
const posts = await payload.find({
  collection: 'posts',
  user: currentUser,
  // 結果: 管理者権限で動作してしまう
})

// ✅ 正しい: ユーザーのアクセス制御を正しく適用する
const posts = await payload.find({
  collection: 'posts',
  user: currentUser,
  overrideAccess: false, // アクセス制御の強制に必須
})

// 管理操作（意図的にアクセス制御をスキップ）
const allPosts = await payload.find({
  collection: 'posts',
  // user パラメータなし、overrideAccess はデフォルトで true
})
```

**`overrideAccess: false` を使う場面:**

- ユーザーの代わりに操作を実行する場合
- アクセス制御ロジックをテストする場合
- ユーザー権限を尊重すべき API ルート

## REST API

```typescript
import { stringify } from 'qs-esm'

const query = {
  status: { equals: 'published' },
}

const queryString = stringify(
  {
    where: query,
    depth: 2,
    limit: 10,
  },
  { addQueryPrefix: true },
)

const response = await fetch(`https://api.example.com/api/posts${queryString}`)
const data = await response.json()
```

### REST エンドポイント

```
GET    /api/{collection}           - ドキュメントを検索
GET    /api/{collection}/{id}      - ID で検索
POST   /api/{collection}           - 作成
PATCH  /api/{collection}/{id}      - 更新
DELETE /api/{collection}/{id}      - 削除
GET    /api/{collection}/count     - 件数カウント

GET    /api/globals/{slug}         - グローバルを取得
POST   /api/globals/{slug}         - グローバルを更新
```

## GraphQL

```graphql
query {
  Posts(where: { status: { equals: published } }, limit: 10, sort: "-createdAt") {
    docs {
      id
      title
      author {
        name
      }
    }
    totalDocs
    hasNextPage
  }
}

mutation {
  createPost(data: { title: "新しい投稿", status: draft }) {
    id
    title
  }
}
```

## パフォーマンスのベストプラクティス

- リレーションには `maxDepth` を設定して過剰なデータ取得を防ぐ
- `select` で返却フィールドを絞る
- よく検索するフィールドにインデックスを付ける
- 計算データには `virtual` フィールドを使う
- コストの高い処理はフックの `context` にキャッシュする
