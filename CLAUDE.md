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

## ドキュメント運用
- docs/ 配下のドキュメントは常に日本語でメンテナンスすること。
- 仕様変更・学習・意思決定が発生した場合、関連するドキュメント（例: product-vision.md、roadmap.md、alpha-experiment-plan.md、alpha-mvp-spec.md、user-stories.md）を速やかに更新し、docs/README.md のリンクや説明も合わせて整備すること。
- 新しい知見や検討ログを作業ノートに留めず、必ず docs/ 配下へ追加する。
- ドキュメント更新後は、開発タスクやコードに反映が必要か確認し、差分がある場合はタスク化する。

## アーキテクチャと構造

### プロジェクト構成
```
src/
├── app/              # Next.js App Router
│   ├── layout.tsx    # ルートレイアウト
│   └── page.tsx      # ホームページ
├── common/           # プロジェクト全体の共通要素
│   ├── ui/           # 共通UIコンポーネント
│   │   ├── Button.tsx      # ボタンコンポーネント
│   │   ├── TextField.tsx   # テキストフィールドコンポーネント
│   │   └── TextArea.tsx    # テキストエリアコンポーネント
│   ├── Header.tsx          # ヘッダーコンポーネント
│   └── BottomNavigation.tsx # ボトムナビゲーション
├── pages/            # ページ固有のコンポーネント（該当ページ配下に配置）
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

#### z-indexの管理
z-indexは必ずCSS変数として`globals.css`で定義し、グローバルに管理すること：

```css
/* globals.cssで定義されているz-index変数 */
--z-index-dropdown: 10;
--z-index-modal-backdrop: 20;
--z-index-modal: 30;
--z-index-popover: 40;
--z-index-tooltip: 50;
--z-index-header: 100;
--z-index-bottom-nav: 100;
--z-index-notification: 200;
```

使用例：
```tsx
// ✅ 良い例 - CSS変数を使用
<div className="z-[var(--z-index-modal)]">

// ❌ 悪い例 - ハードコーディング
<div className="z-50">
```

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

### パッケージ管理
- **バージョンは必ず固定する**（`^`や`~`を使用しない）
- `package.json`にパッケージを追加する際は、正確なバージョン番号を指定すること
- 例: `"react": "19.1.0"` ✅ / `"react": "^19.1.0"` ❌
- 新しいパッケージをインストールする場合は `pnpm add <package>@<version> --save-exact` を使用

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
5. 共通コンポーネントは`src/common/`で管理
6. ページ固有のコンポーネントは`src/pages/`で管理

### コンポーネント構成のルール
- **共通コンポーネント** (`src/common/`)
  - **UIコンポーネント** (`src/common/ui/`)
    - Button、TextField、TextAreaなど、プロジェクト全体で再利用される基本的なUIコンポーネント
    - デザイントークンを使用した一貫性のあるスタイリング
    - アクセシビリティとレスポンシブデザイン対応
  - **レイアウトコンポーネント**
    - Header、BottomNavigationなど、アプリケーション全体で使用されるレイアウトコンポーネント
  
- **ページ固有コンポーネント** (`src/pages/`)
  - 特定のページでのみ使用されるコンポーネント
  - 該当するページのディレクトリ配下に配置
  - ビジネスロジックを含む可能性のあるコンポーネント
