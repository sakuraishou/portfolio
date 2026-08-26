---
name: typescript-rules
description: このポートフォリオ（Next.js App Router + Payload CMS + React 19）の TypeScript / TSX コーディング規約。.ts / .tsx ファイルを新規作成・編集するとき、React コンポーネント・API ルート・Payload 連携コードを書くときに必ず参照する。
---

# TypeScript / React / Next.js コーディング規約

このリポジトリで `.ts` / `.tsx` を書くときのルール。**周囲のコードに合わせる**のが最優先。迷ったら既存の `src/components/Sections/*` を手本にする。

## フォーマット（Prettier が正）

`.prettierrc.json` の設定が絶対基準。手で違う書き方をしない。

- **セミコロンなし**（`semi: false`）
- **シングルクォート**（`singleQuote: true`）
- **末尾カンマは全部付ける**（`trailingComma: "all"`）
- **1 行 100 文字**（`printWidth: 100`）
- インデントは半角スペース 2

## インポート

- パスエイリアス **`@/*` → `src/*`** を使う。`@/components/...`, `@/payload.config`, `@/payload-types`。
- 相対パスは同一機能内（例: `./Hamburger`, `./About.module.scss`）に留める。
- 型のみのインポートは `import type { ... }` を使う。値とインライン混在も可（例: `import { type CSSProperties, useState } from 'react'`）。
- スタイルは `import styles from './Name.module.scss'`。

```ts
import { getPayload } from 'payload'
import config from '@/payload.config'
import Title from '@/components/UI/Title'
import type { Media, Skill } from '@/payload-types'
import styles from './Skills.module.scss'
```

## 型付け

- `tsconfig` は `strict: true`。型エラーは `npx tsc --noEmit` で潰す。
- **`any` を避ける**（ESLint で warn）。不明な入力は `unknown` で受け、型ガードで絞り込む。
- Props は **`type` で定義**（`interface` は使わない）。コンポーネント直前にローカル定義する。

```tsx
type Props = {
  children: React.ReactNode
  en?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  className?: string
}
```

- ユニオンの状態は文字列リテラル型で表す: `type SubmitStatus = 'idle' | 'success' | 'error'`。
- **生成型は `@/payload-types` から取得**する（`Media`, `Skill` など）。`payload-types.ts` は手で編集しない。
- 型ガードはユーザー定義型述語（`value is string`）で書く。

```ts
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}
```

- 未使用変数は `_` プレフィックスで握りつぶす（ESLint の `argsIgnorePattern: '^_'`）。

## React コンポーネント

- **default export の関数コンポーネント**。ファイルは `index.tsx`、関数名はフォルダ名と一致させる。

```tsx
export default function About() { /* ... */ }
```

- **Server Component が既定**。`useState` / `onClick` / `fetch` などクライアント動作が要るものだけ、ファイル先頭に `'use client'` を書く（例: `Header`, `Hamburger`, `Contact`）。
- データ取得が必要な Server Component は `async` にし、Payload Local API を使う:

```tsx
export default async function About() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { docs: tags } = await payload.find({
    collection: 'tags',
    sort: 'sort_order',
    limit: 100,
  })
  // ...
}
```

- 複数取得は `Promise.all` で並列化する（`Skills/index.tsx` 参照）。
- リストレンダリングは安定した `key`（`item.id` など。index は避ける）。
- 空表示の出し分けは三項 or `&&` で明示（`{tags.length > 0 && (...)}`）。
- className 合成はテンプレートリテラル: `` className={`${styles.title} ${className}`.trim()} ``。CSS Modules クラスは `styles.xxx` で参照。
- React 19 / Next 15 の非同期 API に注意（`await headers()`、`params` は Promise 等）。

## 小さな純粋関数

整形・整列・抽出はコンポーネント外のモジュールスコープに純粋関数として切り出す。ジェネリクスも素直に使う。

```ts
function sortByOrder<T extends { sort_order?: number | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))
}
```

## API ルート（`app/**/route.ts`）

- `NextResponse.json(data, { status })` で返す。
- リクエストボディは `unknown` 寄りの型で受け、**バリデーションしてから使う**。失敗時は早期 return + **日本語のエラーメッセージ** + 適切な HTTP ステータス。
- 環境変数は `process.env.X` から読む（直接ハードコードしない）。
- 例外は `try/catch` し、`console.error` でログしてユーザーには汎用メッセージを返す。

```ts
export async function POST(request: Request) {
  let body: ContactBody
  try {
    body = (await request.json()) as ContactBody
  } catch {
    return NextResponse.json({ error: 'JSONの形式が正しくありません' }, { status: 400 })
  }
  // バリデーション → 処理 → NextResponse.json({ ok: true }, { status: 200 })
}
```

## 変更後のチェック

- `npx tsc --noEmit`（型）
- `npm run lint`（ESLint: `next/core-web-vitals` + `next/typescript`）
- Payload のスキーマを変えたら `npm run generate:types`、管理 UI を変えたら `npm run generate:importmap`。
