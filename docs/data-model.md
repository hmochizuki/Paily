# データモデル設計

## モデリング方針
- Supabase Auth の `auth.users` を前提に、アプリケーション側で `profiles` テーブルを管理して二人の体験に必要な属性を保持する。
- カップル単位の空間を最上位エンティティとし、リスト・家事・通知などは必ず `couple_id` でスコープを絞る。
- 家事完了と賞賛の履歴をイベントとして分離し、将来的な分析と機能拡張（マルチリアクション、レポート生成）に備える。
- リアルタイム同期とオフライン考慮のため、更新系テーブルに `updated_at` とバージョン衝突を検知するフィールド（`revision`）を持たせる。

## ER概要
- `profiles` ←→ `couple_partners` → `couples`: パートナーが1組のカップルに属する。
- `couples` → `shopping_lists` → `shopping_list_items`: 買い物リストとアイテム。
- `couples` → `chores` → `chore_completions` → `appreciations` / `appreciation_reactions`: 家事と賞賛イベント。
- `couples` → `notification_preferences`: パートナーごとの通知設定。
- `partner_invites`: カップル空間への招待状態を保持。

## テーブル定義

### profiles
| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | uuid | PK, FK→auth.users.id | Supabase Auth ユーザーと同一のID |
| display_name | text | NOT NULL | 表示名 |
| pronouns | text | NULL | 希望する敬称・代名詞 |
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
| role | text | DEFAULT 'partner' | 役割（将来のコーチ/サポーター拡張に備える） |
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
| category | text | NULL | 任意のカテゴリ |
| note | text | NULL | 補足メモ |
| quantity | text | NULL | 数量・単位 |
| is_checked | boolean | DEFAULT false | 購入チェック状態 |
| checked_by | uuid | FK→profiles.id | チェックしたパートナー |
| checked_at | timestamptz | NULL | チェック日時 |
| revision | bigint | DEFAULT 0 | クライアント同期用 |
| created_at | timestamptz | DEFAULT now() | 作成日時 |
| updated_at | timestamptz | DEFAULT now() | 更新日時 |

### chores
| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | uuid | PK | 家事ID |
| couple_id | uuid | FK→couples.id | 所属カップル |
| title | text | NOT NULL | 家事タイトル |
| description | text | NULL | 詳細メモ |
| cadence | text | DEFAULT 'one_time' | one_time / daily / weekly / monthly 等 |
| cadence_config | jsonb | NULL | 具体的な曜日・間隔設定 |
| due_at | timestamptz | NULL | 締切日時 |
| next_occurrence_at | timestamptz | NULL | 次回予定（繰り返し用） |
| created_by | uuid | FK→profiles.id | 作成者 |
| revision | bigint | DEFAULT 0 | クライアント同期用 |
| is_archived | boolean | DEFAULT false | アーカイブ判定 |
| created_at | timestamptz | DEFAULT now() | 作成日時 |
| updated_at | timestamptz | DEFAULT now() | 更新日時 |

### chore_completions
| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | uuid | PK | 完了イベントID |
| chore_id | uuid | FK→chores.id | 対象の家事 |
| couple_id | uuid | FK→couples.id | クエリ最適化用 |
| completed_by | uuid | FK→profiles.id | 完了したパートナー |
| completed_at | timestamptz | DEFAULT now() | 完了日時 |
| note | text | NULL | 任意のノート |
| auto_created | boolean | DEFAULT false | 自動生成（繰り返しロジック）かどうか |

### appreciations
| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | uuid | PK | 賞賛メッセージID |
| completion_id | uuid | FK→chore_completions.id | 対象完了イベント |
| sender_id | uuid | FK→profiles.id | 送信者 |
| message | text | NULL | 賞賛テキスト（テンプレート利用可） |
| sentiment | text | NULL | emoji / ステータス等の分類 |
| created_at | timestamptz | DEFAULT now() | 作成日時 |

### appreciation_reactions
| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| appreciation_id | uuid | PK, FK→appreciations.id | 対象賞賛 |
| reactor_id | uuid | PK, FK→profiles.id | リアクションしたパートナー |
| emoji | text | NOT NULL | 使用した絵文字（❤️など） |
| created_at | timestamptz | DEFAULT now() | 作成日時 |

### notification_preferences
| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| profile_id | uuid | PK, FK→profiles.id | パートナー |
| couple_id | uuid | FK→couples.id | 所属カップル |
| channel | text | DEFAULT 'push' | push / email |
| cadence | text | DEFAULT 'daily_digest' | instant / daily_digest / snoozed |
| quiet_hours | jsonb | NULL | サイレント時間帯設定 |
| last_digest_at | timestamptz | NULL | 直近のダイジェスト送信時刻 |
| updated_at | timestamptz | DEFAULT now() | 更新日時 |

### event_log（分析・監査用オプション）
| カラム | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| id | bigint | PK, identity | 監査ログID |
| couple_id | uuid | NULL | 関連カップル |
| profile_id | uuid | NULL | 関連パートナー |
| event_type | text | NOT NULL | 例: invite_sent, praise_sent |
| payload | jsonb | NULL | 任意ペイロード |
| occurred_at | timestamptz | DEFAULT now() | 発生時刻 |

## インデックスと制約のポイント
- `shopping_list_items (list_id, is_checked)` に複合インデックスを貼り、未購入アイテムのクエリを高速化。
- `chore_completions (chore_id, completed_at DESC)` で履歴取得を最適化。
- `appreciation_reactions` は PK を複合（`appreciation_id`, `reactor_id`）とし、リアクションの重複送信を防止。
- すべてのテーブルで `couple_id` による Row Level Security を設定し、他カップルのデータ参照を禁止。

## 拡張に向けたメモ
- 旅行計画や割り勘機能は、`plans` / `expenses` テーブルとして後続で追加予定。既存の `couples`・`profiles` を再利用する。
- プッシュ通知の配信履歴は、後段で `notification_deliveries` テーブルを追加し、OneSignalなどのトークン管理を含める想定。
- 機械学習による賞賛テンプレート提案を視野に入れ、`appreciations` に `template_id` や `context_meta` を追加できる余地を残す。
