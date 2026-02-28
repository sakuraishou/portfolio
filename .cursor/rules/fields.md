---
title: フィールド
description: フィールドの種類・パターン・設定
tags: [payload, fields, validation, conditional]
---

# Payload CMS フィールド

## よく使うフィールドパターン

```typescript
// スラグの自動生成
import { slugField } from 'payload'
slugField({ fieldToUse: 'title' })

// フィルタリング付きリレーション
{
  name: 'category',
  type: 'relationship',
  relationTo: 'categories',
  filterOptions: { active: { equals: true } },
}

// 条件付きフィールド
{
  name: 'featuredImage',
  type: 'upload',
  relationTo: 'media',
  admin: {
    condition: (data) => data.featured === true,
  },
}

// 仮想フィールド
{
  name: 'fullName',
  type: 'text',
  virtual: true,
  hooks: {
    afterRead: [({ siblingData }) => `${siblingData.firstName} ${siblingData.lastName}`],
  },
}
```

## フィールドの種類

### テキストフィールド

```typescript
{
  name: 'title',
  type: 'text',
  required: true,
  unique: true,
  minLength: 5,
  maxLength: 100,
  index: true,
  localized: true,
  defaultValue: 'デフォルトタイトル',
  validate: (value) => Boolean(value) || '必須項目です',
  admin: {
    placeholder: 'タイトルを入力...',
    position: 'sidebar',
    condition: (data) => data.showTitle === true,
  },
}
```

### リッチテキスト（Lexical）

```typescript
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { HeadingFeature, LinkFeature } from '@payloadcms/richtext-lexical'

{
  name: 'content',
  type: 'richText',
  required: true,
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      HeadingFeature({
        enabledHeadingSizes: ['h1', 'h2', 'h3'],
      }),
      LinkFeature({
        enabledCollections: ['posts', 'pages'],
      }),
    ],
  }),
}
```

### リレーション

```typescript
// 単一リレーション
{
  name: 'author',
  type: 'relationship',
  relationTo: 'users',
  required: true,
  maxDepth: 2,
}

// 複数リレーション（hasMany）
{
  name: 'categories',
  type: 'relationship',
  relationTo: 'categories',
  hasMany: true,
  filterOptions: {
    active: { equals: true },
  },
}

// ポリモーフィックリレーション（複数コレクション）
{
  name: 'relatedContent',
  type: 'relationship',
  relationTo: ['posts', 'pages'],
  hasMany: true,
}
```

### 配列（Array）

```typescript
{
  name: 'slides',
  type: 'array',
  minRows: 2,
  maxRows: 10,
  labels: {
    singular: 'スライド',
    plural: 'スライド一覧',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
  ],
  admin: {
    initCollapsed: true,
  },
}
```

### ブロック（Blocks）

```typescript
import type { Block } from 'payload'

const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
    },
    {
      name: 'background',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}

const ContentBlock: Block = {
  slug: 'content',
  fields: [
    {
      name: 'text',
      type: 'richText',
    },
  ],
}

{
  name: 'layout',
  type: 'blocks',
  blocks: [HeroBlock, ContentBlock],
}
```

### セレクト（Select）

```typescript
{
  name: 'status',
  type: 'select',
  options: [
    { label: '下書き', value: 'draft' },
    { label: '公開済み', value: 'published' },
  ],
  defaultValue: 'draft',
  required: true,
}

// 複数選択
{
  name: 'tags',
  type: 'select',
  hasMany: true,
  options: ['tech', 'news', 'sports'],
}
```

### アップロード（Upload）

```typescript
{
  name: 'featuredImage',
  type: 'upload',
  relationTo: 'media',
  required: true,
  filterOptions: {
    mimeType: { contains: 'image' },
  },
}
```

### ポイント（地理位置情報）

```typescript
{
  name: 'location',
  type: 'point',
  label: '位置情報',
  required: true,
}

// 距離でクエリ
const nearbyLocations = await payload.find({
  collection: 'stores',
  where: {
    location: {
      near: [10, 20], // [経度, 緯度]
      maxDistance: 5000, // メートル単位
      minDistance: 1000,
    },
  },
})
```

### Join フィールド（逆リレーション）

```typescript
// Users コレクションから - ユーザーの注文を表示
{
  name: 'orders',
  type: 'join',
  collection: 'orders',
  on: 'customer', // orders コレクションでこのユーザーを参照しているフィールド
}
```

### タブとグループ

```typescript
// タブ
{
  type: 'tabs',
  tabs: [
    {
      label: 'コンテンツ',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'body', type: 'richText' },
      ],
    },
    {
      label: 'SEO',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
      ],
    },
  ],
}

// グループ（名前付き）
{
  name: 'meta',
  type: 'group',
  fields: [
    { name: 'title', type: 'text' },
    { name: 'description', type: 'textarea' },
  ],
}
```

## バリデーション

```typescript
{
  name: 'email',
  type: 'email',
  validate: (value, { operation, data, siblingData }) => {
    if (operation === 'create' && !value) {
      return 'メールアドレスは必須です'
    }
    if (value && !value.includes('@')) {
      return 'メールアドレスの形式が正しくありません'
    }
    return true
  },
}
```
