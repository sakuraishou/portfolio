---
title: カスタムエンドポイント
description: 認証付きカスタム REST API エンドポイントとヘルパー
tags: [payload, endpoints, api, routes, webhooks]
---

# Payload カスタムエンドポイント

## 基本的なエンドポイントパターン

カスタムエンドポイントは**デフォルトで認証されていません**。必ず `req.user` を確認してください。

```typescript
import { APIError } from 'payload'
import type { Endpoint } from 'payload'

export const protectedEndpoint: Endpoint = {
  path: '/protected',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      throw new APIError('Unauthorized', 401)
    }

    // データベース操作には req.payload を使う
    const data = await req.payload.find({
      collection: 'posts',
      where: { author: { equals: req.user.id } },
    })

    return Response.json(data)
  },
}
```

## ルートパラメータ

```typescript
export const trackingEndpoint: Endpoint = {
  path: '/:id/tracking',
  method: 'get',
  handler: async (req) => {
    const { id } = req.routeParams

    const tracking = await getTrackingInfo(id)

    if (!tracking) {
      return Response.json({ error: 'not found' }, { status: 404 })
    }

    return Response.json(tracking)
  },
}
```

## リクエストボディの処理

```typescript
// JSON を手動でパース
export const createEndpoint: Endpoint = {
  path: '/create',
  method: 'post',
  handler: async (req) => {
    const data = await req.json()

    const result = await req.payload.create({
      collection: 'posts',
      data,
    })

    return Response.json(result)
  },
}

// ヘルパーを使う（JSON + ファイルを処理）
import { addDataAndFileToRequest } from 'payload'

export const uploadEndpoint: Endpoint = {
  path: '/upload',
  method: 'post',
  handler: async (req) => {
    await addDataAndFileToRequest(req)

    // req.data にパース済みのボディが入る
    // req.file にアップロードされたファイルが入る（マルチパートの場合）

    const result = await req.payload.create({
      collection: 'media',
      data: req.data,
      file: req.file,
    })

    return Response.json(result)
  },
}
```

## クエリパラメータ

```typescript
export const searchEndpoint: Endpoint = {
  path: '/search',
  method: 'get',
  handler: async (req) => {
    const url = new URL(req.url)
    const query = url.searchParams.get('q')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    const results = await req.payload.find({
      collection: 'posts',
      where: {
        title: {
          contains: query,
        },
      },
      limit,
    })

    return Response.json(results)
  },
}
```

## CORS ヘッダー

```typescript
import { headersWithCors } from 'payload'

export const corsEndpoint: Endpoint = {
  path: '/public-data',
  method: 'get',
  handler: async (req) => {
    const data = await fetchPublicData()

    return Response.json(data, {
      headers: headersWithCors({
        headers: new Headers(),
        req,
      }),
    })
  },
}
```

## エラーハンドリング

```typescript
import { APIError } from 'payload'

export const validateEndpoint: Endpoint = {
  path: '/validate',
  method: 'post',
  handler: async (req) => {
    const data = await req.json()

    if (!data.email) {
      throw new APIError('メールアドレスは必須です', 400)
    }

    return Response.json({ valid: true })
  },
}
```

## エンドポイントの配置場所

### コレクションエンドポイント

`/api/{collection-slug}/{path}` にマウントされます。

```typescript
export const Orders: CollectionConfig = {
  slug: 'orders',
  endpoints: [
    {
      path: '/:id/tracking',
      method: 'get',
      handler: async (req) => {
        // /api/orders/:id/tracking でアクセス可能
        const orderId = req.routeParams.id
        return Response.json({ orderId })
      },
    },
  ],
}
```

### グローバルエンドポイント

`/api/globals/{global-slug}/{path}` にマウントされます。

```typescript
export const Settings: GlobalConfig = {
  slug: 'settings',
  endpoints: [
    {
      path: '/clear-cache',
      method: 'post',
      handler: async (req) => {
        // /api/globals/settings/clear-cache でアクセス可能
        await clearCache()
        return Response.json({ message: 'キャッシュをクリアしました' })
      },
    },
  ],
}
```

### ルートエンドポイント

`/api/{path}` にマウントされます。

```typescript
export default buildConfig({
  endpoints: [
    {
      path: '/hello',
      method: 'get',
      handler: () => {
        // /api/hello でアクセス可能
        return Response.json({ message: 'こんにちは！' })
      },
    },
  ],
})
```

## ベストプラクティス

1. **必ず認証を確認する** - カスタムエンドポイントはデフォルトで認証されていない
2. **操作には `req.payload` を使う** - アクセス制御とフックが正しく実行される
3. **共通処理にはヘルパーを使う** - `addDataAndFileToRequest`・`headersWithCors`
4. **エラーには `APIError` を投げる** - 一貫したエラーレスポンスが得られる
5. **Web API の `Response` を返す** - `Response.json()` で一貫したレスポンスにする
6. **入力を検証する** - 必須フィールドのチェック・型の検証を行う
7. **エラーをログに記録する** - デバッグには `req.payload.logger` を使う
