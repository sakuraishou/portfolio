# Payload CMS 開発ルール（簡易版）

このファイルは、Cursor エージェントがこのリポジトリで安全かつ一貫して作業するための必須ルールをまとめたものです。  
詳細な解説・サンプルは `.cursor/context/` の各ファイルを参照してください。

## 0. 言語方針

- ユーザー向け文言、コメント、ドキュメント、コミットメッセージ、PR 説明、Cursor 上の説明は基本日本語で行う。
- 識別子・ライブラリ名・型名は英語のままでよい。
- 詳細: `.cursor/rules/project-language.mdc`

## ドキュメント保守（必須・毎回）

コードベースに変更・追加を加えたら、**同じ作業の中で**関連ドキュメントを必ず最新化する。後回しにして実態とドキュメントをずらさない。

更新対象（変更内容に応じて該当するものすべて）:

- `README.md`（セットアップ・技術スタック・公開向け説明）
- `CLAUDE.md`（全体像・構成・コマンド・規約）
- `AGENTS.md`（本ファイル。Payload バックエンドのルール）
- `.cursor/`（`rules/*.mdc`・`context/*.md`）

特に次を変えたら必ず見直す: 依存の追加/更新、コマンド/スクリプト、ディレクトリ構成、コーディング規約、ビルド/デプロイ設定、パッケージマネージャ、Node バージョン、コレクション/フィールド構成。

## 1. 最優先セキュリティルール（必須）

1. Local API に `user` を渡す場合は必ず `overrideAccess: false` を指定する。
2. フック内のネスト操作では必ず `req` を渡す。
3. フックから同一コレクションを更新する場合は `context` フラグで無限ループを防ぐ。

詳細: `.cursor/rules/security-critical.mdc`

## 2. 型安全・生成物

- TypeScript で実装し、`any` の安易な導入を避ける。
- スキーマ変更後は `pnpm generate:types` を実行する。
- 管理 UI コンポーネント変更後は `pnpm generate:importmap` を実行する。
- 変更後は `pnpm exec tsc --noEmit` で型エラーを確認する。
- パッケージマネージャは **pnpm**（`packageManager: pnpm@10.34.3`／`pnpm-lock.yaml`）。`npm` は使わない。

## 3. アクセス制御（RBAC）

- アクセス制御付きコレクションやグローバルを変更する際はロール設計を確認する。
- フィールドレベルアクセスは boolean のみ返す。
- デフォルトは制限的にし、必要に応じて権限を段階的に開放する。

## 4. 作業チェックリスト

### 作業前

- [ ] 変更対象がアクセス制御またはフックに関係するか確認
- [ ] Local API で `user` を渡す箇所を把握

### 作業後

- [ ] `pnpm exec tsc --noEmit`
- [ ] 必要なら `pnpm generate:types`
- [ ] 必要なら `pnpm generate:importmap`
- [ ] セキュリティ 3 原則（overrideAccess / req / ループ防止）を再確認
- [ ] 変更内容に応じて README.md / CLAUDE.md / AGENTS.md / .cursor を最新化

## 5. 詳細ドキュメント

- `.cursor/rules/security-critical.mdc`
- `.cursor/rules/project-language.mdc`
- `.cursor/context/payload-overview.md`
- `.cursor/context/collections.md`
- `.cursor/context/fields.md`
- `.cursor/context/field-type-guards.md`
- `.cursor/context/access-control.md`
- `.cursor/context/access-control-advanced.md`
- `.cursor/context/hooks.md`
- `.cursor/context/queries.md`
- `.cursor/context/endpoints.md`
- `.cursor/context/adapters.md`
- `.cursor/context/plugin-development.md`
- `.cursor/context/components.md`

## 6. 参考リンク

- [Payload Docs](https://payloadcms.com/docs)
- [Payload LLM Context](https://payloadcms.com/llms-full.txt)
- [Payload GitHub](https://github.com/payloadcms/payload)
- [Payload Examples](https://github.com/payloadcms/payload/tree/main/examples)
- [Payload Templates](https://github.com/payloadcms/payload/tree/main/templates)
