# 認証システム概要

本プロジェクトでは、NextAuth v5とGoogle OAuthを使用した認証システムを実装しています。クリーンアーキテクチャの原則に従い、認証時に自動的にユーザー情報をデータベースに保存・更新する仕組みを提供しています。

## 技術構成

- **認証ライブラリ**: NextAuth v5
- **プロバイダー**: Google OAuth
- **データベース**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **アーキテクチャ**: クリーンアーキテクチャ

## ディレクトリ構成

```
src/
├── auth.ts                           # NextAuth設定ファイル
├── domain/models/user.ts             # Userエンティティ
├── domain/repositories/user_repository.ts # UserRepositoryインターフェース
├── usecases/auth_usecase.ts          # 認証ユースケース
├── infrastructure/repositories/
│   └── user_repository_impl.ts       # UserRepository実装
└── app/api/auth/[...nextauth]/route.ts # NextAuth APIルート
```

## 主要ファイル

- [認証フロー詳細](./authentication-flow.md)
- [データベーススキーマ](./database-schema.md)
- [セキュリティ考慮事項](./security.md)
- [トラブルシューティング](./troubleshooting.md)