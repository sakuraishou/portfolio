# Portfolio

Next.js + Payload CMS で構築したポートフォリオサイトです。

## 技術スタック

- **フレームワーク**: [Next.js](https://nextjs.org/) 15
- **CMS**: [Payload CMS](https://payloadcms.com/) 3.x
- **言語**: TypeScript
- **リッチテキスト**: Lexical Editor

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

`.env` を開いて各値を設定してください。

3. 開発サーバーを起動

```bash
docker-compose up
```

`-d` オプションを付けるとバックグラウンドで起動します。

4. ブラウザで `http://localhost:3000` を開く

初回アクセス時に管理者ユーザーの作成画面が表示されます。

### 主なコマンド（コンテナ内で実行）

| コマンド | 説明 |
|---|---|
| `docker-compose exec app npm run generate:types` | Payload の型定義を生成 |
| `docker-compose exec app npm run generate:importmap` | Payload の ImportMap を生成 |
| `docker-compose exec app npm run lint` | ESLint でコードチェック |

※ コンテナが起動していない場合は `docker-compose run --rm app npm run <script>` で実行できます。

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

## 詰まった時の対処（Docker / npm）

`sharp` のロード失敗や `npm warn tar TAR_ENTRY_ERROR ENOENT` が出るときは、依存展開が壊れている可能性が高いです。以下を順に実行してください。

```bash
docker compose down -v --remove-orphans
docker volume prune -f
docker builder prune -f
rm -rf node_modules .next
docker compose up --build
```

### よくある症状

- `Failed to load external module sharp`
- `TAR_ENTRY_ERROR ENOENT`
- `Cannot find module '../server/lib/start-server'`
- `Next.js package not found`

### 補足

- コンテナイメージは `bookworm-slim`（glibc）を使うと `sharp` で詰まりにくいです。
- 依存導入は `npm ci` ベースで行うと再現性が高くなります。
