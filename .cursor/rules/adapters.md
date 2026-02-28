---
title: データベースアダプターとトランザクション
description: データベースアダプター・ストレージ・メール・トランザクションのパターン
tags: [payload, database, mongodb, postgres, sqlite, transactions]
---

# Payload CMS アダプター

## データベースアダプター

### MongoDB

```typescript
import { mongooseAdapter } from '@payloadcms/db-mongodb'

export default buildConfig({
  db: mongooseAdapter({
    url: process.env.DATABASE_URL,
  }),
})
```

### Postgres

```typescript
import { postgresAdapter } from '@payloadcms/db-postgres'

export default buildConfig({
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    push: false, // スキーマ変更を自動プッシュしない
    migrationDir: './migrations',
  }),
})
```

### SQLite

```typescript
import { sqliteAdapter } from '@payloadcms/db-sqlite'

export default buildConfig({
  db: sqliteAdapter({
    client: {
      url: 'file:./payload.db',
    },
    transactionOptions: {}, // トランザクションを有効化（デフォルトは無効）
  }),
})
```

## トランザクション

Payload はすべてのデータベース操作に対して自動的にトランザクションを使用します。

### フックを通じて req を渡す

**重要**: フック内でネスト操作を行う際は、トランザクションコンテキストを維持するために必ず `req` を渡してください。

```typescript
// ✅ 正しい: ネスト操作に req を渡す
const resaveChildren: CollectionAfterChangeHook = async ({ collection, doc, req }) => {
  // 子ドキュメントを検索 - req を渡す
  const children = await req.payload.find({
    collection: 'children',
    where: { parent: { equals: doc.id } },
    req, // トランザクションコンテキストを維持
  })

  // 各子ドキュメントを更新 - req を渡す
  for (const child of children.docs) {
    await req.payload.update({
      id: child.id,
      collection: 'children',
      data: { updatedField: 'value' },
      req, // 親操作と同じトランザクション内で実行
    })
  }
}

// ❌ 間違い: req がないとトランザクションが壊れる
const brokenHook: CollectionAfterChangeHook = async ({ collection, doc, req }) => {
  const children = await req.payload.find({
    collection: 'children',
    where: { parent: { equals: doc.id } },
    // req がない → 別トランザクションまたはトランザクションなし
  })

  for (const child of children.docs) {
    await req.payload.update({
      id: child.id,
      collection: 'children',
      data: { updatedField: 'value' },
      // req がない → 親操作が失敗してもこの更新は残ってしまう
    })
  }
}
```

**なぜ重要か:**

- **MongoDB（レプリカセット使用時）**: 操作間でアトミックなセッションを作る
- **PostgreSQL**: 全操作が同じ Drizzle トランザクションを使う
- **SQLite（トランザクション有効時）**: エラー時のロールバックを保証する
- **req なしの場合**: 各操作が独立して実行され、アトミック性が壊れる

### 手動トランザクション制御

```typescript
const transactionID = await payload.db.beginTransaction()
try {
  await payload.create({
    collection: 'orders',
    data: orderData,
    req: { transactionID },
  })
  await payload.update({
    collection: 'inventory',
    id: itemId,
    data: { stock: newStock },
    req: { transactionID },
  })
  await payload.db.commitTransaction(transactionID)
} catch (error) {
  await payload.db.rollbackTransaction(transactionID)
  throw error
}
```

## ストレージアダプター

利用可能なストレージアダプター:

- **@payloadcms/storage-s3** - AWS S3
- **@payloadcms/storage-azure** - Azure Blob Storage
- **@payloadcms/storage-gcs** - Google Cloud Storage
- **@payloadcms/storage-r2** - Cloudflare R2
- **@payloadcms/storage-vercel-blob** - Vercel Blob
- **@payloadcms/storage-uploadthing** - Uploadthing

### AWS S3

```typescript
import { s3Storage } from '@payloadcms/storage-s3'

export default buildConfig({
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET,
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
        region: process.env.S3_REGION,
      },
    }),
  ],
})
```

## メールアダプター

### Nodemailer（SMTP）

```typescript
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

export default buildConfig({
  email: nodemailerAdapter({
    defaultFromAddress: 'noreply@example.com',
    defaultFromName: 'マイアプリ',
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  }),
})
```

### Resend

```typescript
import { resendAdapter } from '@payloadcms/email-resend'

export default buildConfig({
  email: resendAdapter({
    defaultFromAddress: 'noreply@example.com',
    defaultFromName: 'マイアプリ',
    apiKey: process.env.RESEND_API_KEY,
  }),
})
```

## 重要な注意点

1. **MongoDB のトランザクション**: レプリカセット設定が必要
2. **SQLite のトランザクション**: デフォルト無効、`transactionOptions: {}` で有効化
3. **req を渡す**: フック内のネスト操作には必ず `req` を渡してトランザクション安全性を確保
4. **Point フィールド**: SQLite では非対応
