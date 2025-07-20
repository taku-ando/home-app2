# アクティビティ記録機能 設計仕様書
## 概要
家族向け情報共有アプリの機能として、「最後にいつ○○をしたか」を記録・管理する機能

- **機能名**: アクティビティ記録（Activities）
- **URL**: `/activities`
- **データベース**: Cloudflare D1 (SQLite)

## 基本仕様

### 機能の目的
- 定期的なタスク（洗車、掃除など）や体験（温泉、帰省など）の記録
- 期限管理による視覚的な優先度表示
- 家族間での情報共有

### 記録データ
- **実行日時**（必須）
- **コメント・メモ**（任意）
- **公開設定**（グループ共有 or プライベート）
- **期限設定**（○日ごと、または期限なし）
- **絵文字**（視認性向上のため、任意設定）

### 期限管理・表示
- **強調表示**: 経過割合ベース
  - グリーン: 0-70%経過
  - イエロー: 70-100%経過  
  - レッド: 100%超過（期限切れ）
- **デフォルト並び順**: レッド → イエロー → グリーン
- **並び替えオプション**: 登録日順、名前順

### 主要機能
- **クイック登録**: 「記録する」ボタンで当日ログを即座に追加
- **繰り返し機能**: 最新ログの実行日時と期限設定から次回期限をリアルタイム計算
- **履歴確認**: アクティビティ詳細ページで過去の記録を一覧表示
- **タグ機能**: アクティビティに複数のタグを付与、検索・フィルタリング可能
- **絵文字機能**: アクティビティの視認性向上のための絵文字設定

### 権限管理
- **グループ共有**: そのグループのメンバー全員が編集・削除可能
- **プライベート**: 作成者のみが編集・削除可能（グループ内での個人タスク）
- **マルチグループ**: 1ユーザーが複数グループに所属可能

### 削除ルール
- **グループ削除**: 論理削除でデータ保持
- **ユーザーのグループ脱退**: 該当ユーザーが作成したプライベートアクティビティを一緒に削除
- **アクティビティ削除**: 論理削除でログも残す

## 機能仕様詳細

### 繰り返し機能の動作
1. **ログ登録**: 実際に完了したときに `activity_logs` にレコード追加
2. **期限計算**: 最新ログの `executed_at` + `activities.interval_days` で次回期限を算出
3. **表示更新**: 計算結果に基づいて色分け表示
4. **auto_repeat フラグ**: 主にUI制御用（「やった」ボタンの表示制御など）

### プライベート機能
- 全てのアクティビティは必ずいずれかのグループに所属
- プライベートアクティビティは「グループ内の個人タスク」として管理
- 完全に個人的な（どのグループにも属さない）タスクは存在しない

### 絵文字機能
- **設定方法**: アクティビティ登録・編集時に絵文字を選択
- **表示**: 一覧画面でアクティビティ名の前に表示
- **任意設定**: 絵文字なしでも登録可能
- **目的**: アクティビティの視認性向上と親しみやすさの向上
### タグ機能
- **管理単位**: グループごとにタグを管理
- **作成方式**: アクティビティ登録・編集時に自由作成
- **サジェスト**: グループ内の登録済みタグから候補表示
- **検索・フィルタ**: タグをキーとした検索・フィルタリング機能
- **未使用タグ**: 削除せずに残して再利用可能

## データベース設計

### 1. users（ユーザー情報）
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  google_id TEXT UNIQUE NOT NULL,     -- GoogleログインのユーザーID
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
```

### 2. groups（グループ情報）
```sql
CREATE TABLE groups (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,                 -- "田中家", "会社の仲間"など
  created_by INTEGER NOT NULL,        -- usersテーブルへの外部キー
  deleted_at DATETIME,                -- 論理削除用
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 3. group_members（グループメンバー管理）
```sql
CREATE TABLE group_members (
  id INTEGER PRIMARY KEY,
  group_id INTEGER NOT NULL,          -- groupsテーブルへの外部キー
  user_id INTEGER NOT NULL,           -- usersテーブルへの外部キー
  role TEXT NOT NULL DEFAULT 'member', -- 'admin' | 'member'
  joined_at DATETIME NOT NULL,
  UNIQUE (group_id, user_id),         -- 複合ユニークキー
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 4. activities（アクティビティマスター）
```sql
CREATE TABLE activities (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT,                         -- 絵文字（NULL可）
  group_id INTEGER NOT NULL,          -- groupsテーブルへの外部キー
  created_by INTEGER NOT NULL,        -- usersテーブルへの外部キー
  is_private BOOLEAN NOT NULL DEFAULT 0, -- プライベートフラグ
  interval_days INTEGER,              -- 期限（○日ごと、NULL=期限なし）
  auto_repeat BOOLEAN NOT NULL DEFAULT 0, -- 繰り返し機能
  deleted_at DATETIME,                -- 論理削除用
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 5. activity_logs（実行ログ）
```sql
CREATE TABLE activity_logs (
  id INTEGER PRIMARY KEY,
  activity_id INTEGER NOT NULL,       -- activitiesテーブルへの外部キー
  executed_at DATETIME NOT NULL,      -- 実行日時（ユーザー指定）
  comment TEXT,                       -- コメント・メモ（NULL可）
  created_by INTEGER NOT NULL,        -- usersテーブルへの外部キー（ログ作成者）
  created_at DATETIME NOT NULL,       -- ログ作成日時
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (activity_id) REFERENCES activities(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 6. tags（タグマスター）
```sql
CREATE TABLE tags (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  group_id INTEGER NOT NULL,          -- groupsテーブルへの外部キー
  created_by INTEGER NOT NULL,        -- usersテーブルへの外部キー
  created_at DATETIME NOT NULL,
  UNIQUE (name, group_id),            -- グループ内でタグ名の重複防止
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 7. activity_tags（アクティビティとタグの関連）
```sql
CREATE TABLE activity_tags (
  id INTEGER PRIMARY KEY,
  activity_id INTEGER NOT NULL,       -- activitiesテーブルへの外部キー
  tag_id INTEGER NOT NULL,            -- tagsテーブルへの外部キー
  created_at DATETIME NOT NULL,
  UNIQUE (activity_id, tag_id),       -- 重複防止
  FOREIGN KEY (activity_id) REFERENCES activities(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);
```

## インデックス設計

### パフォーマンス向上のためのインデックス
```sql
-- activity_logsの検索最適化
CREATE INDEX idx_activity_logs_on_activity_id ON activity_logs(activity_id);

-- 最新ログの高速取得
CREATE INDEX idx_activity_logs_on_activity_id_and_executed_at 
ON activity_logs(activity_id, executed_at DESC);

-- グループメンバーの検索最適化
CREATE INDEX idx_group_members_on_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_on_group_id ON group_members(group_id);

-- アクティビティの検索最適化
CREATE INDEX idx_activities_on_group_id ON activities(group_id);
CREATE INDEX idx_activities_on_created_by ON activities(created_by);

-- タグ機能の検索最適化
CREATE INDEX idx_tags_on_group_id ON tags(group_id);
CREATE INDEX idx_activity_tags_on_tag_id ON activity_tags(tag_id);
CREATE INDEX idx_activity_tags_on_activity_id ON activity_tags(activity_id);

-- 論理削除対応
CREATE INDEX idx_groups_on_deleted_at ON groups(deleted_at);
CREATE INDEX idx_activities_on_deleted_at ON activities(deleted_at);
```

## 認証
- **Google OAuth**: `google_id`でユーザー識別
- **マルチグループ対応**: ユーザーは複数のグループに参加可能

## 技術仕様
- **データベース**: Cloudflare D1 (SQLite)
- **論理削除**: `deleted_at` カラムで管理
- **外部キー制約**: データ整合性を保証
- **複合ユニークキー**: 重複データの防止
- **インデックス**: 検索パフォーマンスの最適化
