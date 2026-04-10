# Payload CMS カスタムコンポーネント

カスタムコンポーネントを使うと、独自の React コンポーネントに差し替えることで管理画面を完全にカスタマイズできます。インターフェースのほぼすべての部分を置き換えたり、まったく新しい機能を追加したりすることができます。

## コンポーネントの種類

カスタムコンポーネントには4つの主要な種類があります。

1. **ルートコンポーネント** - 管理画面全体に影響（ロゴ・ナビ・ヘッダー）
2. **コレクションコンポーネント** - コレクションビュー固有
3. **グローバルコンポーネント** - グローバルドキュメントビュー固有
4. **フィールドコンポーネント** - カスタムフィールドUIとセル

## カスタムコンポーネントの定義

### コンポーネントパス

コンポーネントは設定を軽量に保つため、直接インポートではなくファイルパスで定義します。

```typescript
import { buildConfig } from 'payload'

export default buildConfig({
  admin: {
    components: {
      logout: {
        Button: '/src/components/Logout#MyComponent', // 名前付きエクスポート
      },
      Nav: '/src/components/Nav', // デフォルトエクスポート
    },
  },
})
```

**コンポーネントパスのルール:**

1. パスはプロジェクトルート（または `config.admin.importMap.baseDir`）からの相対パス
2. **名前付きエクスポート**: `#ExportName` を追加するか `exportName` プロパティを使う
3. **デフォルトエクスポート**: サフィックス不要
4. ファイル拡張子は省略可能

### コンポーネント設定オブジェクト

文字列パスの代わりに設定オブジェクトを渡すこともできます。

```typescript
{
  logout: {
    Button: {
      path: '/src/components/Logout',
      exportName: 'MyComponent',
      clientProps: { customProp: 'value' },
      serverProps: { asyncData: someData },
    },
  },
}
```

**設定プロパティ:**

| プロパティ | 説明 |
| --- | --- |
| `path` | コンポーネントのファイルパス（名前付きエクスポートは `#` で指定） |
| `exportName` | 名前付きエクスポート（パスの `#` の代替） |
| `clientProps` | クライアントコンポーネント用のプロップ（シリアライズ可能である必要あり） |
| `serverProps` | サーバーコンポーネント用のプロップ（シリアライズ不可でも可） |

### ベースディレクトリの設定

```typescript
import path from 'path'
import { fileURLToPath } from 'node:url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, 'src'), // ベースディレクトリを設定
    },
    components: {
      Nav: '/components/Nav', // src/ からの相対パスになる
    },
  },
})
```

## サーバー vs クライアントコンポーネント

**すべてのコンポーネントはデフォルトで React サーバーコンポーネントです。**

### サーバーコンポーネント（デフォルト）

Local API を直接使え、非同期処理も行え、Payload の完全なインスタンスにアクセスできます。

```tsx
import React from 'react'
import type { Payload } from 'payload'

async function MyServerComponent({ payload }: { payload: Payload }) {
  const page = await payload.findByID({
    collection: 'pages',
    id: '123',
  })

  return <p>{page.title}</p>
}

export default MyServerComponent
```

### クライアントコンポーネント

インタラクティブ性・フック・状態管理などに `'use client'` ディレクティブを使います。

```tsx
'use client'
import React, { useState } from 'react'

export function MyClientComponent() {
  const [count, setCount] = useState(0)

  return <button onClick={() => setCount(count + 1)}>{count} 回クリックしました</button>
}
```

**注意:** クライアントコンポーネントはシリアライズできないプロップ（関数・クラスインスタンスなど）を受け取れません。Payload はクライアントコンポーネントに渡す際にこれらを自動的に除外します。

## デフォルトのプロップ

すべてのカスタムコンポーネントはデフォルトで以下のプロップを受け取ります。

| プロップ | 説明 | 型 |
| --- | --- | --- |
| `payload` | Payload インスタンス（Local API アクセス） | `Payload` |
| `i18n` | 国際化オブジェクト | `I18n` |
| `locale` | 現在のロケール（ローカライズが有効な場合） | `string` |

**サーバーコンポーネントの例:**

```tsx
async function MyComponent({ payload, i18n, locale }) {
  const data = await payload.find({
    collection: 'posts',
    locale,
  })

  return <div>{data.docs.length} 件の投稿</div>
}
```

**クライアントコンポーネントの例:**

```tsx
'use client'
import { usePayload, useLocale, useTranslation } from '@payloadcms/ui'

export function MyComponent() {
  // クライアントコンポーネントではフックでアクセスする
  const { getLocal, getByID } = usePayload()
  const locale = useLocale()
  const { t, i18n } = useTranslation()

  return <div>{t('myKey')}</div>
}
```

## カスタムプロップ

`clientProps` または `serverProps` を使って追加のプロップを渡します。

```typescript
{
  logout: {
    Button: {
      path: '/components/Logout',
      clientProps: {
        buttonText: 'ログアウト',
        onLogout: () => console.log('ログアウトしました'),
      },
    },
  },
}
```

コンポーネントでの受け取り:

```tsx
'use client'
export function Logout({ buttonText, onLogout }) {
  return <button onClick={onLogout}>{buttonText}</button>
}
```

## ルートコンポーネント

ルートコンポーネントは管理画面全体に影響します。

### 利用可能なルートコンポーネント

| コンポーネント | 説明 | 設定パス |
| --- | --- | --- |
| `Nav` | ナビゲーションサイドバー全体 | `admin.components.Nav` |
| `graphics.Icon` | 小さいアイコン（ナビで使用） | `admin.components.graphics.Icon` |
| `graphics.Logo` | フルロゴ（ログイン画面で使用） | `admin.components.graphics.Logo` |
| `logout.Button` | ログアウトボタン | `admin.components.logout.Button` |
| `actions` | ヘッダーのアクション（配列） | `admin.components.actions` |
| `header` | ヘッダーの上（配列） | `admin.components.header` |
| `beforeDashboard` | ダッシュボードコンテンツの前（配列） | `admin.components.beforeDashboard` |
| `afterDashboard` | ダッシュボードコンテンツの後（配列） | `admin.components.afterDashboard` |
| `beforeLogin` | ログインフォームの前（配列） | `admin.components.beforeLogin` |
| `afterLogin` | ログインフォームの後（配列） | `admin.components.afterLogin` |
| `beforeNavLinks` | ナビリンクの前（配列） | `admin.components.beforeNavLinks` |
| `afterNavLinks` | ナビリンクの後（配列） | `admin.components.afterNavLinks` |
| `settingsMenu` | 設定メニューのアイテム（配列） | `admin.components.settingsMenu` |
| `providers` | カスタム React コンテキストプロバイダー | `admin.components.providers` |
| `views` | カスタムビュー（ダッシュボードなど） | `admin.components.views` |

### 例: カスタムロゴ

```typescript
export default buildConfig({
  admin: {
    components: {
      graphics: {
        Logo: '/components/Logo',
        Icon: '/components/Icon',
      },
    },
  },
})
```

```tsx
// components/Logo.tsx
export default function Logo() {
  return <img src="/logo.png" alt="ブランドロゴ" width={200} />
}
```

### 例: ヘッダーアクション

```typescript
export default buildConfig({
  admin: {
    components: {
      actions: ['/components/ClearCacheButton', '/components/PreviewButton'],
    },
  },
})
```

```tsx
// components/ClearCacheButton.tsx
'use client'
export default function ClearCacheButton() {
  return (
    <button
      onClick={async () => {
        await fetch('/api/clear-cache', { method: 'POST' })
        alert('キャッシュをクリアしました！')
      }}
    >
      キャッシュクリア
    </button>
  )
}
```

## コレクションコンポーネント

コレクションコンポーネントはコレクションのビューに固有です。

```typescript
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    components: {
      // 編集ビューのコンポーネント
      edit: {
        PreviewButton: '/components/PostPreview',
        SaveButton: '/components/CustomSave',
        SaveDraftButton: '/components/CustomSaveDraft',
        PublishButton: '/components/CustomPublish',
      },

      // 一覧ビューのコンポーネント
      list: {
        Header: '/components/PostsListHeader',
        beforeList: ['/components/ListFilters'],
        afterList: ['/components/ListFooter'],
      },
    },
  },
  fields: [
    // ...
  ],
}
```

## グローバルコンポーネント

コレクションコンポーネントと同様ですが、グローバルドキュメント用です。

```typescript
import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: {
    components: {
      edit: {
        PreviewButton: '/components/SettingsPreview',
        SaveButton: '/components/SettingsSave',
      },
    },
  },
  fields: [
    // ...
  ],
}
```

## フィールドコンポーネント

編集ビューと一覧ビューでのフィールドの表示をカスタマイズします。

### フィールドコンポーネント（編集ビュー）

```typescript
{
  name: 'status',
  type: 'select',
  options: ['draft', 'published'],
  admin: {
    components: {
      Field: '/components/StatusField',
    },
  },
}
```

```tsx
// components/StatusField.tsx
'use client'
import { useField } from '@payloadcms/ui'
import type { SelectFieldClientComponent } from 'payload'

export const StatusField: SelectFieldClientComponent = ({ path, field }) => {
  const { value, setValue } = useField({ path })

  return (
    <div>
      <label>{field.label}</label>
      <select value={value} onChange={(e) => setValue(e.target.value)}>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
```

### セルコンポーネント（一覧ビュー）

```typescript
{
  name: 'status',
  type: 'select',
  options: ['draft', 'published'],
  admin: {
    components: {
      Cell: '/components/StatusCell',
    },
  },
}
```

```tsx
// components/StatusCell.tsx
import type { SelectFieldCellComponent } from 'payload'

export const StatusCell: SelectFieldCellComponent = ({ data, cellData }) => {
  const isPublished = cellData === 'published'

  return (
    <span
      style={{
        color: isPublished ? 'green' : 'orange',
        fontWeight: 'bold',
      }}
    >
      {cellData}
    </span>
  )
}
```

### UI フィールド（表示専用）

データに影響させずにカスタム UI を追加するための特殊なフィールド型です。

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

```tsx
// components/RefundButton.tsx
'use client'
import { useDocumentInfo } from '@payloadcms/ui'

export default function RefundButton() {
  const { id } = useDocumentInfo()

  return (
    <button
      onClick={async () => {
        await fetch(`/api/orders/${id}/refund`, { method: 'POST' })
        alert('返金処理が完了しました')
      }}
    >
      返金処理
    </button>
  )
}
```

## フックの使い方

Payload はクライアントコンポーネント用に多くの React フックを提供しています。

```tsx
'use client'
import {
  useAuth,           // 現在のユーザー
  useConfig,         // Payload 設定（クライアント安全）
  useDocumentInfo,   // 現在のドキュメント情報（id・slug など）
  useField,          // フィールドの値と setValue
  useForm,           // フォームの状態とディスパッチ
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

**重要:** これらのフックは管理画面コンテキスト内のクライアントコンポーネントでのみ動作します。

## Payload 設定へのアクセス

**サーバーコンポーネントの場合:**

```tsx
async function MyServerComponent({ payload }) {
  const { config } = payload
  return <div>{config.serverURL}</div>
}
```

**クライアントコンポーネントの場合:**

```tsx
'use client'
import { useConfig } from '@payloadcms/ui'

export function MyClientComponent() {
  const { config } = useConfig() // クライアント安全な設定
  return <div>{config.serverURL}</div>
}
```

**重要:** クライアントコンポーネントはシリアライズ可能なバージョンの設定を受け取ります（関数・バリデーションなどは除外されます）。

## フィールド設定へのアクセス

**サーバーコンポーネント:**

```tsx
import type { TextFieldServerComponent } from 'payload'

export const MyFieldComponent: TextFieldServerComponent = ({ field }) => {
  return <div>フィールド名: {field.name}</div>
}
```

**クライアントコンポーネント:**

```tsx
'use client'
import type { TextFieldClientComponent } from 'payload'

export const MyFieldComponent: TextFieldClientComponent = ({ clientField }) => {
  // clientField はシリアライズできないプロップが除外されている
  return <div>フィールド名: {clientField.name}</div>
}
```

## 翻訳（i18n）

**サーバーコンポーネント:**

```tsx
import { getTranslation } from '@payloadcms/translations'

async function MyServerComponent({ i18n }) {
  const translatedTitle = getTranslation(myTranslation, i18n)
  return <p>{translatedTitle}</p>
}
```

**クライアントコンポーネント:**

```tsx
'use client'
import { useTranslation } from '@payloadcms/ui'

export function MyClientComponent() {
  const { t, i18n } = useTranslation()

  return (
    <div>
      <p>{t('namespace:key', { variable: 'value' })}</p>
      <p>言語: {i18n.language}</p>
    </div>
  )
}
```

## スタイリング

### CSS 変数の使い方

```tsx
import './styles.scss'

export function MyComponent() {
  return <div className="my-component">カスタムコンポーネント</div>
}
```

```scss
// styles.scss
.my-component {
  background-color: var(--theme-elevation-500);
  color: var(--theme-text);
  padding: var(--base);
  border-radius: var(--border-radius-m);
}
```

### Payload の SCSS をインポート

```scss
@import '~@payloadcms/ui/scss';

.my-component {
  @include mid-break {
    background-color: var(--theme-elevation-900);
  }
}
```

## よく使うパターン

### 条件付きフィールドの表示

```tsx
'use client'
import { useFormFields } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

export const ConditionalField: TextFieldClientComponent = ({ path }) => {
  const showField = useFormFields(([fields]) => fields.enableFeature?.value)

  if (!showField) return null

  return <input type="text" />
}
```

### API からのデータ取得

```tsx
'use client'
import { useState, useEffect } from 'react'

export function DataLoader() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/custom-data')
      .then((res) => res.json())
      .then(setData)
  }, [])

  return <div>{JSON.stringify(data)}</div>
}
```

### サーバーコンポーネントでの Local API 使用

```tsx
import type { Payload } from 'payload'

async function RelatedPosts({ payload, id }: { payload: Payload; id: string }) {
  const post = await payload.findByID({
    collection: 'posts',
    id,
    depth: 0,
  })

  const related = await payload.find({
    collection: 'posts',
    where: {
      category: { equals: post.category },
      id: { not_equals: id },
    },
    limit: 5,
  })

  return (
    <div>
      <h3>関連投稿</h3>
      <ul>
        {related.docs.map((doc) => (
          <li key={doc.id}>{doc.title}</li>
        ))}
      </ul>
    </div>
  )
}

export default RelatedPosts
```

## パフォーマンスのベストプラクティス

### 1. クライアントバンドルサイズを最小化する

```tsx
// ❌ 悪い例: パッケージ全体をインポート
'use client'
import { Button } from '@payloadcms/ui'

// ✅ 良い例: フロントエンドではツリーシェイク可能なインポート
import { Button } from '@payloadcms/ui/elements/Button'
```

**ルール:** 管理画面 UI では `@payloadcms/ui` からインポート。フロントエンドでは特定のパスを使う。

### 2. 再レンダリングを最適化する

```tsx
// ❌ 悪い例: フォームのあらゆる変更で再レンダリング
'use client'
import { useForm } from '@payloadcms/ui'

export function MyComponent() {
  const { fields } = useForm()
  // 任意のフィールド変更で再レンダリング
}

// ✅ 良い例: 特定フィールドの変更時のみ再レンダリング
;('use client')
import { useFormFields } from '@payloadcms/ui'

export function MyComponent({ path }) {
  const value = useFormFields(([fields]) => fields[path])
  // このフィールドの変更時のみ再レンダリング
}
```

### 3. できるだけサーバーコンポーネントを使う

```tsx
// ✅ 良い例: クライアントに JavaScript が送られない
async function PostCount({ payload }) {
  const { totalDocs } = await payload.find({
    collection: 'posts',
    limit: 0,
  })

  return <p>{totalDocs} 件の投稿</p>
}

// クライアントコンポーネントが必要な場合:
// - 状態管理（useState、useReducer）
// - 副作用（useEffect）
// - イベントハンドラ（onClick、onChange）
// - ブラウザ API（localStorage、window）
```

### 4. React のベストプラクティス

- コストの高いコンポーネントには React.memo() を使う
- リストには適切な key プロップを実装する
- レンダリング内でのインライン関数定義を避ける
- 非同期処理には Suspense バウンダリを使う

## インポートマップ

Payload はすべてのコンポーネントパスを解決するインポートマップを `app/(payload)/admin/importMap.js` に生成します。

**手動で再生成する:**

```bash
payload generate:importmap
```

**場所を変更する:**

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

## 型安全性

コンポーネントには Payload の TypeScript 型を使います。

```tsx
import type {
  TextFieldServerComponent,
  TextFieldClientComponent,
  TextFieldCellComponent,
} from 'payload'

export const MyFieldComponent: TextFieldServerComponent = (props) => {
  // 完全に型付けされたプロップ
}
```

## トラブルシューティング

### "useConfig is undefined" などのフックエラー

**原因:** Payload パッケージ間のバージョンが合っていない。

**解決策:** すべての `@payloadcms/*` パッケージを同じバージョンに固定する:

```json
{
  "dependencies": {
    "payload": "3.0.0",
    "@payloadcms/ui": "3.0.0",
    "@payloadcms/richtext-lexical": "3.0.0"
  }
}
```

### コンポーネントが読み込まれない

1. ファイルパスが正しいか確認する（baseDir からの相対パス）
2. 名前付きエクスポートの構文を確認する: `/path/to/file#ExportName`
3. `payload generate:importmap` を実行して再生成する
4. コンポーネントファイルの TypeScript エラーを確認する

## 参考リンク

- [カスタムコンポーネントドキュメント](https://payloadcms.com/docs/custom-components/overview)
- [ルートコンポーネント](https://payloadcms.com/docs/custom-components/root-components)
- [カスタムビュー](https://payloadcms.com/docs/custom-components/custom-views)
- [React フック](https://payloadcms.com/docs/admin/react-hooks)
- [カスタム CSS](https://payloadcms.com/docs/admin/customizing-css)
