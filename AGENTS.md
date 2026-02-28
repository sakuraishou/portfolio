# Payload CMS 開発ルール

あなたは Payload CMS の専門家です。Payload プロジェクトで作業する際は、以下のルールに従ってください。

## 基本方針

1. **TypeScript 優先**: Payload の型を使って常に TypeScript で書く
2. **セキュリティ最優先**: セキュリティパターン、特にアクセス制御を必ず守る
3. **型の再生成**: スキーマ変更後は `generate:types` スクリプトを実行する
4. **トランザクション安全性**: フック内のネスト操作には必ず `req` を渡す
5. **アクセス制御**: Local API はデフォルトでアクセス制御をスキップすることを理解する
6. **アクセス制御**: アクセス制御のあるコレクション・グローバルを変更する際はロールの存在を確認する

### コード検証

- コード変更後に TypeScript の正しさを検証するには `tsc --noEmit` を実行する
- コンポーネントを作成・変更した後はインポートマップを再生成する

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

## 設定

### 最小設定パターン

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

## コレクション

### 基本コレクション

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

### RBAC（ロールベースアクセス制御）付き認証コレクション

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

## フィールド

### よく使うパターン

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

## 重要セキュリティパターン

### 1. Local API のアクセス制御（最重要）

```typescript
// ❌ セキュリティバグ: アクセス制御がスキップされる
await payload.find({
  collection: 'posts',
  user: someUser, // 無視される！管理者権限で動作する
})

// ✅ 安全: ユーザーの権限を正しく強制する
await payload.find({
  collection: 'posts',
  user: someUser,
  overrideAccess: false, // 必須
})

// ✅ 管理操作（意図的なバイパス）
await payload.find({
  collection: 'posts',
  // user なし、overrideAccess はデフォルトで true
})
```

**ルール**: Local API に `user` を渡す場合は、必ず `overrideAccess: false` を設定する

### 2. フック内のトランザクション安全性

```typescript
// ❌ データ破損リスク: 別トランザクションになる
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: 'audit-log',
        data: { docId: doc.id },
        // req がない → 別トランザクションで実行される！
      })
    },
  ],
}

// ✅ アトミック: 同じトランザクション内で実行
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.create({
        collection: 'audit-log',
        data: { docId: doc.id },
        req, // アトミック性を維持
      })
    },
  ],
}
```

**ルール**: フック内のネスト操作には必ず `req` を渡す

### 3. フックの無限ループ防止

```typescript
// ❌ 無限ループ
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await req.payload.update({
        collection: 'posts',
        id: doc.id,
        data: { views: doc.views + 1 },
        req,
      }) // 再び afterChange が呼ばれる！
    },
  ],
}

// ✅ 安全: context フラグを使う
hooks: {
  afterChange: [
    async ({ doc, req, context }) => {
      if (context.skipHooks) return

      await req.payload.update({
        collection: 'posts',
        id: doc.id,
        data: { views: doc.views + 1 },
        context: { skipHooks: true },
        req,
      })
    },
  ],
}
```

## アクセス制御

### コレクションレベルのアクセス制御

```typescript
import type { Access } from 'payload'

// boolean を返す
const authenticated: Access = ({ req: { user } }) => Boolean(user)

// クエリ制約（行レベルセキュリティ）
const ownPostsOnly: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user?.roles?.includes('admin')) return true

  return {
    author: { equals: user.id },
  }
}

// 非同期アクセスチェック
const projectMemberAccess: Access = async ({ req, id }) => {
  const { user, payload } = req

  if (!user) return false
  if (user.roles?.includes('admin')) return true

  const project = await payload.findByID({
    collection: 'projects',
    id: id as string,
    depth: 0,
  })

  return project.members?.includes(user.id)
}
```

### フィールドレベルのアクセス制御

```typescript
// フィールドのアクセス制御は boolean のみ返す（クエリ制約は使えない）
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

### よく使うアクセスパターン

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

## フック

### よく使うフックパターン

```typescript
import type { CollectionConfig } from 'payload'

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

## クエリ

### Local API

```typescript
// 複雑なクエリで検索
const posts = await payload.find({
  collection: 'posts',
  where: {
    and: [{ status: { equals: 'published' } }, { 'author.name': { contains: 'john' } }],
  },
  depth: 2, // リレーションを展開
  limit: 10,
  sort: '-createdAt',
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
const newPost = await payload.create({
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
  data: { status: 'published' },
})

// 削除
await payload.delete({
  collection: 'posts',
  id: '123',
})
```

### クエリ演算子

```typescript
// 等しい
{ status: { equals: 'published' } }

// 等しくない
{ status: { not_equals: 'draft' } }

// より大きい / 以下
{ price: { greater_than: 100 } }
{ age: { less_than_equal: 65 } }

// 含む（大文字小文字を区別しない）
{ title: { contains: 'payload' } }

// Like（すべての単語が含まれる）
{ description: { like: 'cms headless' } }

// 配列内に含まれる
{ category: { in: ['tech', 'news'] } }

// 存在する
{ image: { exists: true } }

// 近くにある（地理空間）
{ location: { near: [-122.4194, 37.7749, 10000] } }
```

### AND/OR ロジック

```typescript
{
  or: [
    { status: { equals: 'published' } },
    { author: { equals: user.id } },
  ],
}

{
  and: [
    { status: { equals: 'published' } },
    { featured: { equals: true } },
  ],
}
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

## コンポーネント

管理画面は React コンポーネントで広範囲にカスタマイズできます。カスタムコンポーネントはサーバーコンポーネント（デフォルト）またはクライアントコンポーネントにできます。

### コンポーネントの定義

コンポーネントは設定ファイルで**ファイルパス**（直接インポートではなく）を使って定義します。

**コンポーネントパスのルール:**

- パスはプロジェクトルートまたは `config.admin.importMap.baseDir` からの相対パス
- 名前付きエクスポート: `#ExportName` サフィックスまたは `exportName` プロパティを使う
- デフォルトエクスポート: サフィックス不要
- ファイル拡張子は省略可能

```typescript
import { buildConfig } from 'payload'

export default buildConfig({
  admin: {
    components: {
      // ロゴとブランディング
      graphics: {
        Logo: '/components/Logo',
        Icon: '/components/Icon',
      },

      // ナビゲーション
      Nav: '/components/CustomNav',
      beforeNavLinks: ['/components/CustomNavItem'],
      afterNavLinks: ['/components/NavFooter'],

      // ヘッダー
      header: ['/components/AnnouncementBanner'],
      actions: ['/components/ClearCache', '/components/Preview'],

      // ダッシュボード
      beforeDashboard: ['/components/WelcomeMessage'],
      afterDashboard: ['/components/Analytics'],

      // 認証
      beforeLogin: ['/components/SSOButtons'],
      logout: { Button: '/components/LogoutButton' },

      // 設定
      settingsMenu: ['/components/SettingsMenu'],

      // ビュー
      views: {
        dashboard: { Component: '/components/CustomDashboard' },
      },
    },
  },
})
```

### コンポーネントの種類

1. **ルートコンポーネント** - 管理画面全体（ロゴ・ナビ・ヘッダー）
2. **コレクションコンポーネント** - コレクション固有（編集ビュー・一覧ビュー）
3. **グローバルコンポーネント** - グローバルドキュメントビュー
4. **フィールドコンポーネント** - カスタムフィールドUIとセル

### サーバー vs クライアントコンポーネント

**全コンポーネントはデフォルトでサーバーコンポーネント**（Local API を直接使える）:

```tsx
// サーバーコンポーネント（デフォルト）
import type { Payload } from 'payload'

async function MyServerComponent({ payload }: { payload: Payload }) {
  const posts = await payload.find({ collection: 'posts' })
  return <div>{posts.totalDocs} 件の投稿</div>
}

export default MyServerComponent
```

**クライアントコンポーネント**には `'use client'` ディレクティブが必要:

```tsx
'use client'
import { useState } from 'react'
import { useAuth } from '@payloadcms/ui'

export function MyClientComponent() {
  const [count, setCount] = useState(0)
  const { user } = useAuth()

  return (
    <button onClick={() => setCount(count + 1)}>
      {user?.email}: {count} 回クリック
    </button>
  )
}
```

### フックの使い方（クライアントコンポーネントのみ）

```tsx
'use client'
import {
  useAuth,           // 現在のユーザー
  useConfig,         // Payload 設定（クライアント安全）
  useDocumentInfo,   // ドキュメント情報（id・コレクションなど）
  useField,          // フィールドの値とセッター
  useForm,           // フォームの状態
  useFormFields,     // 複数フィールドの値（最適化済み）
  useLocale,         // 現在のロケール
  useTranslation,    // i18n 翻訳
  usePayload,        // Local API メソッド
} from '@payloadcms/ui'

export function MyComponent() {
  const { user } = useAuth()
  const { config } = useConfig()
  const { id, collection } = useDocumentInfo()
  const locale = useLocale()
  const { t } = useTranslation()

  return <div>こんにちは {user?.email}</div>
}
```

### コレクション・グローバルコンポーネント

```typescript
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      // 編集ビュー
      edit: {
        PreviewButton: '/components/PostPreview',
        SaveButton: '/components/CustomSave',
        SaveDraftButton: '/components/SaveDraft',
        PublishButton: '/components/Publish',
      },

      // 一覧ビュー
      list: {
        Header: '/components/ListHeader',
        beforeList: ['/components/BulkActions'],
        afterList: ['/components/ListFooter'],
      },
    },
  },
}
```

### フィールドコンポーネント

```typescript
{
  name: 'status',
  type: 'select',
  options: ['draft', 'published'],
  admin: {
    components: {
      Field: '/components/StatusField',         // 編集ビューのフィールド
      Cell: '/components/StatusCell',           // 一覧ビューのセル
      Label: '/components/StatusLabel',         // フィールドラベル
      Description: '/components/StatusDescription', // フィールド説明
      Error: '/components/StatusError',         // エラーメッセージ
    },
  },
}
```

**UI フィールド**（データを持たない表示専用）:

```typescript
{
  name: 'refundButton',
  type: 'ui',
  admin: {
    components: {
      Field: '/components/RefundButton',
    },
  },
}
```

### パフォーマンスのベストプラクティス

1. **正しくインポートする:**

   - 管理画面: `import { Button } from '@payloadcms/ui'`
   - フロントエンド: `import { Button } from '@payloadcms/ui/elements/Button'`

2. **再レンダリングを最適化する:**

   ```tsx
   // ❌ 悪い例: フォームの変更のたびに再レンダリング
   const { fields } = useForm()

   // ✅ 良い例: 特定フィールド変更時のみ再レンダリング
   const value = useFormFields(([fields]) => fields[path])
   ```

3. **サーバーコンポーネントを優先する** - 以下の場合のみクライアントコンポーネントを使う:

   - 状態管理（useState、useReducer）
   - 副作用（useEffect）
   - イベントハンドラ（onClick、onChange）
   - ブラウザ API（localStorage、window）

4. **シリアライズするプロップを最小化する** - サーバーコンポーネントはクライアントへ送るプロップをシリアライズする

### スタイリング

```tsx
import './styles.scss'

export function MyComponent() {
  return <div className="my-component">コンテンツ</div>
}
```

```scss
// Payload の CSS 変数を使う
.my-component {
  background-color: var(--theme-elevation-500);
  color: var(--theme-text);
  padding: var(--base);
  border-radius: var(--border-radius-m);
}

// Payload の SCSS ライブラリをインポート
@import '~@payloadcms/ui/scss';

.my-component {
  @include mid-break {
    background-color: var(--theme-elevation-900);
  }
}
```

### 型安全性

```tsx
import type {
  TextFieldServerComponent,
  TextFieldClientComponent,
  TextFieldCellComponent,
  SelectFieldServerComponent,
  // ... など
} from 'payload'

export const MyField: TextFieldClientComponent = (props) => {
  // 完全に型付けされたプロップ
}
```

### インポートマップ

Payload はコンポーネントパスを解決するため `app/(payload)/admin/importMap.js` を自動生成します。

**手動で再生成する:**

```bash
payload generate:importmap
```

**カスタムの場所を設定する:**

```typescript
export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, 'src'),
      importMapFile: path.resolve(dirname, 'app', 'custom-import-map.js'),
    },
  },
})
```

## カスタムエンドポイント

```typescript
import type { Endpoint } from 'payload'
import { APIError } from 'payload'

// 認証チェックを常に行う
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

// ルートパラメータ
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

## 下書きとバージョン管理

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

// 下書きを作成
await payload.create({
  collection: 'pages',
  data: { title: '下書きページ' },
  draft: true, // 必須フィールドのバリデーションをスキップ
})

// 下書きを読み取る
const page = await payload.findByID({
  collection: 'pages',
  id: '123',
  draft: true, // 下書きがあれば返す
})
```

## フィールドタイプガード

```typescript
import {
  fieldAffectsData,
  fieldHasSubFields,
  fieldIsArrayType,
  fieldIsBlockType,
  fieldSupportsMany,
  fieldHasMaxDepth,
} from 'payload'

function processField(field: Field) {
  // フィールドがデータを持つか確認
  if (fieldAffectsData(field)) {
    console.log(field.name) // 安全にアクセスできる
  }

  // ネストフィールドを持つか確認
  if (fieldHasSubFields(field)) {
    field.fields.forEach(processField) // 安全にアクセスできる
  }

  // フィールド型の確認
  if (fieldIsArrayType(field)) {
    console.log(field.minRows, field.maxRows)
  }

  // 機能の確認
  if (fieldSupportsMany(field) && field.hasMany) {
    console.log('複数値をサポートしています')
  }
}
```

## プラグイン

### プラグインの使い方

```typescript
import { seoPlugin } from '@payloadcms/plugin-seo'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'

export default buildConfig({
  plugins: [
    seoPlugin({
      collections: ['posts', 'pages'],
    }),
    redirectsPlugin({
      collections: ['pages'],
    }),
  ],
})
```

### プラグインの作り方

```typescript
import type { Config, Plugin } from 'payload'

interface MyPluginConfig {
  collections?: string[]
  enabled?: boolean
}

export const myPlugin =
  (options: MyPluginConfig): Plugin =>
  (config: Config): Config => ({
    ...config,
    collections: config.collections?.map((collection) => {
      if (options.collections?.includes(collection.slug)) {
        return {
          ...collection,
          fields: [...collection.fields, { name: 'pluginField', type: 'text' }],
        }
      }
      return collection
    }),
  })
```

## ベストプラクティス

### セキュリティ

1. Local API に `user` を渡す場合は必ず `overrideAccess: false` を設定する
2. フィールドレベルのアクセス制御は boolean のみ返す（クエリ制約不可）
3. デフォルトは制限的なアクセスにして、段階的に権限を追加する
4. クライアントから送られたデータを信頼しない
5. ロールには `saveToJWT: true` を使ってデータベースの参照を避ける

### パフォーマンス

1. よく検索するフィールドにインデックスを付ける
2. `select` で返却フィールドを絞る
3. リレーションには `maxDepth` を設定して過剰なデータ取得を防ぐ
4. アクセス制御では非同期操作よりクエリ制約を優先する
5. コストの高い操作は `req.context` にキャッシュする

### データ整合性

1. フック内のネスト操作には必ず `req` を渡す
2. フックの無限ループ防止に context フラグを使う
3. MongoDB（レプリカセット必要）と Postgres でトランザクションを有効にする
4. データ整形には `beforeValidate` を使う
5. ビジネスロジックには `beforeChange` を使う

### 型安全性

1. スキーマ変更後は `generate:types` を実行する
2. 生成された `payload-types.ts` から型をインポートする
3. ユーザーオブジェクトを型付けする: `import type { User } from '@/payload-types'`
4. フィールドオプションには `as const` を使う
5. ランタイムの型チェックにフィールドタイプガードを使う

### コード整理

1. コレクションは別ファイルに分ける
2. アクセス制御は `access/` ディレクトリに切り出す
3. フックは `hooks/` ディレクトリに切り出す
4. よく使うパターンは再利用可能なフィールドファクトリにする
5. 複雑なアクセス制御にはコメントで意図を説明する

## よくあるハマりポイント

1. **Local API のデフォルト**: `overrideAccess: false` がないとアクセス制御がスキップされる
2. **トランザクション安全性**: フック内のネスト操作で `req` がないとアトミック性が壊れる
3. **フックのループ**: フック内の操作が同じフックを再度トリガーする
4. **フィールドアクセス**: クエリ制約は使えない、boolean のみ
5. **リレーションの深さ**: デフォルトは depth 2、ID のみにするには 0 を設定
6. **下書きのステータス**: 下書き有効時は `_status` フィールドが自動追加される
7. **型の再生成**: `generate:types` を実行するまで型は更新されない
8. **MongoDB のトランザクション**: レプリカセット設定が必要
9. **SQLite のトランザクション**: デフォルト無効、`transactionOptions: {}` で有効化
10. **Point フィールド**: SQLite では非対応

## 追加のコンテキストファイル

各トピックの詳細は `.cursor/rules/` にあるコンテキストファイルを参照してください。

### 利用可能なコンテキストファイル

1. **`payload-overview.md`** - アーキテクチャ概要と基本概念

2. **`security-critical.md`** - 重要なセキュリティパターン（⚠️ 重要）

3. **`collections.md`** - コレクション設定

4. **`fields.md`** - フィールドの種類とパターン

5. **`field-type-guards.md`** - TypeScript フィールド型ユーティリティ

6. **`access-control.md`** - 権限パターン

7. **`access-control-advanced.md`** - 高度なアクセスパターン

8. **`hooks.md`** - ライフサイクルフック

9. **`queries.md`** - データベース操作

10. **`endpoints.md`** - カスタム API エンドポイント

11. **`adapters.md`** - データベース・ストレージアダプター

12. **`plugin-development.md`** - プラグイン開発

13. **`components.md`** - カスタムコンポーネント

## 参考リンク

- ドキュメント: https://payloadcms.com/docs
- LLM コンテキスト: https://payloadcms.com/llms-full.txt
- GitHub: https://github.com/payloadcms/payload
- サンプル: https://github.com/payloadcms/payload/tree/main/examples
- テンプレート: https://github.com/payloadcms/payload/tree/main/templates
