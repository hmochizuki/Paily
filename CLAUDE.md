# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

これは Next.js 15.5.4とPrisma 6.16.2 を使用したフルスタック Web アプリケーションのテンプレートです。Supabaseや他のPostgreSQLサービスと組み合わせて使用できます。

## 主要なコマンド

### 開発
```bash
pnpm dev          # Next.js開発サーバーの起動（Turbopack使用）
pnpm build        # プロダクションビルド（Prismaの生成とマイグレーションも実行）
pnpm start        # プロダクションサーバーの起動
```

### Prisma
```bash
pnpm prisma:generate  # Prismaクライアントの生成
pnpm prisma:migrate   # 開発環境でのマイグレーション実行
pnpm prisma:studio    # Prisma Studioの起動（データベース管理GUI）
```

### Supabase (オプション)
```bash
pnpm supabase:start    # ローカルSupabaseの起動
pnpm supabase:stop     # ローカルSupabaseの停止
pnpm supabase:restart  # ローカルSupabaseの再起動
```

### コード品質
```bash
pnpm lint    # Biomeでのリントチェック
pnpm format  # Biomeでのコードフォーマット
pnpm tsc     # TypeScriptの型チェック
pnpm ci      # フォーマット、リント、型チェックを連続実行
```

## アーキテクチャと構造

### プロジェクト構成
```
src/
├── app/              # Next.js App Router
│   ├── layout.tsx    # ルートレイアウト
│   └── page.tsx      # ホームページ
├── components/       # 共通コンポーネント
├── hooks/            # カスタムフック
├── lib/              # ライブラリ設定
│   └── prisma.ts     # Prismaクライアントのシングルトン実装
├── types/            # TypeScript型定義
└── utils/            # ユーティリティ関数
```

### Next.js App Router
- `src/app/` ディレクトリ配下にApp Router構造を採用
- Server ComponentsとServer Actionsを活用
- `src/app/page.tsx`: メインページでPrismaを使用したユーザー作成フォームを実装

### データベース層

#### Prisma
- TypeScript向けのタイプセーフなORM
- `src/lib/prisma.ts`でシングルトン実装（開発時のホットリロード対応）
- 環境変数:
  - `DATABASE_URL`: 接続プーリング用（アプリケーションで使用）
  - `DIRECT_URL`: 直接接続用（マイグレーションで使用）


### Prismaスキーマ (`prisma/schema.prisma`)
```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

### 認証
認証機能が必要な場合は、NextAuthやAuth.jsなどのライブラリを導入してください。

### スタイリング
- Tailwind CSS v4を採用
- Geistフォントファミリーを使用
- `src/app/globals.css`でグローバルスタイル定義

### コード品質管理
- **Biome**: リンターおよびフォーマッターとして使用
- TypeScript strictモードを有効化（`tsconfig.json`）
- `@/*` エイリアスを`src/*`に設定
- VSCode設定で保存時自動フォーマット（`.vscode/settings.json`）

## 開発時の注意事項

### TypeScript
- `any`型の使用は禁止
- 型アサーション（`as`）の使用は禁止
- strictモードが有効
- 必ず型安全性を保つこと

### Prismaクライアントの使用
```typescript
// ❌ 悪い例 - 新しいインスタンスを作成
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ✅ 良い例 - シングルトンを使用
import { prisma } from "@/lib/prisma";
```


### Server Actions
- `"use server"` ディレクティブを使用してサーバーサイドの処理を実装
- フォーム送信などのユーザーインタラクションで使用
- エラーハンドリングを適切に行うこと

### 環境変数
- `.env.local`に機密情報を保存（gitignoreされている）
- `NEXT_PUBLIC_`プレフィックスはクライアントサイドで利用可能
- それ以外はサーバーサイドでのみ利用可能

### ベストプラクティス
1. データベースクエリは必ずtry-catchでエラーハンドリング
2. 認証が必要な場合は適切なライブラリを導入
3. 型定義は`src/types/`に集約
4. 共通ロジックは`src/utils/`に実装
5. UIコンポーネントは`src/components/`で管理