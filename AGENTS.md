# AGENTS.md — プロジェクトガイド

このリポジトリで作業する AI エージェント（Claude Code / Cursor 等）共通のガイド。
`CLAUDE.md` は本ファイルへの参照（`@AGENTS.md`）のみ。ツール別の使い分けは「AI 設定ファイルの構成」を参照。

## 言語方針

- ユーザー向け文言・コメント・ドキュメント・コミットメッセージ・PR 説明・チャット応答は**日本語**で行う。
- 識別子・ライブラリ名・型名は英語のままでよい。

## AI 設定ファイルの構成（正本ルール）

| 場所 | 役割 |
|---|---|
| `AGENTS.md`（本ファイル） | **正本**。全体像・規約・Payload ルールのすべて |
| `CLAUDE.md` | `@AGENTS.md` の参照のみ（内容を書かない） |
| `.claude/skills/` | コーディング規約スキルの**正本**（typescript-rules / scss-rules / design-rules） |
| `.claude/agents/` | Claude Code のサブエージェント。`qa`＝品質チェック／`visitor-tester`＝閲覧者目線の確認（どちらも**読み取り専用・報告のみ**。DB 書き込みとお問い合わせ送信は禁止）／`works-writer`＝別プロジェクトを読んで Works に登録・更新／`works-screenshot`＝案件の画面を撮影して Works の PC・SP 画像に登録（対象案件の画像と Media だけ）。`works-writer` と `works-screenshot` は**本番 DB に書き込む**ため、バックアップ必須・削除禁止 |
| `.agents/skills/` | `.claude/skills/` への **symlink**（実体を置かない。二重管理でドリフトした事故があるため） |
| `.cursor/rules/*.mdc` | Cursor が自動適用する補助ルール（security-critical＝§セキュリティの詳細版） |
| `.cursor/context/*.md` | Payload の詳細リファレンス（ツール非依存。§詳細ドキュメント参照） |
| `_archive/`（git 追跡外） | 完了した作業ドキュメント・データ更新パッチのローカルバックアップ |

## ドキュメント保守（必須・毎回）

コードベースに変更・追加を加えたら、**同じ作業の中で**関連ドキュメントを必ず最新化する。後回しにして実態とドキュメントをずらさない。

更新対象: `README.md`（公開向け）／ `AGENTS.md`（本ファイル）／ `.claude/skills/`（規約スキル）／ `.cursor/`。
特に次を変えたら必ず見直す: **依存の追加/更新、コマンド/スクリプト、ディレクトリ構成、コーディング規約、ビルド/デプロイ設定、パッケージマネージャ、Node バージョン、コレクション/フィールド構成、新しい Skill**。

## プロジェクト概要

Next.js（App Router）+ Payload CMS で構築した個人ポートフォリオサイト。
公開ページのトップは 1 ページ構成（FirstView / About / Skills / Works / Contact）で、コンテンツは Payload CMS（Postgres）で管理する。トップ全体は「桜井 翔という"製品"の仕様書（スペックシート）」をコンセプトに、型番・key-value・連番・等幅ラベルで統一している。

- Works の各案件は詳細ページ `/works/[id]` を持つ。ケーススタディの章は Payload の `caseSections`（任意順の配列）で組み立て、未登録の案件は固定4項目（課題・背景 → 技術選定・設計判断 → 工夫 → 結果）へフォールバックする。
- カードと詳細には案件種別（CASE STUDY／SITE WORK）と状態（開発中／本番稼働中 等）を表示する。一覧は種別で絞り込みできる（`?type=` クエリ + `data-filter` 属性の CSS 切替。ページ遷移しない）。
- Skills の各行はホバー（PC）／タップ（SP）で説明と「この技術を使った実績」リンク（Projects の `skills` relationship の逆引き）を表示する。
- 人柄・マインドは「取扱説明書」風の特設ページ `/manual`（GSAP 演出・静的コンテンツ・Payload 非依存）。

## 技術スタック

- **フレームワーク**: Next.js 16.3（App Router。dev / build とも Turbopack が既定）
- **CMS**: Payload CMS 3.88（DB アダプタ: `@payloadcms/db-postgres`。管理画面の日本語化に `@payloadcms/translations` を直接依存で使用）
- **言語**: TypeScript 6.0（`strict: true`。7 系は typescript-eslint が未対応のため見送り）
- **UI**: React 19
- **スタイル**: SCSS Modules（`sass`）。**全 SCSS への自動注入（prependData）は廃止済み** — 変数・mixin を使うファイルは必ず明示的に `@use` する（詳細は `/scss-rules`）
- **フォント**: Google Fonts を `layout.tsx` の `<link>` で読込。**日本語＝Zen Kaku Gothic New / 見出し英字＝Fraunces / ラベル・データ英字（等幅）＝IBM Plex Mono** の3書体（`@include display` / `@include mono`。詳細は `/scss-rules`・`/design-rules`）
- **アニメーション**: GSAP（`@gsap/react` の `useGSAP` + `ScrollTrigger`。トップ MV・全セクションのスクロール演出（後述の ScrollFX）・`/manual`）
- **メール送信**: nodemailer（お問い合わせフォーム → `/api/contact`）
- **アクセス解析**: Google Analytics 4（`@next/third-parties/google`。`NODE_ENV=production` かつ `NEXT_PUBLIC_GA_ID` がある時のみ有効）
- **テスト**: Playwright（e2e）。`tests/e2e/` に主要導線（トップ表示・一覧→詳細→戻る・絞り込み・404・/manual）の回帰テストあり。ホスト側で実行（初回のみ `npx playwright install chromium`）。起動中の開発サーバーを再利用する
- **Lint**: ESLint 9（`pnpm lint` = `eslint .`。Next 16 で `next lint` は廃止。設定は `eslint.config.mjs` の flat config）
- **ランタイム**: Node.js 24（現行 LTS。Docker イメージ `node:24-*`）
- **パッケージ管理**: **pnpm 11**（`packageManager: pnpm@11.24.0`）。ビルドスクリプト許可・公開直後パッケージの除外は `pnpm-workspace.yaml`（`allowBuilds` / `minimumReleaseAgeExclude`）で管理し、**Dockerfile にも COPY が必要**。`.npmrc` で `node-linker=hoisted`（Next standalone 互換）

## ディレクトリ構成

```
src/
├── app/
│   ├── (frontend)/          # 公開ページ（route group）
│   │   ├── _styles/         # SCSS の土台: _variables / _mixins / index
│   │   ├── layout.tsx       # <html> ルート・メタデータ・フォント読込
│   │   ├── page.tsx         # トップページ（各 Section を合成。?type= を Works へ渡す）
│   │   ├── styles.scss      # グローバル CSS（リセット・base・ユーティリティ）
│   │   ├── not-found.tsx    # 404
│   │   ├── works/[id]/      # Works 詳細（ケーススタディ）ページ
│   │   └── manual/          # 「取扱説明書」特設ページ（GSAP 演出）
│   ├── (payload)/           # Payload 管理画面 + API（route group）
│   └── api/contact/route.ts # お問い合わせ送信 API（nodemailer）
├── collections/             # Payload コレクション定義
├── lib/                     # 画面をまたぐ共有ロジック（projects.ts＝Works の取得・整列・表示ラベル）
├── components/
│   ├── Layout/              # Header / Footer
│   ├── Sections/            # FirstView / About / Skills / Works（+FilterTabs）/ Contact
│   ├── Torisetsu/           # 「取扱説明書」の章コンポーネント + data.ts
│   └── UI/                  # 汎用 UI（Title / DeviceShowcase / ScrollFX / BootSequence など）
├── payload.config.ts        # Payload 設定
└── payload-types.ts         # 自動生成型（手で編集しない）
tests/e2e/                   # Playwright の E2E テスト
```

- コンポーネントは `components/<分類>/<Name>/index.tsx` + `<Name>.module.scss` を 1 セットで配置する。
- Works 一覧と詳細の**並び順は必ず `lib/projects.ts` の `sortProjects` を通す**（代表案件 `isFeatured` → `sort_order` 昇順）。ずれると詳細の PREV／NEXT が食い違う。
- 画像実体は `/media`（Payload アップロード、gitignore 済み）と `public/assets/`（静的画像）に分かれる。

## よく使うコマンド

| 目的 | コマンド |
|------|----------|
| 開発（Docker・推奨） | `docker compose up app` |
| ビルド | `pnpm build`（※ dev サーバー稼働中に同じコンテナで実行しない → 注意点参照） |
| Lint | `pnpm lint` |
| 型チェック | `pnpm exec tsc --noEmit` |
| Payload 型生成（スキーマ変更後） | `pnpm generate:types` |
| 管理 UI 変更後の importmap 生成 | `pnpm generate:importmap` |
| E2E テスト（Playwright・ホスト側） | `pnpm test:e2e`（pnpm 無しなら `npx playwright test`） |
| メディア同期（VPS→ローカル） | `docker compose --profile sync run --rm sync-media` |

> pnpm 系コマンドはコンテナ内実行が確実: `docker compose exec app pnpm <script>`

## コーディング規約

詳細ルールは **Skill**（`.claude/skills/`）にまとめてある。該当ファイルを編集するときは必ず参照すること。

- **TypeScript / React / Next.js**: `/typescript-rules`
- **SCSS / CSS Modules**: `/scss-rules`
- **新規 UI のデザイン**: `/design-rules`

（規約の内容はスキルが正本。ここには書かない）

### トップのスクロール演出（ScrollFX）

トップページの出現・パララックス演出は、`page.tsx` に 1 つだけ置く client ドライバ `components/UI/ScrollFX` が担う。各セクション（**Server Component のまま**でよい）は **`data-*` 属性を付けるだけ**で演出が乗る。

- `data-reveal` … ビューポート進入時に出現。値で動きを選ぶ（`REVEAL_VARIANTS`）: 値なし＝ピントが合う（ぼかし＋僅かな拡大が戻る）／`"fade"`＝透明度のみ（大きいブロック、**読む・入力するブロック**＝About の本文段落・Contact のフォーム項目。ぼかしで読めない時間を作らない）／`"flip"`＝タイルが横回転で裏返る（Skills のマス）／`"mask"`＝横から切り抜くように開き、中の画像が寄りから落ち着く（About の写真）。**「下から上がるだけ」の演出は使わない**（オーナー判断）。
- `data-title-*` … `UI/Title`（`no` 指定版）が自動で付ける。罫線が伸びる → 連番ラベルがデコード → アクセント色の帯が走り抜けて見出しが出る。
- `data-scramble` … 進入時に、記号（英数字は半角記号・日本語は全角カタカナ・**数字だけの値は数字を含まない記号** `#*/<>_-+=`＝途中に本物らしい番号・件数が出ないように）から本来の文字へデコードする。**中身がテキストだけの要素に付ける**（子要素は消える）。文字セットは `ScrollFX/scramble.ts`。
- `data-depth`（`data-depth-pc` / `data-depth-sp`）… Works 一覧の `DeviceShowcase` が自動で付ける。スクロールに同期して PC 枠が奥から起き上がり、スマホが逆方向に流れる。枠より縦長の画像は上→下へ送られる。
- `data-parallax` … 装飾要素向けの控えめなパララックス。`data-parallax-speed`（yPercent・既定 14）/ `data-parallax-anchor="top"`。
- FirstView は ScrollFX とは別に、自前のタイムラインで「仕様書の起動シーケンス」（トンボ → 型番デコード → 見出しが奥から起き上がりつつ Fraunces の `wght` が細→太へ → カードが開いてスキャン → 値デコード）を流す。Fraunces は `wght` 300..700 の可変範囲で読み込んでいる（`layout.tsx`）。
  - **SSR の完成形のチラ見え対策**: `layout.tsx` の `BOOT_SCRIPT` が、reduced-motion でなければ描画前に `<html data-fx>` を付ける（ローディングの有無とは無関係・全ページ）。`FirstView.module.scss` はこの印があり、かつ section に `data-fx-ready` が無い間だけ、演出対象（透かし・トンボ・型番・見出し・サブ・スペック・経歴行・SCROLL）を `visibility: hidden` にする。JS は同じ要素を `autoAlpha: 0` で隠し終えたら `data-fx-ready` を付けて CSS の非表示を外す（以降は GSAP だけが表示を握る）。JS が来ないときの保険として、CSS アニメーションで 6 秒後に visible に戻す。**演出対象を増やしたら、JS の初期 `gsap.set` と CSS のセレクタの両方に足す**。先に隠す要素の出現は `from` ではなく終点を明示した `fromTo` で書く（隠した状態を「現在値」として読まれ 0→0 になるため）。
- 使っている GSAP プラグイン: `ScrollTrigger` / `ScrambleTextPlugin` / `SplitText`（いずれも gsap 本体に同梱。追加パッケージ不要）。
- **途中位置から開いた場合**（詳細 → 一覧へ戻る・リロード・ハッシュ直リンク）: Next 16 は Link のハッシュスクロールが自前のスクロール復元と競合するため、ScrollFX が `behavior: 'instant'` でハッシュ位置へジャンプ → 画面内の要素は即時表示 → 復元ストーム後に一度だけ再補正、という流れで処理する（2026-08 実装。E2E で回帰確認）。`scroll-behavior: smooth` 前提の実装に変えないこと。
- **Works の絞り込み**: FilterTabs は `#works` の `data-filter` を書き換えるだけでページ遷移しない。カード位置が大きく動くため、ScrollFX が `data-filter` を MutationObserver で監視し、変わったら `ScrollTrigger.refresh()`（通過済みのカードは通常どおり出現）→ 1 秒後に画面内の取り残しを `revealHiddenInView` で出す。これが無いと、それまで非表示だったカードが古いトリガー位置のまま opacity:0 で残る（2026-10 修正）。
- 注意: reveal は出現後に inline transform を `clearProps` で除去するため、**ベース／ホバーで `transform` に依存する要素には `data-reveal` を付けない**（親や別要素に付ける）。中央寄せ要素へのパララックスは `xPercent/yPercent` を併用する（`FirstView` の透かし参照）。
- `prefers-reduced-motion: reduce` 時は全演出を無効化し、静止状態で表示する。

### トップ初回のローディング（BootSequence）

トップを**同じタブのセッションで最初に開いたときだけ**、「仕様書 No.001 の起動シーケンス」を約 3 秒（実質 2.4 秒＋パネルが割れる 0.8 秒）再生する。実装は `components/UI/BootSequence/`（`boot.ts`＝判定・連携、`index.tsx`＝演出）。

- **出すかどうかは描画前に決める**: `layout.tsx` の `<head>` のインラインスクリプト（`BOOT_SCRIPT`）が条件を満たすときだけ `<html data-boot="play">` を付け、CSS はこの属性があるときだけオーバーレイを表示する（ちらつき・ハイドレーション不一致を避けるため。`<html>` に `suppressHydrationWarning` を付けているのはこのため）。再生済みは `sessionStorage`（`portfolio:boot:v1`）に記録。
- **出さない条件**: トップ（`/`）以外／URL にハッシュあり（`/#works` へ戻る導線・直リンク）／`prefers-reduced-motion: reduce`／再生済み／`sessionStorage` が使えない（例外は握りつぶして出さない側）／**`navigator.webdriver`（Playwright の E2E・撮影ツール）**。別ページから Link でトップへ来た場合もスクリプトは再実行されないので出ない。目視で確かめるときは Playwright の `addInitScript` で `navigator.webdriver` を false にする。
- **流れ**: トンボ → ブートログのデコード＋`000→100` の桁リール＋目盛りの進捗バー → 畳んで Fraunces の `No.001` が太さを変えて締まる → 中央に罫線 → パネルが上下に割れ（裏のオレンジが追う）FirstView が現れる。タップ／クリック／キー／ホイールで締めへスキップ（オーバーレイ自体は `pointer-events: none`、入力は window で拾う＝クリックは下へ素通しする）。
- **FirstView との連携**: パネルが割れ始めた瞬間に `releaseBoot()` が `boot:done` イベントを出し、FirstView は `waitForBoot()` でそれを待ってから起動シーケンスを始める（ローディングが無ければ即開始。取りこぼしても 6 秒で開始）。
- **固まらない保険**: 表示中は `html[data-boot]` で `overflow: hidden`（スクロール停止）。JS が来ない場合は CSS アニメーションで 4.5 秒までに消え、インラインスクリプトのタイマーが属性を外す。JS が引き継ぐと `data-boot="run"` になり保険は止まる。マウントが大きく遅れた（開発時の初回コンパイル等）ときは演出せずに抜ける。JS 側にも 7 秒の上限あり。終了時に属性を外し `ScrollTrigger.refresh()`。
- ローディングの文言は E2E の `getByText`（部分一致・大文字小文字無視）に引っかからないようにする（例: `Web / Product Engineer` を含めない。オーバーレイは非表示でも DOM に残るため）。

## Payload 開発ルール

### 最優先セキュリティルール（必須）

1. Local API に `user` を渡す場合は必ず `overrideAccess: false` を指定する。
2. フック内のネスト操作では必ず `req` を渡す。
3. フックから同一コレクションを更新する場合は `context` フラグで無限ループを防ぐ。

詳細: `.cursor/rules/security-critical.mdc`

### 型安全・生成物

- `any` の安易な導入を避ける。
- スキーマ変更後は `pnpm generate:types`、管理 UI 変更後は `pnpm generate:importmap`。
- 変更後は `pnpm exec tsc --noEmit` で確認する。

### アクセス制御（RBAC）

- アクセス制御付きコレクションを変更する際はロール設計を確認する。
- フィールドレベルアクセスは boolean のみ返す。
- デフォルトは制限的にし、必要に応じて段階的に開放する。

### 作業チェックリスト

作業前: 変更対象がアクセス制御・フックに関係するか／Local API で `user` を渡す箇所を把握。

作業後:

- [ ] `pnpm exec tsc --noEmit` ／ `pnpm lint`
- [ ] 必要なら `pnpm generate:types` ／ `pnpm generate:importmap`
- [ ] セキュリティ 3 原則を再確認
- [ ] **スキーマ変更でテーブルを追加した場合、本番 Supabase で RLS 有効化 SQL を再実行**（新テーブルは RLS 無効で作られるため。→ 次節）
- [ ] 変更内容に応じてドキュメントを最新化

### 詳細ドキュメント（.cursor/context/）

payload-overview / collections / fields / field-type-guards / access-control / access-control-advanced / hooks / queries / endpoints / adapters / plugin-development / components

## 本番 DB（Supabase）と RLS

本番 DB は **Supabase の Postgres**。アプリ（Payload）は `DATABASE_URL` の**直接接続（`postgres` ロール）**で読み書きしており、**Supabase の自動生成 REST API（PostgREST）や client SDK は使っていない**。
なお**ローカル開発もこの本番 DB に直結している**（compose に db サービスは無い）。管理画面・Local API での編集は即本番反映になるため、データを変更する作業は必ずバックアップを取ってから行う。

### なぜ RLS が要るか

Supabase は `public` スキーマのテーブルに対して外部向けの Web API（PostgREST）を自動公開する。テーブルに **RLS が無効**だと、匿名キー（anon key）を知る第三者が API 経由で全データを読み書きでき、Security Advisor が **Critical（`rls_disabled_in_public`）** として検知する。

### 対処（安全・冪等）

`public` の全テーブルで RLS を**有効化**する。アプリは**テーブル所有者 `postgres` で接続**しているため、有効化しても（`FORCE ROW LEVEL SECURITY` を付けない限り）**所有者は素通り＝アプリ動作に影響しない**。ポリシーは不要。

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
- ロールバック: `alter table public.<tablename> disable row level security;`
- **新テーブルが増えるたびに再実行が必要**（適用対象は本番 Supabase のみ）。

### 自動停止（Free プラン）とキープアライブ

Supabase の **Free プランは 7 日間 DB 活動が無いとプロジェクトを一時停止**する。防止のため GitHub Actions の定期ジョブ **`.github/workflows/keepalive.yml`** が毎日 1 回 `select 1` を投げている。

- 必要な Secret: **`KEEPALIVE_DATABASE_URL`**（Supabase の **Session pooler 接続文字列**。直接接続は IPv6 のみで Actions から届かないことがある）。
- GitHub は**リポジトリに 60 日間コミットが無いと schedule ワークフローを自動無効化**する。長期間コミットが無い場合は Actions 画面から再有効化する。

## デプロイ

GitHub Actions の手動実行ワークフロー（`.github/workflows/deploy.yml`）: Actions から実行 → VPS へ SSH → `git fetch` + `git reset --hard origin/main` → `docker compose -f docker-compose.prod.yml up -d --build`。

- `git pull` ではなく fetch+reset（履歴整理で分岐しても止まらない。VPS 上でリポジトリを直接編集しない運用が前提）。
- 依存が変わった直後の初回ビルドはキャッシュが効かず数分かかる。

## 重要な注意点

- **機密ファイルは読まない**: `.env` / `.env.*` / `*.pem` / 鍵・認証情報は `.claude/settings.json` の `permissions.deny` で読み込み禁止。
- **`payload-types.ts` は自動生成物**。手で編集せず `pnpm generate:types` で再生成する。
- **`sync-media` はファイルのみ同期する**（rsync・VPS→ローカルの一方向）。DB のメディアレコードは同期しないため、ローカルで Media を作ったら実ファイルを VPS へ送る必要がある（VPS の media/ は root 所有のため `docker cp` でコンテナ経由が確実）。
- **dev サーバー稼働中に同じコンテナで `pnpm build` を実行しない**。`.next` を取り合ってキャッシュが壊れ全ページ 500 になる（`.next` の中身を空にして `docker compose restart app` で復旧）。
- **依存が壊れたとき**: `node_modules` は匿名ボリューム。Payload が 500（`fast-copy/dist` 不足等）になったら `docker compose down -v` でボリュームを捨てて再起動する。

## 参考リンク

- [Payload Docs](https://payloadcms.com/docs) / [LLM Context](https://payloadcms.com/llms-full.txt) / [GitHub](https://github.com/payloadcms/payload) / [Examples](https://github.com/payloadcms/payload/tree/main/examples)
