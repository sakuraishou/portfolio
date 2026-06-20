# TODO（あとでやる）

## トップの Works セクションに「実プロダクト」を追加する
`/manual` の改訂履歴 v4.0 で触れている実プロダクトを、トップページの **Works（Payload 管理）** にも実績として載せる。技術アピールが二段構えになる。

- **整骨院の Web 予約システム＋CRM** … Nuxt × Supabase / **モノレポ構成**（※未公開）
- **社内アプリ** … Next.js（※未公開）

### メモ
- 未公開でも「担当範囲・技術構成・工夫した点」を書けば十分刺さる。
- 見せどころ: **Next.js(React系) / Nuxt(Vue系) の両対応**、Supabase 採用、モノレポ構成。
- 公開可否（スクショ・ダミーデータ化など）も検討する。

---

## MV／About／Skills リデザインの続き（今回の作業の積み残し）

トップを「桜井 翔という"製品"の仕様書（スペックシート）」コンセプトで MV→About→Skills→/manual と統一した。その続きで未対応のもの:

### 1. Skills「得意」バッジを Payload フィールド化（システム改修）
- 現状は**フロントにベタ書きの仮実装**：`src/components/Sections/Skills/index.tsx` の `FEATURED_SKILLS = new Set(['WordPress'])`。
- `skills` コレクションに `featured`(boolean=得意) か `level`(得意/通常/学習中) を1つ追加 → 型再生成（`pnpm generate:types`）→ フロントを置換。
- 管理画面でポチっと「得意」を指定できるようにする。

### 2. Works / Contact の「中身」も MV 調に寄せる
- 今回は **見出し（`UI/Title` のスペックシート版）だけ統一**。Works のプロジェクトカード・Contact のフォーム本体のトーンは未調整。
- mono ラベル／ヘアライン／key-value など、About・Skills と同じ語彙で揃えるか検討。

### 3. About の文言を CMS 管理化（任意）
- 現状 About の本文・スペック表（背景／強み／姿勢）・リードは `index.tsx` にベタ書き。
- 管理画面から編集したくなったら、`about`（global もしくはコレクション）を作る＝システム改修。

### 4. 仕上げ確認
- About のプロフィール写真は `object-fit: cover; object-position: center top`（4:5）。実画像で顔の切れ方を確認し、必要なら `object-position` を調整。
- 各セクションの文字サイズ最終バランス（PC 本文 `1.6rem` 基準）を実機で再確認。
