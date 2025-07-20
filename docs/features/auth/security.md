# セキュリティ考慮事項

## 概要

認証システムにおけるセキュリティ上の重要な考慮事項と実装されている対策について説明します。

## 認証セキュリティ

### Google OAuth 2.0セキュリティ

#### 1. HTTPS強制
```typescript
// NextAuth設定
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // Cloudflare Workers環境での設定
  providers: [Google],
});
```

#### 2. CSRFトークン保護
- NextAuthが自動的にCSRFトークンを生成・検証
- セッション状態の改ざんを防止

#### 3. state パラメータ検証
- OAuth2.0のstateパラメータによるリプレイ攻撃防止
- NextAuthが自動的に処理

### セッション管理

#### 1. JWTトークンセキュリティ
```typescript
declare module "next-auth/jwt" {
  interface JWT {
    googleId?: string; // 最小限の情報のみ格納
  }
}
```

#### 2. セッション期限管理
```typescript
// セッション設定（推奨値）
{
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24時間
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24時間
  }
}
```

## データベースセキュリティ

### 1. データ整合性

#### 制約によるデータ保護
```sql
-- Google IDの一意性保証
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id TEXT UNIQUE NOT NULL, -- 重複防止
  email TEXT NOT NULL,            -- NULL値防止
  name TEXT NOT NULL              -- NULL値防止
);
```

#### Drizzle ORMでの制約実装
```typescript
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  googleId: text("google_id").unique().notNull(), // 一意性 + 非NULL
  email: text("email").notNull(),                 // 非NULL
  name: text("name").notNull(),                   // 非NULL
});
```

### 2. SQLインジェクション対策

#### パラメータ化クエリの使用
```typescript
// 安全なクエリ実装例
async findByGoogleId(googleId: string): Promise<User | null> {
  const result = await this.db.select()
    .from(users)
    .where(eq(users.googleId, googleId)) // 自動エスケープ
    .limit(1);
  return result[0] || null;
}
```

### 3. データアクセス制御

#### Repository パターンによる制御
```typescript
// UserRepository インターフェースで制御
export interface UserRepository {
  findById(id: number): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  // 削除機能は慎重に制限
  delete(id: number): Promise<boolean>;
}
```

## 入力値検証

### 1. プロファイル情報の検証

```typescript
// 必須フィールドの検証
if (!profile.sub || !profile.email || !profile.name) {
  console.error("Missing required profile information");
  return false;
}
```

### 2. メールアドレス形式の検証

```typescript
// 将来的な実装例
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(profile.email)) {
  throw new Error("Invalid email format");
}
```

### 3. 文字列長制限

```typescript
// データベーススキーマでの制限
export const users = sqliteTable("users", {
  googleId: text("google_id", { length: 255 }).unique().notNull(),
  email: text("email", { length: 255 }).notNull(),
  name: text("name", { length: 100 }).notNull(),
});
```

## エラーハンドリングとログ

### 1. セキュアなエラー情報

```typescript
// 本番環境での安全なエラーメッセージ
if (error instanceof Error) {
  return c.json(
    createErrorResponse(
      "InternalServerError",
      process.env.NODE_ENV === "development"
        ? error.message        // 開発環境：詳細情報
        : "Something went wrong", // 本番環境：汎用メッセージ
      "INTERNAL_ERROR"
    ),
    500
  );
}
```

### 2. セキュリティイベントのログ

```typescript
// セキュリティ関連イベントのログ出力
console.error("Authentication error:", {
  timestamp: new Date().toISOString(),
  event: "authentication_failure",
  userAgent: request.headers.get("user-agent"),
  ip: request.headers.get("cf-connecting-ip"),
  // 個人情報は記録しない
});
```

## 環境変数管理

### 1. 機密情報の分離

```bash
# .env.local または Cloudflare環境変数
AUTH_SECRET=your-auth-secret-key        # 32文字以上の強力なキー
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. 環境別設定

```typescript
// 環境変数の型定義
export interface CloudflareEnv {
  NODE_ENV?: string;
  AUTH_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}
```

## API セキュリティ

### 1. レート制限

```typescript
// 将来的な実装例（Cloudflare Workers）
const rateLimiter = {
  windowMs: 15 * 60 * 1000, // 15分
  max: 100 // 最大100リクエスト
};
```

### 2. CORS設定

```typescript
// CORS設定例
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://*.workers.dev"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
```

### 3. セキュリティヘッダー

```typescript
// セキュリティヘッダーの設定例
app.use("*", async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("X-XSS-Protection", "1; mode=block");
});
```

## 監査とモニタリング

### 1. アクセスログ

```typescript
// ユーザーアクセスの記録
const auditLog = {
  userId: user.id,
  action: "login",
  timestamp: new Date().toISOString(),
  ipAddress: request.headers.get("cf-connecting-ip"),
  userAgent: request.headers.get("user-agent"),
};
```

### 2. 異常検知

```typescript
// 異常なアクセスパターンの検知例
const loginAttempts = await getLoginAttempts(googleId, timeWindow);
if (loginAttempts > threshold) {
  // アラート送信またはアカウント一時停止
  await sendSecurityAlert(user.id, "suspicious_login_pattern");
}
```

## データプライバシー

### 1. 最小権限の原則

```typescript
// 必要最小限の情報のみ保存
const createUserRequest: CreateUserRequest = {
  googleId: profile.sub,    // 必須: 一意識別子
  email: profile.email,     // 必須: 連絡先
  name: profile.name,       // 必須: 表示名
  // profile.picture は保存しない（プライバシー配慮）
};
```

### 2. データ保持期間

```typescript
// データ保持ポリシーの例
const DATA_RETENTION_POLICY = {
  activeUsers: "indefinite",        // アクティブユーザー: 無期限
  inactiveUsers: "2_years",         // 非アクティブユーザー: 2年
  auditLogs: "1_year",             // 監査ログ: 1年
  errorLogs: "3_months",           // エラーログ: 3ヶ月
};
```

## セキュリティチェックリスト

### 実装時チェック項目

- [ ] HTTPS通信の強制
- [ ] 入力値検証の実装
- [ ] SQLインジェクション対策
- [ ] XSS対策
- [ ] CSRF対策
- [ ] 適切なエラーハンドリング
- [ ] セキュリティログの実装
- [ ] 機密情報の環境変数化
- [ ] データベース制約の設定
- [ ] セッション管理の適切な実装

### 運用時チェック項目

- [ ] 定期的なセキュリティ監査
- [ ] 異常アクセスの監視
- [ ] ログの定期確認
- [ ] 依存関係の脆弱性チェック
- [ ] バックアップの動作確認
- [ ] インシデント対応手順の整備

## インシデント対応

### 1. セキュリティインシデント検知

```typescript
// 緊急時のアラート
const securityAlert = {
  severity: "high",
  event: "multiple_failed_logins",
  userId: user.id,
  timestamp: new Date().toISOString(),
  details: "5回以上の連続ログイン失敗",
};
```

### 2. 対応手順

1. **即座の対応**
   - 影響範囲の特定
   - 被害の拡大防止
   - 関係者への通知

2. **詳細調査**
   - ログの詳細分析
   - 攻撃手法の特定
   - 影響を受けたデータの確認

3. **復旧作業**
   - システムの修復
   - データの復旧
   - セキュリティ強化

4. **事後対応**
   - インシデントレポート作成
   - 再発防止策の実施
   - 社内教育の実施