# トラブルシューティング

## 概要

認証システムでよく発生する問題とその解決方法について説明します。

## 認証関連の問題

### 1. Google OAuth設定の問題

#### エラー: "OAuth client not found"

**症状**
```
Error: OAuth client not found or invalid client configuration
```

**原因**
- Google Cloud Consoleでの設定不備
- 環境変数の設定ミス

**解決方法**
```bash
# 環境変数の確認
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET

# .env.localの確認
cat .env.local | grep GOOGLE
```

**正しい設定例**
```bash
# .env.local
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
AUTH_SECRET=your-32-character-or-longer-secret-key
```

#### エラー: "redirect_uri_mismatch"

**症状**
```
Error: redirect_uri_mismatch
The redirect URI in the request does not match the ones authorized for the OAuth client.
```

**解決方法**
1. Google Cloud Consoleにアクセス
2. 認証情報 → OAuth 2.0クライアントID → 設定
3. 承認済みのリダイレクトURIに以下を追加:
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-domain.com/api/auth/callback/google
   ```

### 2. NextAuth設定の問題

#### エラー: "Missing AUTH_SECRET"

**症状**
```
[next-auth][error][NO_SECRET] 
Please define a `AUTH_SECRET` environment variable.
```

**解決方法**
```bash
# 強力なシークレットキーを生成
openssl rand -base64 32

# 環境変数に設定
export AUTH_SECRET="generated-secret-key"
```

#### エラー: "Database not configured"

**症状**
```
Authentication error: Database not configured
```

**原因**
- Cloudflare D1データベースの設定不備
- 環境変数`HOME_APP2_DB`の未設定

**解決方法**
```bash
# wrangler.jsonc の確認
cat wrangler.jsonc | grep -A 5 d1_databases

# データベースの作成
wrangler d1 create home-app2-db

# マイグレーションの実行
wrangler d1 migrations apply home-app2-db
```

### 3. セッション関連の問題

#### エラー: "Session user is undefined"

**症状**
```typescript
const { data: session } = useSession();
console.log(session?.user); // undefined
```

**原因**
- セッションコールバックの設定不備
- JWTトークンの問題

**解決方法**
```typescript
// src/auth.ts の確認
async session({ session, token }) {
  if (token.googleId && token.sub) {
    session.user.id = token.sub;
    session.user.googleId = token.googleId as string;
  }
  return session;
}
```

## データベース関連の問題

### 1. マイグレーション失敗

#### エラー: "Table 'users' doesn't exist"

**症状**
```
Error: no such table: users
```

**解決方法**
```bash
# マイグレーションファイルの確認
ls drizzle/

# マイグレーション実行
wrangler d1 migrations apply home-app2-db --local
wrangler d1 migrations apply home-app2-db --remote
```

#### エラー: "UNIQUE constraint failed"

**症状**
```
Error: UNIQUE constraint failed: users.google_id
```

**原因**
- 同じGoogle IDでの重複登録試行
- データベースの整合性の問題

**解決方法**
```sql
-- 重複データの確認
SELECT google_id, COUNT(*) 
FROM users 
GROUP BY google_id 
HAVING COUNT(*) > 1;

-- 重複データの削除（慎重に実行）
DELETE FROM users 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM users 
  GROUP BY google_id
);
```

### 2. データベース接続の問題

#### エラー: "Failed to connect to D1"

**症状**
```
Error: Failed to connect to Cloudflare D1 database
```

**解決方法**
```bash
# Cloudflareの認証確認
wrangler auth list

# データベース一覧確認
wrangler d1 list

# ローカル開発での確認
wrangler dev --local --persist
```

## 型定義の問題

### 1. TypeScript型エラー

#### エラー: "Property 'googleId' does not exist"

**症状**
```typescript
// TypeScript エラー
session.user.googleId; // Property 'googleId' does not exist
```

**解決方法**
```typescript
// src/types/next-auth.d.ts または src/auth.ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      googleId: string;
    } & DefaultSession["user"];
  }

  interface User {
    googleId: string;
  }
}
```

### 2. Drizzle ORM型エラー

#### エラー: "Type mismatch in schema"

**症状**
```typescript
// 型エラー
const user: User = result[0]; // Type mismatch
```

**解決方法**
```typescript
// スキーマの型定義を確認
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  googleId: text("google_id").unique().notNull(),
  // ...
});

// 型の整合性確認
type DrizzleUser = typeof users.$inferSelect;
type DomainUser = User;
```

## パフォーマンスの問題

### 1. 認証処理の遅延

#### 症状
```
認証処理に5秒以上かかる
```

**原因と解決方法**

1. **データベースクエリの最適化**
```typescript
// 改善前: 全件検索
const users = await db.select().from(users);
const user = users.find(u => u.googleId === googleId);

// 改善後: インデックス使用
const user = await db.select()
  .from(users)
  .where(eq(users.googleId, googleId))
  .limit(1);
```

2. **不要な処理の削除**
```typescript
// 改善前: 毎回更新
await this.userRepository.update(user.id, {
  email: profile.email,
  name: profile.name,
});

// 改善後: 変更がある場合のみ更新
if (user.email !== profile.email || user.name !== profile.name) {
  await this.userRepository.update(user.id, {
    email: profile.email,
    name: profile.name,
  });
}
```

### 2. セッション取得の遅延

#### 解決方法
```typescript
// クライアントサイドでのセッション最適化
import { useSession } from "next-auth/react";

export function UserProfile() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") return <p>Not logged in</p>;
  
  return <p>Welcome {session?.user?.name}</p>;
}
```

## 開発環境での問題

### 1. ローカル開発での認証失敗

#### エラー: "NEXTAUTH_URL not set"

**解決方法**
```bash
# .env.local に追加
NEXTAUTH_URL=http://localhost:3000
```

### 2. Hot Reload時のセッション消失

**解決方法**
```typescript
// next.config.ts での設定
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["next-auth"],
  },
};
```

## 本番環境での問題

### 1. Cloudflare Workers固有の問題

#### エラー: "Edge runtime not supported"

**解決方法**
```typescript
// src/auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // Cloudflare Workers用設定
  providers: [Google],
});
```

### 2. 環境変数の設定

#### Cloudflare Workers環境変数設定
```bash
# Cloudflare環境変数の設定
wrangler secret put AUTH_SECRET
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
```

## ログとデバッグ

### 1. デバッグログの有効化

```typescript
// 開発環境でのデバッグ
if (process.env.NODE_ENV === "development") {
  console.log("Authentication debug:", {
    profile: profile,
    user: user,
    session: session,
  });
}
```

### 2. NextAuthデバッグ

```bash
# 環境変数でデバッグ有効化
NEXTAUTH_DEBUG=1 npm run dev
```

## 緊急時対応

### 1. 認証システム完全停止

**応急処置**
```typescript
// 一時的な認証バイパス（緊急時のみ）
if (process.env.EMERGENCY_BYPASS === "true") {
  return {
    user: { id: "emergency", name: "Emergency User" },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}
```

### 2. データベース障害

**復旧手順**
1. バックアップからの復元
2. 読み取り専用モードでの運用継続
3. データ整合性の確認

```bash
# バックアップからの復元
wrangler d1 execute home-app2-db --file backup.sql
```

## よくある質問（FAQ）

### Q: ユーザーが重複して作成される

**A:** Google IDの一意性制約を確認してください。
```sql
-- 制約の確認
PRAGMA table_info(users);
```

### Q: セッションが頻繁に切れる

**A:** セッションの有効期限設定を確認してください。
```typescript
{
  session: {
    maxAge: 24 * 60 * 60, // 24時間
  }
}
```

### Q: 認証後にリダイレクトされない

**A:** コールバックURLとNextAuth設定を確認してください。
```typescript
// pages/api/auth/[...nextauth].ts
export { GET, POST } from "@/auth";
```

## サポートリソース

- [NextAuth.js ドキュメント](https://next-auth.js.org/)
- [Google OAuth 2.0 ドキュメント](https://developers.google.com/identity/protocols/oauth2)
- [Cloudflare D1 ドキュメント](https://developers.cloudflare.com/d1/)
- [Drizzle ORM ドキュメント](https://orm.drizzle.team/)