# 1. ビルド用ステージ
FROM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable

# 依存関係のインストール（キャッシュを効かせるため先にコピー）
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 全ファイルをコピーしてビルド
COPY . .
# 以前設定した next.config.mjs の output: 'standalone' がここで活きます
RUN pnpm run build

# 2. 実行用ステージ（ここが最終的なイメージになる）
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# 実行に必要な最小限のファイルだけを builder から持ってくる
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

# Next.js の standalone モードで生成された server.js を起動
CMD ["node", "server.js"]
