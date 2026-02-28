# Portfolio

Next.js + Payload CMS で構築したポートフォリオサイトです。

## 技術スタック

- **フレームワーク**: [Next.js](https://nextjs.org/) 15
- **CMS**: [Payload CMS](https://payloadcms.com/) 3.x
- **言語**: TypeScript
- **リッチテキスト**: Lexical Editor

## ローカル開発

### 前提条件

- Node.js 22 以上
- npm または pnpm

### セットアップ

1. リポジトリをクローン

```bash
git clone <repository-url>
cd portfolio
```

2. 環境変数を設定

```bash
cp .env.example .env
```

`.env` を開いて各値を設定してください。

3. 依存パッケージをインストールして開発サーバーを起動

```bash
npm install
npm run dev
```

4. ブラウザで `http://localhost:3000` を開く

初回アクセス時に管理者ユーザーの作成画面が表示されます。

### Docker を使う場合

Docker を使って開発環境を起動できます。

```bash
docker-compose up
```

`-d` オプションを付けるとバックグラウンドで起動します。

## 主なコマンド

| コマンド | 説明 |
|---|---|
| `npm run dev` | 開発サーバーを起動 |
| `npm run devsafe` | `.next` キャッシュを削除してから起動 |
| `npm run build` | 本番用ビルド |
| `npm run start` | 本番サーバーを起動 |
| `npm run generate:types` | Payload の型定義を生成 |
| `npm run generate:importmap` | Payload の ImportMap を生成 |
| `npm run lint` | ESLint でコードチェック |

## ディレクトリ構成

```
src/
├── app/
│   ├── (frontend)/   # フロントエンドのルート
│   └── (payload)/    # Payload 管理画面のルート
├── collections/      # コレクション設定
├── globals/          # グローバル設定
├── components/       # カスタム React コンポーネント
├── hooks/            # フック関数
├── access/           # アクセス制御関数
└── payload.config.ts # Payload メイン設定
```

## 管理画面

`http://localhost:3000/admin` から Payload の管理画面にアクセスできます。
