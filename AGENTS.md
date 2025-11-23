# Repository Guidelines

## 言語

常に日本語を使用してください。

## プロジェクト構造とモジュール配置
`src/app` は Next.js App Router のルートで、ページ、レイアウト、ルーティングミドルウェアを集約します。`src/features` はドメインごとの UI/状態管理、`src/common` はデザインシステムやベースレイアウト、`src/lib` と `src/server` は Prisma クライアント、Supabase セッション、サーバーアクションをレイヤー分離しています。再利用可能な型は `src/types`、ユーティリティは `src/utils`。永続化の定義は `prisma/schema.prisma`、公開アセットは `public/`、Supabase のローカル設定は `supabase/` にあります。学習・仕様の一次情報は `docs/README.md` 以下にあり、更新時は必ずリンクを追記してください。

## ビルド・テスト・開発コマンド
開発は `pnpm dev`（Turbopack）で開始します。`pnpm build` は `prisma generate` / `prisma migrate deploy` / `next build` を直列実行し、本番用アーティファクトを生成、`pnpm start` で確認します。`pnpm prisma:migrate` はローカルスキーマ更新、`pnpm prisma:studio` でデータ確認、Supabase を使う場合は `pnpm supabase:start`→`pnpm supabase:stop`。品質系は `pnpm lint`（Biome チェック）、`pnpm format`、`pnpm tsc`、CI 相当のフルチェックは `pnpm ci`。Vitest を直接叩く場合は `pnpm vitest run` や `pnpm vitest --watch` を利用してください。

## コーディングスタイルと命名
Biome の既定設定に従い TypeScript / TSX は 2 スペースインデント、ダブルクォート、セミコロン必須です。App Router の Server Component を基本とし、クライアント側は `"use client"` 明記で `src/common` または対象 feature 配下に配置します。コンポーネントは PascalCase、hooks は `useCamelCase`、ユーティリティは `camelCase`、定数は `SCREAMING_SNAKE_CASE`。Prisma スキーマや Supabase テーブル名は単数 PascalCase を維持します。フォーマットは必ず `pnpm format` を走らせ、差分がないことを `pnpm lint` と `pnpm tsc` で確認してください。

## テスト指針
ユニット/コンポーネントテストは Vitest + Testing Library を使用し、対象ファイルと同階層に `*.test.ts` / `*.test.tsx` として配置します。モックは `vi.mock` を用い、UI コンポーネントは `@testing-library/react` でアクセシビリティロールを基準に検証します。新規ロジックでは Happy Path と主要なガード節を最低 1 ケースずつ追加し、データ取得を伴う機能は Supabase/Prisma レイヤーをスタブ化してください。カバレッジ閾値は 80% を目安に `pnpm vitest run --coverage` で自己確認します。

## コミットとプルリクエスト
Git 履歴は `feat: ...` 形式の Conventional Commits を採用しているため、`fix:` `chore:` `docs:` などの型を状況に合わせて使い分けます。1 コミット 1 目的を守り、生成物やローカル設定ファイルは含めないでください。PR では概要、テスト結果、関連 Issue、UI 変更時のスクリーンショットまたは動画を記載し、仕様変更や意思決定があれば `docs/` 配下の該当ファイルを更新しつつ `docs/README.md` にリンクを足してください。レビュー前に `pnpm ci` でセルフチェックを完了させることが必須です。

## ドキュメントと設定上の注意
環境変数は `.env.local` に管理し、`DATABASE_URL` と `DIRECT_URL` を正しく分離します。新しい知見・意思決定・TODO は `docs/` の関連セクションへメモ化し、AGENTS.md の指針も随時更新します。セキュリティ上の秘密情報やユーザーデータはダミーに置き換え、共有は Notion 等ではなく本リポジトリのドキュメントに集約してください。
