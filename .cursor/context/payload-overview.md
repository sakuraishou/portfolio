---
title: Payload CMS 概要
description: Payload CMS 開発の基本原則とクイックリファレンス
tags: [payload, overview, quickstart]
---

# Payload CMS 開発ルール

あなたは Payload CMS の専門家です。Payload プロジェクトで作業する際は、以下のルールに従ってください。

## 基本方針

1. **TypeScript 優先**: Payload の型を使って常に TypeScript で書く
2. **セキュリティ最優先**: セキュリティパターン、特にアクセス制御を必ず守る
3. **型の再生成**: スキーマ変更後は `generate:types` スクリプトを実行する
4. **トランザクション安全性**: フック内のネスト操作には必ず `req` を渡す
5. **アクセス制御**: Local API はデフォルトでアクセス制御をスキップすることを理解する

## プロジェクト構成

```
src/
├── app/
│   ├── (frontend)/          # フロントエンドのルート
│   └── (payload)/           # Payload 管理画面のルート
├── collections/             # コレクション設定
├── globals/                 # グローバル設定
├── components/              # カスタム React コンポーネント
├── hooks/                   # フック関数
├── access/                  # アクセス制御関数
└── payload.config.ts        # メイン設定ファイル
```

## 最小設定パターン

```typescript
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL,
  }),
})
```

## Payload インスタンスの取得

```typescript
// API ルート（Next.js）
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const payload = await getPayload({ config })

  const posts = await payload.find({
    collection: 'posts',
  })

  return Response.json(posts)
}

// サーバーコンポーネント
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function Page() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'posts' })

  return <div>{docs.map(post => <h1 key={post.id}>{post.title}</h1>)}</div>
}
```

## クイックリファレンス

| やりたいこと | 解決策 |
| --- | --- |
| スラグの自動生成 | `slugField()` |
| ユーザーでデータを絞り込む | アクセス制御 + クエリ制約 |
| Local API ユーザー操作 | `user` + `overrideAccess: false` |
| 下書き・公開 | `versions: { drafts: true }` |
| 計算フィールド | `virtual: true` + afterRead |
| 条件付きフィールド | `admin.condition` |
| カスタムバリデーション | `validate` 関数 |
| リレーションのフィルタリング | フィールドの `filterOptions` |
| 返却フィールドを絞る | `select` パラメータ |
| 日付の自動セット | beforeChange フック |
| ループ防止 | `req.context` チェック |
| カスケード削除 | beforeDelete フック |
| 地理空間クエリ | `point` フィールド + `near`/`within` |
| 逆リレーション | `join` フィールド型 |
| リレーションのクエリ | ネストプロパティ構文 |
| 複雑なクエリ | AND/OR ロジック |
| トランザクション | `req` を操作に渡す |
| バックグラウンドジョブ | ジョブキュー + タスク |
| カスタムルート | コレクションのカスタムエンドポイント |
| クラウドストレージ | ストレージアダプタープラグイン |
| 多言語対応 | `localization` + `localized: true` |

## 参考リンク

- ドキュメント: https://payloadcms.com/docs
- LLM コンテキスト: https://payloadcms.com/llms-full.txt
- GitHub: https://github.com/payloadcms/payload
- サンプル: https://github.com/payloadcms/payload/tree/main/examples
- テンプレート: https://github.com/payloadcms/payload/tree/main/templates
