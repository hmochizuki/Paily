# Next.js + Prisma テンプレート

このプロジェクトは、Next.js 15とPrismaを組み合わせたモダンなフルスタックWebアプリケーションのテンプレートです。

## 技術スタック

- **Next.js 15.5.4** - React フレームワーク（App Router使用）
- **Prisma 6.16.2** - TypeScript向けORM
- **PostgreSQL** - データベース（Supabaseまたは他のPostgreSQLサービス）
- **React 19.1.0** - UIライブラリ
- **TypeScript** - 型安全な開発
- **Tailwind CSS v4** - ユーティリティファーストCSS
- **Biome** - 高速なリンター/フォーマッター

## プロジェクト構造

```
src/
├── app/              # Next.js App Router
├── components/       # 共通コンポーネント
├── hooks/            # カスタムフック
├── lib/              # ライブラリ設定
│   └── prisma.ts     # Prismaクライアント（シングルトン）
├── types/            # TypeScript型定義
└── utils/            # ユーティリティ関数
```

## セットアップ

### 1. 環境変数の設定

`.env.example`をコピーして`.env.local`を作成し、必要な値を設定してください：

```bash
cp .env.example .env.local
```

必要な環境変数：
- `DATABASE_URL`: データベース接続URL（接続プーリング用）
- `DIRECT_URL`: 直接接続URL（マイグレーション用）

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. データベースのセットアップ

```bash
# Supabaseローカル環境の起動
pnpm supabase:start

# データベースマイグレーションの実行
pnpm prisma:migrate

# Prismaクライアントの生成
pnpm prisma:generate
```

### 4. 開発サーバーの起動

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000)でアプリケーションが起動します。

## 開発コマンド

### 開発
- `pnpm dev` - 開発サーバーの起動
- `pnpm build` - プロダクションビルド
- `pnpm start` - プロダクションサーバーの起動

### Prisma
- `pnpm prisma:generate` - Prismaクライアントの生成
- `pnpm prisma:migrate` - マイグレーションの実行
- `pnpm prisma:studio` - Prisma Studioの起動

### Supabase (オプション)
- `pnpm supabase:start` - ローカルSupabaseの起動
- `pnpm supabase:stop` - ローカルSupabaseの停止
- `pnpm supabase:restart` - ローカルSupabaseの再起動

### コード品質
- `pnpm lint` - リントチェック
- `pnpm format` - コードフォーマット
- `pnpm tsc` - TypeScript型チェック
- `pnpm ci` - CI用の全チェック実行

## データベーススキーマ

`prisma/schema.prisma`で定義されているモデル：

- **User**: ユーザー情報（email、name）
- **Post**: 投稿情報（title、content、published）

## 認証について

認証機能が必要な場合は、NextAuthやAuth.jsなどのライブラリを導入してください。

## デプロイ

### Vercel

1. GitHubリポジトリをVercelにインポート
2. 環境変数を設定
3. デプロイ

### その他のプラットフォーム

`pnpm build`でプロダクションビルドを作成し、Node.js環境でデプロイしてください。
