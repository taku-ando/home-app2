import { getCloudflareContext } from "@opennextjs/cloudflare";
import NextAuth, { type DefaultSession } from "next-auth";
import "next-auth/jwt";
import Google from "next-auth/providers/google";
import type { GroupMember } from "./domain/models/group_member";
import { GroupMemberRepositoryImpl } from "./infrastructure/repositories/group_member_repository_impl";
import { InvitationRepositoryImpl } from "./infrastructure/repositories/invitation_repository_impl";
import { UserRepositoryImpl } from "./infrastructure/repositories/user_repository_impl";
import { getDb } from "./lib/db";
import {
  getSelectedGroupId,
  setSelectedGroupId,
} from "./lib/utils/server-cookie";
import { AuthUseCase } from "./usecases/auth_usecase";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      googleId: string;
      groups: GroupMember[];
    } & DefaultSession["user"];
  }

  interface User {
    googleId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    googleId?: string;
    groups?: GroupMember[];
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
          const invitationRepository = new InvitationRepositoryImpl(db);
          const groupMemberRepository = new GroupMemberRepositoryImpl(db);
          const authUseCase = new AuthUseCase(
            userRepository,
            invitationRepository,
            groupMemberRepository
          );

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

          // ユーザーのグループ情報を取得
          const userGroups = await groupMemberRepository.findByUserId(
            authenticatedUser.id
          );

          // デフォルトグループの設定
          const currentGroupId = await getSelectedGroupId();
          if (!currentGroupId && userGroups.length > 0) {
            // まだグループが選択されていない場合、ユーザーの最初のグループを設定
            await setSelectedGroupId(userGroups[0].groupId);
          }

          return true;
        } catch (error) {
          console.error("Authentication error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.googleId = user.googleId;
      }

      // セッション更新時やログイン時にグループ情報を更新
      if (trigger === "update" || (user && token.sub)) {
        try {
          const { env } = getCloudflareContext();
          if (env.HOME_APP2_DB && token.sub) {
            const db = getDb(env.HOME_APP2_DB);
            const groupMemberRepository = new GroupMemberRepositoryImpl(db);
            const userId = parseInt(token.sub);
            if (!Number.isNaN(userId)) {
              const userGroups =
                await groupMemberRepository.findByUserId(userId);
              token.groups = userGroups;
            }
          }
        } catch (error) {
          console.error("Error fetching groups in JWT callback:", error);
          // エラーが発生してもセッションは継続
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.googleId && token.sub) {
        session.user.id = token.sub;
        session.user.googleId = token.googleId as string;
        session.user.groups = token.groups || [];
      }
      return session;
    },
  },
});
