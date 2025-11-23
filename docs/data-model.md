# データモデル設計

## モデリング方針
- Supabase Auth の `auth.users` を前提に、アプリケーション側で `profiles` テーブルを管理して二人の体験に必要な属性を保持する。
- カップル単位の空間を最上位エンティティとし、リストや招待などは必ず `couple_id` でスコープを絞る。
- リアルタイム同期とオフライン考慮のため、更新系テーブルに `updated_at` とバージョン衝突を検知するフィールド（`revision`）を持たせる。
- 家事などの機能は今後拡張する前提で、現段階では共有買い物リストと招待体験に集中する。
- 状態を表す値は文字列カラムで管理し、将来的に必要になればマスターテーブル化する。

## ER概要
- `profiles` ←→ `couple_partners` → `couples`: パートナーが1組のカップルに属する。
- `couples` → `shopping_lists` → `shopping_list_items`: 買い物リストとアイテム。
- `partner_invites`: カップル空間への招待状態を保持。

## テーブル定義

### profiles
| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | uuid | PK, FK→auth.users.id | Supabase Auth ユーザーと同一のID |
| display_name | text | NOT NULL | 表示名 |
| gender | text | NULL | 自由入力またはプリセットの性別 |
| avatar_url | text | NULL | プロフィール画像 |
| created_at | timestamptz | DEFAULT now() | 作成日時 |
| updated_at | timestamptz | DEFAULT now() | 更新日時 |

### couples
| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | uuid | PK | カップル空間ID |
| name | text | NULL | カップル名（任意） |
| timezone | text | NOT NULL | 共有タイムゾーン（例: `Asia/Tokyo`） |
| created_at | timestamptz | DEFAULT now() | 作成日時 |
| updated_at | timestamptz | DEFAULT now() | 更新日時 |

### couple_partners
| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| couple_id | uuid | PK, FK→couples.id | 所属カップル |
| profile_id | uuid | PK, FK→profiles.id | パートナー |
| joined_at | timestamptz | DEFAULT now() | 参加日時 |
| status | text | DEFAULT 'active' | active / invited / left など |

### partner_invites
| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | uuid | PK | 招待ID |
| couple_id | uuid | FK→couples.id | 招待元カップル |
| email | text | NOT NULL | 招待先メールアドレス |
| inviter_profile_id | uuid | FK→profiles.id | 招待を送ったパートナー |
| code | text | UNIQUE | 共有コード（72時間で失効） |
| expires_at | timestamptz | NOT NULL | 失効日時 |
| accepted_profile_id | uuid | FK→profiles.id | 受諾したプロフィールID（受諾後に設定） |
| status | text | DEFAULT 'pending' | pending / accepted / expired / canceled |
| created_at | timestamptz | DEFAULT now() | 作成日時 |

### shopping_lists
| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | uuid | PK | リストID |
| couple_id | uuid | FK→couples.id | 所属カップル |
| title | text | NOT NULL | リスト名（買い物先など） |
| is_active | boolean | DEFAULT true | 利用中かどうか |
| revision | bigint | DEFAULT 0 | クライアント同期用リビジョン番号 |
| created_at | timestamptz | DEFAULT now() | 作成日時 |
| updated_at | timestamptz | DEFAULT now() | 更新日時 |

### shopping_list_items
| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | uuid | PK | アイテムID |
| list_id | uuid | FK→shopping_lists.id | 所属リスト |
| couple_id | uuid | FK→couples.id | クエリ最適化用に冗長保持 |
| added_by | uuid | FK→profiles.id | 追加したパートナー |
| name | text | NOT NULL | アイテム名 |
| label | varchar(10) | NULL | グルーピング用ラベル（最大10文字） |
| category | text | NULL | 任意のカテゴリ |
| note | text | NULL | 補足メモ |
| quantity | text | NULL | 数量・単位 |
| revision | bigint | DEFAULT 0 | クライアント同期用 |
| created_at | timestamptz | DEFAULT now() | 作成日時 |
| updated_at | timestamptz | DEFAULT now() | 更新日時 |

### shopping_list_item_states
| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| item_id | uuid | PK, FK→shopping_list_items.id | 対象アイテム |
| couple_id | uuid | FK→couples.id | 所属カップル（RLS用） |
| is_checked | boolean | DEFAULT false | チェック状態 |
| checked_by | uuid | FK→profiles.id | チェックしたパートナー |
| checked_at | timestamptz | NULL | チェック日時 |

## インデックスと制約のポイント
- `shopping_list_items (list_id)` と `shopping_list_item_states (is_checked)` にインデックスを貼り、未購入アイテムのクエリを高速化。
- 招待やメンバーシップの状態値はアプリケーション側で許可リストを管理し、将来的にENUM化やCHECK制約を検討する。
- すべてのテーブルで `couple_id` による Row Level Security を設定し、他カップルのデータ参照を禁止。

## 拡張に向けたメモ
- 家事機能を導入する際は、`chores` や `chore_completions` などのテーブルを追加し、`couple_id` とイベント履歴を用いて分析可能な構造にする予定。
- 旅行計画や割り勘機能は、`plans` / `expenses` テーブルとして後続で追加予定。既存の `couples`・`profiles` を再利用する。
- 通知設定や配信履歴が必要になった段階で、`notification_preferences` や `notification_deliveries` といったテーブルを追加し、OneSignalなどのトークン管理を含める想定。
- 買い物リストのチェック履歴をさらに詳しく追跡したくなった場合は、`shopping_list_item_states` に履歴行をためる形へリファクタリングする余地がある。
