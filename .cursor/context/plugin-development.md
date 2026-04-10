---
title: プラグイン開発
description: TypeScript パターンを使った Payload CMS プラグインの作り方
tags: [payload, plugins, architecture, patterns]
---

# Payload プラグイン開発

## プラグインのアーキテクチャ

プラグインはオプションを受け取り、Payload 設定を変換する関数を返す関数です。

```typescript
import type { Config, Plugin } from 'payload'

interface MyPluginConfig {
  enabled?: boolean
  collections?: string[]
}

export const myPlugin =
  (options: MyPluginConfig): Plugin =>
  (config: Config): Config => ({
    ...config,
    // ここで設定を変換する
  })
```

**基本パターン**: 二重アロー関数（カリー化）

- 1つ目の関数: プラグインオプションを受け取り、プラグイン関数を返す
- 2つ目の関数: Payload 設定を受け取り、変更した設定を返す

## コレクションへのフィールド追加

```typescript
export const seoPlugin =
  (options: { collections?: string[] }): Plugin =>
  (config: Config): Config => {
    const seoFields: Field[] = [
      {
        name: 'meta',
        type: 'group',
        fields: [
          { name: 'title', type: 'text' },
          { name: 'description', type: 'textarea' },
        ],
      },
    ]

    return {
      ...config,
      collections: config.collections?.map((collection) => {
        if (options.collections?.includes(collection.slug)) {
          return {
            ...collection,
            fields: [...(collection.fields || []), ...seoFields],
          }
        }
        return collection
      }),
    }
  }
```

## 新しいコレクションの追加

```typescript
export const redirectsPlugin =
  (options: { overrides?: Partial<CollectionConfig> }): Plugin =>
  (config: Config): Config => {
    const redirectsCollection: CollectionConfig = {
      slug: 'redirects',
      access: { read: () => true },
      fields: [
        { name: 'from', type: 'text', required: true, unique: true },
        { name: 'to', type: 'text', required: true },
      ],
      ...options.overrides,
    }

    return {
      ...config,
      collections: [...(config.collections || []), redirectsCollection],
    }
  }
```

## フックの追加

```typescript
const resaveChildrenHook: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  if (operation === 'update') {
    const children = await req.payload.find({
      collection: 'pages',
      where: { parent: { equals: doc.id } },
    })

    for (const child of children.docs) {
      await req.payload.update({
        collection: 'pages',
        id: child.id,
        data: child,
      })
    }
  }
  return doc
}

export const nestedDocsPlugin =
  (options: { collections: string[] }): Plugin =>
  (config: Config): Config => ({
    ...config,
    collections: (config.collections || []).map((collection) => {
      if (options.collections.includes(collection.slug)) {
        return {
          ...collection,
          hooks: {
            ...(collection.hooks || {}),
            afterChange: [resaveChildrenHook, ...(collection.hooks?.afterChange || [])],
          },
        }
      }
      return collection
    }),
  })
```

## ルートレベルエンドポイントの追加

```typescript
export const seoPlugin =
  (options: { generateTitle?: (doc: any) => string }): Plugin =>
  (config: Config): Config => {
    const generateTitleEndpoint: Endpoint = {
      path: '/plugin-seo/generate-title',
      method: 'post',
      handler: async (req) => {
        const data = await req.json?.()
        const result = options.generateTitle ? options.generateTitle(data.doc) : ''
        return Response.json({ result })
      },
    }

    return {
      ...config,
      endpoints: [...(config.endpoints ?? []), generateTitleEndpoint],
    }
  }
```

## フィールドのデフォルトオーバーライド

```typescript
type FieldsOverride = (args: { defaultFields: Field[] }) => Field[]

interface PluginConfig {
  collections?: string[]
  fields?: FieldsOverride
}

export const myPlugin =
  (options: PluginConfig): Plugin =>
  (config: Config): Config => {
    const defaultFields: Field[] = [
      { name: 'title', type: 'text' },
      { name: 'description', type: 'textarea' },
    ]

    const fields =
      options.fields && typeof options.fields === 'function'
        ? options.fields({ defaultFields })
        : defaultFields

    return {
      ...config,
      collections: config.collections?.map((collection) => {
        if (options.collections?.includes(collection.slug)) {
          return {
            ...collection,
            fields: [...(collection.fields || []), ...fields],
          }
        }
        return collection
      }),
    }
  }
```

## 無効化パターン

```typescript
interface PluginConfig {
  disabled?: boolean
  collections?: string[]
}

export const myPlugin =
  (options: PluginConfig): Plugin =>
  (config: Config): Config => {
    // データベーススキーマの一貫性のためコレクション・フィールドは常に追加する
    if (!config.collections) {
      config.collections = []
    }

    config.collections.push({
      slug: 'plugin-collection',
      fields: [{ name: 'title', type: 'text' }],
    })

    // 無効化されている場合はスキーマ変更だけ適用して早期リターン
    if (options.disabled) {
      return config
    }

    // 有効な場合のみエンドポイント・フック・コンポーネントを追加
    config.endpoints = [
      ...(config.endpoints ?? []),
      {
        path: '/my-endpoint',
        method: 'get',
        handler: async () => Response.json({ message: 'こんにちは' }),
      },
    ]

    return config
  }
```

## 管理画面コンポーネント

```typescript
export const myPlugin =
  (options: PluginConfig): Plugin =>
  (config: Config): Config => {
    if (!config.admin) config.admin = {}
    if (!config.admin.components) config.admin.components = {}
    if (!config.admin.components.beforeDashboard) {
      config.admin.components.beforeDashboard = []
    }

    // クライアントコンポーネントを追加
    config.admin.components.beforeDashboard.push('my-plugin-name/client#BeforeDashboardClient')

    // サーバーコンポーネント（RSC）を追加
    config.admin.components.beforeDashboard.push('my-plugin-name/rsc#BeforeDashboardServer')

    return config
  }
```

## onInit フック

```typescript
export const myPlugin =
  (options: PluginConfig): Plugin =>
  (config: Config): Config => {
    const incomingOnInit = config.onInit

    config.onInit = async (payload) => {
      // 重要: 既存の onInit を最初に呼ぶ
      if (incomingOnInit) await incomingOnInit(payload)

      // プラグインの初期化処理
      payload.logger.info('プラグインが初期化されました')

      // 例: データのシード
      const { totalDocs } = await payload.count({
        collection: 'plugin-collection',
        where: { id: { equals: 'seeded-by-plugin' } },
      })

      if (totalDocs === 0) {
        await payload.create({
          collection: 'plugin-collection',
          data: { id: 'seeded-by-plugin' },
        })
      }
    }

    return config
  }
```

## ベストプラクティス

### 既存の設定を保持する

```typescript
// ✅ 良い例
collections: [...(config.collections || []), newCollection]

// ❌ 悪い例
collections: [newCollection]
```

### ユーザーのオーバーライドを尊重する

```typescript
const collection: CollectionConfig = {
  slug: 'redirects',
  fields: defaultFields,
  ...options.overrides, // ユーザーのオーバーライドを最後に適用
}
```

### フックの合成

```typescript
hooks: {
  ...collection.hooks,
  afterChange: [
    myHook,
    ...(collection.hooks?.afterChange || []),
  ],
}
```

### 型安全性

```typescript
import type { Config, Plugin, CollectionConfig, Field } from 'payload'
```
