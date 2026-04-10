---
title: コレクション
description: コレクションの設定とパターン
tags: [payload, collections, auth, upload, drafts]
---

# Payload CMS コレクション

## 基本コレクション

```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'createdAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, index: true },
    { name: 'content', type: 'richText' },
    { name: 'author', type: 'relationship', relationTo: 'users' },
  ],
  timestamps: true,
}
```

## RBAC（ロールベースアクセス制御）付き認証コレクション

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

## アップロードコレクション

```typescript
export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
      },
    ],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    crop: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
```

## バージョン管理・下書き

```typescript
export const Pages: CollectionConfig = {
  slug: 'pages',
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
      validate: false, // 下書きはバリデーションしない
    },
    maxPerDoc: 100,
  },
  access: {
    read: ({ req: { user } }) => {
      // 未ログインは公開済みのみ
      if (!user) return { _status: { equals: 'published' } }
      // ログイン済みは全件
      return true
    },
  },
}
```

### 下書き API の使い方

```typescript
// 下書きを作成
await payload.create({
  collection: 'posts',
  data: { title: '下書き投稿' },
  draft: true, // 必須フィールドのバリデーションをスキップ
})

// 下書きを読み取る
const page = await payload.findByID({
  collection: 'pages',
  id: '123',
  draft: true, // 下書きバージョンがあれば返す
})
```

## グローバル

グローバルは単一インスタンスのドキュメントです（コレクションとは異なる）。

```typescript
import type { GlobalConfig } from 'payload'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'ヘッダー',
  admin: {
    group: '設定',
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'nav',
      type: 'array',
      maxRows: 8,
      fields: [
        {
          name: 'link',
          type: 'relationship',
          relationTo: 'pages',
        },
        {
          name: 'label',
          type: 'text',
        },
      ],
    },
  ],
}
```
