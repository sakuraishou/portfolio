# CLAUDE.md

このリポジトリで Claude Code が作業するためのガイドです。
（Payload バックエンド固有のルールは [AGENTS.md](AGENTS.md) と `.cursor/` に詳しくあります。本ファイルはプロジェクト全体像とフロントエンド規約を扱います。）

## 言語方針

- ユーザー向け文言・コメント・ドキュメント・コミットメッセージ・PR 説明・チャット応答は**日本語**で行う。
- 識別子・ライブラリ名・型名は英語のままでよい。

## ドキュメント保守（重要）

コードベースに変更・追加を加えたら、**同じ作業の中で**関連ドキュメントを必ず最新化する。後回しにして実態とドキュメントをずらさない。「毎回しっかり」書き直すこと。

更新対象（変更内容に応じて該当するものすべて）:

- `README.md` … セットアップ手順・技術スタック・公開向けの説明
- `CLAUDE.md`（本ファイル）… 全体像・構成・コマンド・規約・注意点
- `AGENTS.md` … Payload バックエンドのルール（Cursor 向け）
- `.cursor/`（`rules/*.mdc`・`context/*.md`）… Cursor 用ルール・詳細ドキュメント

特に次を変えたら必ずドキュメントを見直す: **依存の追加/更新、コマンド/スクリプト、ディレクトリ構成、コーディング規約、ビルド/デプロイ設定、パッケージマネージャ、Node バージョン、新しい Skill**。

## プロジェクト概要

Next.js（App Router）+ Payload CMS で構築した個人ポートフォリオサイト。
公開ページのトップは 1 ページ構成（FirstView / About / Skills / Works / Contact）で、コンテンツは Payload CMS（Postgres）で管理する。トップ全体は「桜井 翔という"製品"の仕様書（スペックシート）」をコンセプトに、型番・key-value・連番・等幅ラベルで統一している。
Works の各案件は詳細ページ `/works/[id]`（ケーススタディ：課題 → 技術選定・設計判断 → 工夫 → 結果）を持つ。
加えて、人柄・マインドを「取扱説明書（オーナーズマニュアル）」風に見せる特設ページ `/manual` を持つ（GSAP 演出・SVG グラフ中心の静的コンテンツ。Payload 非依存）。

## 技術スタック

- **フレームワーク**: Next.js 15.4（App Router）
- **CMS**: Payload CMS 3.78（DB アダプタ: `@payloadcms/db-postgres`）
- **言語**: TypeScript 5.7（`strict: true`）
- **UI**: React 19
- **スタイル**: SCSS Modules（`sass`）
- **フォント**: Google Fonts を `layout.tsx` の `<link>` で読込。**日本語＝Zen Kaku Gothic New / 見出し英字＝Fraunces / ラベル・データ英字（等幅）＝IBM Plex Mono** の3書体（`@include display` / `@include mono`。詳細は `/scss-rules`・`/design-rules`）。
- **アニメーション**: GSAP（`gsap` / React 用に `@gsap/react` の `useGSAP`。トップ MV の登場演出や `/manual`（`ScrollTrigger` 含む）で採用）
- **メール送信**: nodemailer（お問い合わせフォーム）
- **テスト**: Playwright（e2e）※ 現状テストは未整備
- **ランタイム**: Node.js 24（Docker イメージ `node:24-*`）
- **パッケージ管理**: **pnpm**（`pnpm-lock.yaml`／`packageManager: pnpm@10.34.3`）。Docker も pnpm でインストール。`.npmrc` で `node-linker=hoisted`（Next standalone 互換のためフラット構成）。

## ディレクトリ構成

```
src/
├── app/
│   ├── (frontend)/          # 公開ページ（route group）
│   │   ├── _styles/         # SCSS の土台: _variables / _mixins / index
│   │   ├── layout.tsx       # <html> ルート・メタデータ・フォント読込
│   │   ├── page.tsx         # トップページ（各 Section を合成）
│   │   ├── styles.scss      # グローバル CSS（リセット・base・ユーティリティ）
│   │   ├── not-found.tsx    # 404
│   │   ├── works/[id]/      # Works 詳細（ケーススタディ）ページ /works/[id]
│   │   └── manual/          # 「取扱説明書」風プロフィール特設ページ（/manual・GSAP 演出）
│   ├── (payload)/           # Payload 管理画面 + API（route group）
│   └── api/contact/route.ts # お問い合わせ送信 API（nodemailer）
├── collections/             # Payload コレクション定義
├── components/
│   ├── Layout/              # Header / Footer
│   ├── Sections/            # FirstView / About / Skills / Works / Contact
│   ├── Torisetsu/           # 「取扱説明書」特設ページの章（Cover / Features / Usage / … / Warranty）+ data.ts
│   └── UI/                  # 汎用 UI（Title / DeviceShowcase〔Works の端末ショーケース〕など）
├── payload.config.ts        # Payload 設定
└── payload-types.ts         # 自動生成型（手で編集しない）
```

- コンポーネントは `components/<分類>/<Name>/index.tsx` + `<Name>.module.scss` を 1 セットで配置する。
- 画像実体は `/media`（Payload アップロード、gitignore 済み）と `public/assets/`（静的画像）に分かれる。

## よく使うコマンド

> ローカルで pnpm を使う場合は corepack を有効化しておく（`corepack enable`）。`packageManager` フィールドのバージョンが使われる。

| 目的 | コマンド |
|------|----------|
| 開発（Docker・推奨） | `docker compose up app` |
| 開発（ローカル） | `pnpm dev` |
| ビルド | `pnpm build` |
| Lint | `pnpm lint` |
| 型チェック | `pnpm exec tsc --noEmit` |
| Payload 型生成（スキーマ変更後） | `pnpm generate:types` |
| 管理 UI 変更後の importmap 生成 | `pnpm generate:importmap` |
| E2E テスト（Playwright） | `pnpm test:e2e` |
| メディア同期（VPS→ローカル） | `docker compose --profile sync run --rm sync-media` |

## コーディング規約

詳細ルールは **Skill** にまとめてある。該当ファイルを編集するときは必ず参照すること。

- **TypeScript / React / Next.js**: `/typescript-rules`（`.claude/skills/typescript-rules/`）
- **SCSS / CSS Modules**: `/scss-rules`（`.claude/skills/scss-rules/`）

要点だけ先に挙げる:

- Prettier 設定が正（`semi: false` / `singleQuote` / `trailingComma: all` / `printWidth: 100`）。
- パスエイリアスは `@/*` → `src/*`。
- Server Component が既定。状態・イベントが要るものだけ先頭に `'use client'`。
- 生成型は `import type { ... } from '@/payload-types'` から取得する。

## Payload バックエンドの作業

コレクション・フック・アクセス制御・クエリ等を触るときは [AGENTS.md](AGENTS.md) と `.cursor/context/`・`.cursor/rules/` を参照する。特にセキュリティ 3 原則（Local API の `overrideAccess: false` / フックでの `req` 受け渡し / `context` による無限ループ防止）を厳守。

## 重要な注意点

- **機密ファイルは読まない**: `.env` / `.env.*` / `*.pem` / 鍵・認証情報は `.claude/settings.json` の `permissions.deny` で読み込み禁止にしてある。
- **`payload-types.ts` は自動生成物**。手で編集せず、スキーマ変更後に `pnpm generate:types` で再生成する。
- **`sync-media` はファイルのみ同期する**（rsync）。DB（Postgres）のメディアレコードは同期しないため、ローカル DB と実ファイルがずれると管理画面・フロントで画像が壊れて見えることがある。
- **依存が壊れたとき**: `node_modules` は匿名ボリューム。Payload が 500（`fast-copy/dist` 不足等）になったら `docker compose down -v` でボリュームを捨ててから再起動する。
