import { getCloudflareContext } from "@opennextjs/cloudflare";
import NextAuth, { type DefaultSession } from "next-auth";
import "next-auth/jwt";
import Google from "next-auth/providers/google";
import { UserRepositoryImpl } from "./infrastructure/repositories/user_repository_impl";
import { getDb } from "./lib/db";
import { AuthUseCase } from "./usecases/auth_usecase";

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

declare module "next-auth/jwt" {
  interface JWT {
    googleId?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [Google],
  callbacks: {
    async signIn({ user, account, profile }): Promise<boolean> {
      if (account?.provider === "google" && profile) {
        try {
          // Cloudflare環境からD1データベースを取得
          const { env } = getCloudflareContext();
          if (!env.HOME_APP2_DB) {
            console.error("Database not configured");
            return false;
          }

          const db = getDb(env.HOME_APP2_DB);
          const userRepository = new UserRepositoryImpl(db);
          const authUseCase = new AuthUseCase(userRepository);

          // Google認証時にユーザー照合・作成
          if (!profile.sub || !profile.email || !profile.name) {
            console.error("Missing required profile information");
            return false;
          }

          const authenticatedUser = await authUseCase.authenticateGoogleUser({
            googleId: profile.sub,
            email: profile.email,
            name: profile.name,
          });

          // ユーザー情報をセッションで使用するために設定
          user.id = authenticatedUser.id.toString();
          user.googleId = authenticatedUser.googleId;

          return true;
        } catch (error) {
          console.error("Authentication error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.googleId = user.googleId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.googleId && token.sub) {
        session.user.id = token.sub;
        session.user.googleId = token.googleId as string;
      }
      return session;
    },
  },
});
