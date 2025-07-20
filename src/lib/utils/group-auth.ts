import { auth } from "../../auth";
import { GroupMemberRepositoryImpl } from "../../infrastructure/repositories/group_member_repository_impl";
import type { DrizzleD1DB } from "../db/types";
import { getSelectedGroupId } from "./cookie";

/**
 * 現在のユーザーと選択されたグループの権限チェック結果
 */
export interface GroupAuthResult {
  userId: number;
  groupId: number;
  isAuthorized: boolean;
  error?: string;
}

/**
 * ユーザーの認証とグループ権限をチェック
 */
export async function checkGroupAuth(
  db: DrizzleD1DB
): Promise<GroupAuthResult> {
  try {
    // ユーザー認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return {
        userId: 0,
        groupId: 0,
        isAuthorized: false,
        error: "User not authenticated",
      };
    }

    const userId = parseInt(session.user.id);
    if (Number.isNaN(userId)) {
      return {
        userId: 0,
        groupId: 0,
        isAuthorized: false,
        error: "Invalid user ID",
      };
    }

    // 選択されたグループIDを取得
    const groupId = await getSelectedGroupId();
    if (!groupId) {
      return {
        userId,
        groupId: 0,
        isAuthorized: false,
        error: "No group selected",
      };
    }

    // ユーザーがグループに所属しているかチェック
    const groupMemberRepository = new GroupMemberRepositoryImpl(db);
    const isUserInGroup = await groupMemberRepository.isUserInGroup(
      userId,
      groupId
    );

    if (!isUserInGroup) {
      return {
        userId,
        groupId,
        isAuthorized: false,
        error: "User is not a member of the selected group",
      };
    }

    return {
      userId,
      groupId,
      isAuthorized: true,
    };
  } catch (error) {
    console.error("Group auth check failed:", error);
    return {
      userId: 0,
      groupId: 0,
      isAuthorized: false,
      error: "Group authorization check failed",
    };
  }
}

/**
 * 指定されたユーザーが指定されたグループに所属しているかチェック
 */
export async function verifyUserGroupMembership(
  db: DrizzleD1DB,
  userId: number,
  groupId: number
): Promise<boolean> {
  try {
    const groupMemberRepository = new GroupMemberRepositoryImpl(db);
    return await groupMemberRepository.isUserInGroup(userId, groupId);
  } catch (error) {
    console.error("Failed to verify user group membership:", error);
    return false;
  }
}

/**
 * ユーザーが所属している最初のグループIDを取得
 */
export async function getFirstUserGroup(
  db: DrizzleD1DB,
  userId: number
): Promise<number | null> {
  try {
    const groupMemberRepository = new GroupMemberRepositoryImpl(db);
    const userGroups = await groupMemberRepository.findByUserId(userId);

    if (userGroups.length === 0) {
      return null;
    }

    return userGroups[0].groupId;
  } catch (error) {
    console.error("Failed to get first user group:", error);
    return null;
  }
}
