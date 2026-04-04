# Portfolio

Next.js + Payload CMS で構築したポートフォリオサイトです。

## 技術スタック

- **フレームワーク**: [Next.js](https://nextjs.org/) 15
- **CMS**: [Payload CMS](https://payloadcms.com/) 3.x
- **言語**: TypeScript
- **パッケージマネージャ**: [pnpm](https://pnpm.io/) 9 / 10
- **リッチテキスト**: Lexical Editor

### ホストで直接開発する場合

Node 24 系を用意し、プロジェクトルートで次を実行します。

```bash
corepack enable
pnpm install
pnpm dev
```

## ローカル開発（Docker）

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

`.env` を開き、少なくとも次を設定してください。

- **`PAYLOAD_SECRET`**: 32 文字以上のランダム文字列（未設定だと管理画面まわりで失敗します）
- **`DATABASE_URL`**: `docker compose` で起動する場合は `.env.example` のとおり  
  `postgresql://payload:payload@postgres:5432/payload` にしてください（ホスト名は **`postgres`**）。  
  Neon などクラウドの URL を使う場合は、ダッシュボードから**今有効な接続文字列**をコピーし直してください。古い URL や誤ったパスワードでは `Tenant or user not found` のようなエラーになります。

3. 開発サーバーを起動

初回または `Dockerfile.dev` / `package.json` の `packageManager` を変えたあとはイメージを組み直してください。

```bash
docker compose up --build
```

2 回目以降は `docker compose up` で構いません。`-d` を付けるとバックグラウンド起動です。

4. ブラウザで `http://localhost:3000` を開く

初回アクセス時に管理者ユーザーの作成画面が表示されます。

### 主なコマンド（コンテナ内で実行）

| コマンド | 説明 |
|---|---|
| `docker-compose exec app pnpm run generate:types` | Payload の型定義を生成 |
| `docker-compose exec app pnpm run generate:importmap` | Payload の ImportMap を生成 |
| `docker-compose exec app pnpm run lint` | ESLint でコードチェック |

※ コンテナが起動していない場合は `docker-compose run --rm app pnpm run <script>` で実行できます。

## ディレクトリ構成

```
src/
├── app/
│   ├── (frontend)/   # フロントエンドのルート
│   └── (payload)/    # Payload 管理画面・API
├── collections/      # コレクション設定
├── components/       # カスタム React コンポーネント
├── payload.config.ts # Payload メイン設定
└── payload-types.ts  # 生成型（generate:types）
```

## 管理画面

`http://localhost:3000/admin` から Payload の管理画面にアクセスできます。
