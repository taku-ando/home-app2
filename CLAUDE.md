# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Next.js 15を使用したWebアプリケーションで、Cloudflare Workers上でOpenNextを利用してデプロイするよう設計されています。NextAuth v5によるGoogle OAuth認証機能と、Tailwind CSS v4によるスタイリングを含んでいます。

## 開発コマンド

```bash
# Turbopackを使用した開発サーバー
pnpm dev

# 本番ビルド
pnpm build

# コードリンター実行
pnpm lint

# リンター自動修正
pnpm lint:fix

# コードフォーマット
pnpm format

# リンター+フォーマット実行
pnpm check

# Cloudflare型定義生成
pnpm cf-typegen

# Cloudflareデプロイ
pnpm deploy

# ローカルプレビュー
pnpm preview
```

## アーキテクチャ

### 技術スタック
- **フレームワーク**: Next.js 15 (App Router)
- **ランタイム**: Cloudflare Workers (@opennextjs/cloudflare使用)
- **認証**: NextAuth v5 (Googleプロバイダー)
- **スタイリング**: Tailwind CSS v4 + PostCSS
- **TypeScript**: ES2022ターゲット、strict mode
- **リンター/フォーマッター**: Biome
- **パッケージマネージャー**: pnpm

### プロジェクト構造
- `src/app/` - Next.js App RouterのページとAPIルート
- `src/auth.ts` - NextAuth設定
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth APIハンドラー
- `wrangler.jsonc` - Cloudflare Workers設定
- `open-next.config.ts` - OpenNext Cloudflare設定

### 主要機能
- サーバーサイド認証とセッション管理
- Google OAuth統合
- Cloudflare Workersデプロイ設定
- Tailwind CSSとカスタムフォント変数 (Geist Sans/Mono)

### 重要なファイル
- `cloudflare-env.d.ts` - 自動生成されるCloudflare環境型定義（`pnpm cf-typegen`で再生成）
- `next.config.ts` - OpenNext Cloudflare開発初期化を含む
- `biome.json` - Biomeのリンター・フォーマッター設定
- パスエイリアス `@/*` は `./src/*` にマップ

## 認証設定

NextAuth v5を使用：
- `src/auth.ts`でGoogleOAuthプロバイダー設定
- Cloudflare Workers互換性のため`trustHost: true`
- auth()関数でサーバーサイドセッション状態管理
- ページコンポーネント内でサーバーアクションを使用したサインイン/アウトフォーム

## デプロイメント

- Cloudflare Workers互換性のためOpenNextを使用
- `.open-next/assets`ディレクトリからアセット配信
- `.open-next/worker.js`のワーカースクリプト
- 環境変数はCloudflareダッシュボードで設定
- NextAuth機能にはAUTH_SECRETが必要

## 開発ノート

- 開発サーバーは高速ビルドのためTurbopackを使用
- TypeScriptはstrict modeとES2022ターゲットで設定
- Cloudflare互換性フラグ: nodejs_compat, global_fetch_strictly_public
- Tailwind CSS処理用のPostCSS設定
- BiomeによるコードフォーマットとESLint互換のリンター機能
- `cloudflare-env.d.ts`は自動生成ファイルのためBiomeチェックから除外