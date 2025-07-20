# データベーススキーマ

## 概要

認証システムで使用するデータベーススキーマの詳細説明です。Cloudflare D1（SQLite）とDrizzle ORMを使用しています。

## テーブル構成

### users テーブル

ユーザーの基本情報を管理するテーブルです。

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id TEXT UNIQUE NOT NULL,     -- GoogleログインのユーザーID
  email TEXT NOT NULL,                -- メールアドレス
  name TEXT NOT NULL,                 -- 表示名
  created_at INTEGER NOT NULL,        -- 作成日時（UNIX timestamp）
  updated_at INTEGER NOT NULL         -- 更新日時（UNIX timestamp）
);
```

#### フィールド詳細

| フィールド名 | 型 | 制約 | 説明 |
|-------------|-----|------|------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | ユーザーの一意識別子 |
| google_id | TEXT | UNIQUE, NOT NULL | Google OAuthのユーザーID（sub claim） |
| email | TEXT | NOT NULL | ユーザーのメールアドレス |
| name | TEXT | NOT NULL | ユーザーの表示名 |
| created_at | INTEGER | NOT NULL | レコード作成日時（UNIX timestamp） |
| updated_at | INTEGER | NOT NULL | レコード更新日時（UNIX timestamp） |

#### インデックス

```sql
-- Google IDによる検索用（UNIQUE制約により自動作成）
CREATE UNIQUE INDEX idx_users_google_id ON users(google_id);

-- メールアドレスによる検索用（将来的な拡張のため）
CREATE INDEX idx_users_email ON users(email);
```

## Drizzle ORMスキーマ定義

### usersテーブル定義

```typescript
// src/lib/db/schema.ts
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  googleId: text("google_id").unique().notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$default(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$default(() => new Date()),
});
```

### リレーション定義

```typescript
export const usersRelations = relations(users, ({ many }) => ({
  createdGroups: many(groups),
  groupMemberships: many(groupMembers),
}));
```

## 関連テーブル

### groups テーブル

ユーザーが作成するグループを管理します。

```typescript
export const groups = sqliteTable("groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdBy: integer("created_by").notNull().references(() => users.id),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$default(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$default(() => new Date()),
});
```

### group_members テーブル

ユーザーとグループの多対多関係を管理します。

```typescript
export const groupMembers = sqliteTable(
  "group_members",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    groupId: integer("group_id").notNull().references(() => groups.id),
    userId: integer("user_id").notNull().references(() => users.id),
    role: text("role", { enum: ["admin", "member"] }).notNull().default("member"),
    joinedAt: integer("joined_at", { mode: "timestamp" }).notNull().$default(() => new Date()),
  },
  (table) => ({
    unq: unique().on(table.groupId, table.userId),
  })
);
```

## マイグレーション

### 初期マイグレーション

```sql
-- 001_create_users_table.sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- インデックス作成
CREATE INDEX idx_users_email ON users(email);
```

### Drizzle Kit設定

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  driver: "d1",
  dbCredentials: {
    wranglerConfigPath: "./wrangler.jsonc",
    dbName: "home-app2-db",
  },
} satisfies Config;
```

## データ型マッピング

### TypeScript ↔ SQLite

| TypeScript型 | SQLite型 | Drizzle定義 | 説明 |
|-------------|----------|------------|------|
| number | INTEGER | `integer()` | 整数値 |
| string | TEXT | `text()` | 文字列 |
| Date | INTEGER | `integer({ mode: "timestamp" })` | UNIX timestamp |
| boolean | INTEGER | `integer({ mode: "boolean" })` | 0/1で表現 |

### 日時の扱い

```typescript
// Drizzle ORMでは自動的にDate型とUNIX timestampを変換
const user = await db.select().from(users).where(eq(users.id, 1));
console.log(user.createdAt); // Date オブジェクト

// 手動でタイムスタンプを設定する場合
await db.insert(users).values({
  googleId: "google_123",
  email: "user@example.com", 
  name: "Test User",
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

## パフォーマンス考慮事項

### インデックス戦略

1. **google_id**: UNIQUE制約により自動的にインデックス作成
2. **email**: 将来的な検索機能のためのインデックス
3. **created_at**: 時系列順での取得が必要な場合に追加

### クエリ最適化

```typescript
// 効率的なクエリ例
// Google IDによる検索（インデックス使用）
const user = await db.select()
  .from(users)
  .where(eq(users.googleId, googleId))
  .limit(1);

// メールアドレスによる検索（インデックス使用）
const userByEmail = await db.select()
  .from(users)
  .where(eq(users.email, email))
  .limit(1);
```

## セキュリティ考慮事項

### データベースレベル

1. **UNIQUE制約**: google_idの重複防止
2. **NOT NULL制約**: 必須フィールドの保証
3. **外部キー制約**: データ整合性の保証

### アプリケーションレベル

1. **入力値検証**: メールアドレス形式の検証
2. **SQLインジェクション対策**: Drizzle ORMによる自動エスケープ
3. **機密情報の分離**: パスワードなどの機密情報は別テーブルで管理

## バックアップ・復旧

### Cloudflare D1のバックアップ

```bash
# データベースエクスポート
wrangler d1 export home-app2-db --output backup.sql

# データベースインポート
wrangler d1 execute home-app2-db --file backup.sql
```

### 定期バックアップ戦略

1. **日次バックアップ**: 重要なデータの日次エクスポート
2. **差分バックアップ**: 変更分のみの効率的なバックアップ
3. **災害復旧計画**: データ損失時の復旧手順の策定