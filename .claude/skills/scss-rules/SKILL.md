---
name: scss-rules
description: このポートフォリオの SCSS / CSS Modules スタイリング規約。.scss ファイル（特に *.module.scss）を新規作成・編集するとき、レスポンシブ対応・色やフォントの指定・レイアウト調整をするときに必ず参照する。
---

# SCSS / CSS Modules スタイリング規約

このリポジトリで `.scss` を書くときのルール。**周囲のコードに合わせる**のが最優先。手本は `src/components/Sections/About/About.module.scss`。

## ファイル構成

- コンポーネントのスタイルは **CSS Modules**：`<Name>.module.scss` を `index.tsx` と同じフォルダに置く。
- TSX 側は `import styles from './Name.module.scss'` → `className={styles.xxx}` で参照。
- 土台ファイルは `src/app/(frontend)/_styles/` に集約：
  - `_variables.scss`（色・フォント変数）
  - `_mixins.scss`（mixin・関数・ブレークポイント）
  - `index.scss`（`@forward 'variables'` / `@forward 'mixins'`）
- グローバル CSS（リセット・base・ユーティリティ）は `src/app/(frontend)/styles.scss`。

## モジュール冒頭のお作法

`next.config.mjs` の `sassOptions.prependData` で全 SCSS に `index` が自動注入されるが、**各モジュールの先頭にも明示的に下記 2 行を書く**（既存コードがそうなっている。エディタ補完・可読性のため）。

```scss
@use '@/app/(frontend)/_styles/variables' as *;
@use '@/app/(frontend)/_styles/mixins' as *;
```

- `@import` は使わない。Sass モジュールシステム（`@use` / `@forward`）を使う。

## クラス命名（CSS Modules × BEM 風）

- ブロックは **camelCase**（JS から `styles.aboutWrap` でアクセスするため）。例: `.about`, `.aboutWrap`, `.aboutImg`。
- 要素は **`&__element`** のネストで表す。例: `.aboutImg { &__name { ... } }` → `styles.aboutImg__name`。
- 状態クラスは別クラスで足す（例: `.open` を `${styles.nav} ${isMenuOpen ? styles.open : ''}` のように結合）。

```scss
.aboutImg {
  position: relative;

  &__name {
    @include display;
    color: $fontBase;
  }
}
```

## 単位とサイズ設計

- **rem 基準**。`html` の `font-size` は `pxtovw(10)`（SP）→ `pc-pxtovw(10)`（md〜）→ `10px`（xl〜）と切り替わるので、**`1rem ≒ 10px` 相当のデザイン単位**として使える（例: `3.8rem`, `1.2rem`）。
- ピクセル直書きは原則しない（`px` はボーダーなど極小値の例外のみ）。
- vw 変換が要るときは `_mixins.scss` の関数を使う：`get_vw($size)` / `pxtovw($num)` / `pc-pxtovw($num)`。

## レスポンシブ（モバイルファースト）

- **ベースは SP（モバイル）**。大きい画面は `@include responsive($bp)` で上書きする。
- ブレークポイントは `_mixins.scss` の `$breakpoints` マップに定義済みの名前だけ使う：
  `sp`(max767) / `xs` / `md`(768〜) / `lg`(992〜) / `w1080` / `w1200` / `xl`(1300〜) / `xxl`(1400〜) / `yoko`(横向き)。
- 未定義の名前を渡すと `@error` で落ちる。新しい BP が要るならまずマップに足す。
- **SP を雑にしない（重要）**：PC を縮めただけにしない。SP 単体で破綻・間延び・はみ出しが無いか、実機相当（**320px / 375px**）で必ず確認する。意図した改行は `<br className="sp" />`、表示の出し分けは `.sp` / `.pc`。横スクロールを出さない（長い英単語・コードは折返し）。タップ領域は指で押せるサイズに。（デザイン観点の詳細は `/design-rules`「SP（モバイル）を作り込む」）

```scss
.aboutName {
  font-size: 3rem;

  @include responsive(lg) {
    font-size: 5rem;
  }
}
```

## 色・フォント

- 色は**変数を使う**（直書きの hex を避ける）。`_variables.scss`：
  - `$main`(#f78c00) / `$bg`(#ffeedf) / `$bg2`(#e4e2e1) / `$fontBase`(#5e3100) / `$accent`(#ffa836)。
  - `#fff` のような単純な白黒は直書き可（既存コードでも使用）。
- フォントは mixin / 変数で：本文・日本語は `$font-main`（Zen Kaku）、見出し英字は `@include display`（Fraunces）、ラベル英字は `@include quicksand`（Quicksand）、データ英字（等幅）は `@include mono`（IBM Plex Mono）。
  - フォント用の CSS 変数（`--font-*`）は CSS Modules に書けないため `styles.scss` の `:root` のみで定義する。

## よく使う mixin

- `@include center;` … flex 中央寄せ（`display:flex; align-items:center; justify-content:center`）
- `@include hidden;` … `opacity:0; visibility:hidden`
- `@include responsive($bp) { ... }` … メディアクエリ
- `@include image-set($path, $filename)` … avif/webp/jpg の `image-set` 背景

## グローバルユーティリティ（`styles.scss`）

直接 className に付けて使えるもの：`.wrap`（最大幅 120rem の中央寄せコンテナ）、`.sp` / `.pc`（表示出し分け）、`.bold`。`section` 要素には既定の縦パディングが付く。コンポーネント固有の見た目はモジュール側に書く。

## やらないこと

- `@import` の使用（`@use`/`@forward` を使う）。
- `!important` の多用（既存では `::before` の色上書きなど局所的な例外のみ）。
- 色・BP・フォントのハードコード（変数・mixin・マップを使う）。
- インラインスタイルでの恒久的スタイリング（CSS 変数を渡す `style={{ '--delay': ... }}` のような動的値は可）。
