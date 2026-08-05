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
- [ ] **スキーマ変更でテーブルを追加した場合、本番 Supabase で RLS 有効化 SQL を再実行**（新テーブルは RLS 無効で作られるため。→ 6 節）
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

## 6. 本番 DB（Supabase）と RLS

本番 DB は **Supabase の Postgres**。アプリ（Payload）は `DATABASE_URL` の**直接接続（`postgres` ロール）**で読み書きしており、**Supabase の自動生成 REST API（PostgREST）や client SDK は使っていない**。

### なぜ RLS が要るか

Supabase は `public` スキーマのテーブルに対して外部向けの Web API（PostgREST）を自動公開する。テーブルに **RLS（Row-Level Security）が無効**だと、匿名キー（anon key）を知る第三者が API 経由で全データを読み書きできてしまい、Security Advisor が **Critical（`rls_disabled_in_public`）** として検知し、通知メールが届く。

### 対処（安全・冪等）

`public` の全テーブルで RLS を**有効化**する。アプリは**テーブル所有者 `postgres` で接続**しているため、RLS を有効化しても（`FORCE ROW LEVEL SECURITY` を付けない限り）**所有者は素通り＝アプリ動作に影響しない**。ポリシーは不要（このアプリは PostgREST を使わないため、anon/authenticated は全拒否でよい）。

Supabase ダッシュボード → SQL Editor で以下を実行（何度流しても安全）:

```sql
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security;', r.tablename);
  end loop;
end $$;
```

- 確認: `select tablename, rowsecurity from pg_tables where schemaname='public';` が全て `true`。
- 反映確認: ダッシュボード → **Advisors → Security** で `rls_disabled_in_public` が消えること。
- ロールバック（万一アプリが読めなくなった場合）: `alter table public.<tablename> disable row level security;`

### 注意

- **スキーマ変更で新テーブルが増えるたびに、その新テーブルは RLS 無効で作られる**ため警告が再発する。都度、上の SQL を再実行する（→ 4 節「作業後」チェックリスト）。
- 適用対象は**本番 Supabase** のみ。ローカル開発 DB（Docker/ローカル Postgres）は Advisor 対象外。

## 7. 参考リンク

- [Payload Docs](https://payloadcms.com/docs)
- [Payload LLM Context](https://payloadcms.com/llms-full.txt)
- [Payload GitHub](https://github.com/payloadcms/payload)
- [Payload Examples](https://github.com/payloadcms/payload/tree/main/examples)
- [Payload Templates](https://github.com/payloadcms/payload/tree/main/templates)
