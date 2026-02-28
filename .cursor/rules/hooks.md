---
title: フック
description: コレクションフック・フィールドフック・コンテキストパターン
tags: [payload, hooks, lifecycle, context]
---

# Payload CMS フック

## コレクションフック

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: {
    // バリデーション前 - データ整形
    beforeValidate: [
      async ({ data, operation }) => {
        if (operation === 'create') {
          data.slug = slugify(data.title)
        }
        return data
      },
    ],

    // 保存前 - ビジネスロジック
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        if (operation === 'update' && data.status === 'published') {
          data.publishedAt = new Date()
        }
        return data
      },
    ],

    // 保存後 - 副作用
    afterChange: [
      async ({ doc, req, operation, previousDoc, context }) => {
        // ループ防止のための context チェック
        if (context.skipNotification) return

        if (operation === 'create') {
          await sendNotification(doc)
        }
        return doc
      },
    ],

    // 読み取り後 - 計算フィールド
    afterRead: [
      async ({ doc, req }) => {
        doc.viewCount = await getViewCount(doc.id)
        return doc
      },
    ],

    // 削除前 - カスケード削除
    beforeDelete: [
      async ({ req, id }) => {
        await req.payload.delete({
          collection: 'comments',
          where: { post: { equals: id } },
          req, // トランザクション維持のため重要
        })
      },
    ],
  },
}
```

## フィールドフック

```typescript
import type { FieldHook } from 'payload'

const beforeValidateHook: FieldHook = ({ value }) => {
  return value.trim().toLowerCase()
}

const afterReadHook: FieldHook = ({ value, req }) => {
  // 管理者以外にはメールアドレスをマスクする
  if (!req.user?.roles?.includes('admin')) {
    return value.replace(/(.{2})(.*)(@.*)/, '$1***$3')
  }
  return value
}

{
  name: 'email',
  type: 'email',
  hooks: {
    beforeValidate: [beforeValidateHook],
    afterRead: [afterReadHook],
  },
}
```

## フックコンテキスト

フック間でデータを共有したり、フックの動作を制御するためにリクエストコンテキストを使います。

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  hooks: {
    beforeChange: [
      async ({ context }) => {
        context.expensiveData = await fetchExpensiveData()
      },
    ],
    afterChange: [
      async ({ context, doc }) => {
        // 前のフックから再利用する
        await processData(doc, context.expensiveData)
      },
    ],
  },
}
```

## Next.js キャッシュ再検証パターン

```typescript
import type { CollectionAfterChangeHook } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidatePage: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = doc.slug === 'home' ? '/' : `/${doc.slug}`
      payload.logger.info(`ページを再検証: ${path}`)
      revalidatePath(path)
    }

    // 非公開にした場合は古いパスを再検証
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = previousDoc.slug === 'home' ? '/' : `/${previousDoc.slug}`
      revalidatePath(oldPath)
    }
  }
  return doc
}
```

## 日付フィールドの自動セット

```typescript
{
  name: 'publishedOn',
  type: 'date',
  hooks: {
    beforeChange: [
      ({ siblingData, value }) => {
        if (siblingData._status === 'published' && !value) {
          return new Date()
        }
        return value
      },
    ],
  },
}
```

## ベストプラクティス

- `beforeValidate` はデータ整形に使う
- `beforeChange` はビジネスロジックに使う
- `afterChange` は副作用（通知・キャッシュ更新など）に使う
- `afterRead` は計算フィールドに使う
- コストの高い処理は `context` にキャッシュする
- トランザクション安全性のためネスト操作には `req` を渡す
- 無限ループ防止には context フラグを使う
