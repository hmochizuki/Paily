# 実装計画（アルファMVP）

## 全体方針
- App Router構成を採用し、認証が必要な画面は `(auth)` セグメント配下でラップする。
- UIレイヤーは `src/common/ui`（汎用）、`src/features/<domain>`（ビジネスロジック入り）、`app/(auth)/_components` など画面固有コンポーネントに分離する。
- Supabase Auth + Prismaでデータアクセスを統一し、`src/lib` にクライアント初期化ロジックを配置。
- 開発はデータ層 → 認証基盤 → 招待機能 → 買い物リスト → 設定系 → 仕上げ の順に進める。

## フェーズ1: 基盤整備
1. **環境設定**
   - Supabase クライアント、Authヘッダー、Server Component対応のヘルパーを `src/lib/supabase` に用意。
   - Prisma Client を Server/Clientで使い分けるためのアダプタを確認。
   - `.env` バリデーション（`src/env.ts` など）を追加。

2. **App Router 構成**
   - `app/(auth)/layout.tsx` に認証チェックとローディングUIを実装。
   - `app/(auth)/page.tsx`（ウェルカム／ログイン）と `app/(auth)/couple/create/page.tsx` などを用意。
   - 認証不要のリンク（`app/invite/[code]/page.tsx`）は `(public)` セグメントを活用。

3. **UIベースコンポーネント**
   - `src/common/ui/feedback/` に `Toast`, `Loader`, `EmptyState`, `Dialog` などフィードバック系を配置。
   - `src/common/ui/form/` に `Button`, `Input`, `Select`, `FormField` などフォーム要素をまとめる。
   - `src/common/ui/layout/` に `Card`, `Sheet`, `Modal`, `SectionHeader` などレイアウト要素を置き、ガイドラインに沿って整備。

## フェーズ2: 認証・招待フロー
1. **ウェルカム／ログイン**
   - Supabase Auth（メール＋パスワード）フォームを `src/features/auth/login-form.tsx` として作成。
   - サインアップ時に `profiles` を upsert する Server Action を実装。

2. **カップルスペース作成**
   - `src/features/couple/create-couple-form.tsx` にフォーム実装。
   - Supabase Edge Function または Server Action で `couples` / `couple_partners` / `partner_invites` をトランザクション作成。
   - 招待コード生成ロジックを共通ユーティリティ `src/utils/invite-code.ts` に配置。

3. **招待状況ダッシュボード**
   - `app/(auth)/couple/invitations/page.tsx` 内で `src/features/couple/invite-list.tsx` を使用。
   - 再送・キャンセルは Server Actions で実装し、楽観的UIを適用。

4. **招待受諾画面**
   - `app/invite/[code]/page.tsx` で公開リンク処理。
   - 参加ボタンは `src/features/invite/accept-invite-action.ts` を呼び出し、ステータス更新。
   - 未ログイン時は `(auth)` 配下のモーダルを起動してログイン誘導。

## フェーズ3: 買い物リスト体験
1. **リスト一覧**
   - `app/(auth)/lists/page.tsx` に `src/features/lists/list-overview.tsx` を配置。
   - 新規リスト作成モーダルを `_components` ディレクトリに分離し、Server Actionで `shopping_lists` を作成。

2. **リスト詳細**
   - `app/(auth)/lists/[listId]/page.tsx`。
   - アイテム一覧は `src/features/lists/item-list.tsx`、追加フォームは `src/features/lists/add-item-form.tsx`。
   - チェック状態は Realtime サブスクリプション（Supabase Channels）で更新、`src/features/lists/hooks/use-list-realtime.ts` を用意。

3. **アイテム編集モーダル**
   - `_components/item-detail-sheet.tsx` として `app/(auth)/lists/[listId]/_components/` に実装し、URLクエリと同期。
   - Server Actions で更新／削除を処理。

## フェーズ4: 設定とプロフィール
1. **スペース設定**
   - `app/(auth)/settings/couple/page.tsx`。
   - `src/features/settings/couple-form.tsx` で編集フォームを提供し、更新・退会をServer Action化。

2. **プロフィール設定**
   - `app/(auth)/settings/profile/page.tsx`。
   - `src/features/profile/profile-form.tsx` で表示名・性別・アバターを編集。
   - 画像アップロードは Supabase Storage を利用し、`src/features/profile/upload-avatar.ts` に処理を切り出す。

## フェーズ5: 仕上げ・QA
- Supabase Realtime のエラーハンドリングと再接続ロジックを `src/features/lists/hooks` に実装。
- 認証状態のグローバル管理（React Query または自前の SWR）を導入し、リダイレクトガードを共通化。
- E2Eフロー確認（ログイン→スペース作成→招待受諾→共同編集）。
- Lighthouse／a11y チェック、RLSポリシー確認、ドキュメント更新。

## ディレクトリ構成（抜粋）
```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # ウェルカム／ログイン
│   │   ├── couple/
│   │   │   ├── create/page.tsx
│   │   │   └── invitations/page.tsx
│   │   ├── lists/
│   │   │   ├── page.tsx
│   │   │   └── [listId]/
│   │   │       ├── page.tsx
│   │   │       └── _components/...
│   │   └── settings/
│   │       ├── couple/page.tsx
│   │       └── profile/page.tsx
│   └── invite/[code]/page.tsx
├── common/
│   └── ui/
│       ├── form/
│       ├── feedback/
│       └── layout/
├── features/
│   ├── auth/
│   ├── couple/
│   ├── invite/
│   ├── lists/
│   └── profile/
├── lib/
│   ├── supabase-client.ts
│   ├── prisma.ts
│   └── auth.ts                       # 認証ガード等
└── utils/
    └── invite-code.ts
```

## 次のステップ
1. フェーズ1のタスクから着手し、基盤（Supabase/Prisma初期化とApp Router構成）を整える。
2. `src/common/ui` のコンポーネント設計を着手し、画面ごとの実装に備える。
3. 招待関連の Server Actions と Realtime 構成を別途設計レビュー。
