"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { client } from "@/lib/rpc-client";
import type { GroupMember } from "@/lib/schemas";
import { clientCookieUtils } from "@/lib/utils/cookie";

/**
 * useCurrentGroup - 現在のグループ管理カスタムフック
 *
 * 主な機能：
 * 1. セッションからグループ一覧を取得
 * 2. 現在選択中のグループの状態管理（クッキーベース）
 * 3. グループ切り替えAPI呼び出し
 * 4. 他のタブでの変更検知とクッキー同期
 */
export function useCurrentGroup() {
  const { data: session, status } = useSession();
  const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = status === "authenticated" && !!session?.user;
  const groups = session?.user?.groups || [];

  // 現在のグループオブジェクトを取得
  const currentGroup =
    groups.find((group) => group.groupId === currentGroupId) || null;

  // セッションからグループデータを読み込んでUI状態を更新する関数
  const loadGroupsFromSession = useCallback(() => {
    // 認証されていない場合は処理をスキップ
    if (!isAuthenticated || !session?.user?.groups) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userGroups = session.user.groups;

      // 初回ロード時にクッキーからグループIDを読み取り
      const cookieGroupId = clientCookieUtils.getSelectedGroupId();
      if (
        cookieGroupId &&
        userGroups.some((g: GroupMember) => g.groupId === cookieGroupId)
      ) {
        setCurrentGroupId(cookieGroupId);
      } else if (userGroups.length > 0) {
        // デフォルトグループを設定
        const defaultGroupId = userGroups[0].groupId;
        setCurrentGroupId(defaultGroupId);
        clientCookieUtils.setSelectedGroupId(defaultGroupId);
      }
    } catch (err) {
      console.error("Error loading groups from session:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, session]);

  // グループ切り替え関数（API呼び出しとクッキー更新）
  const switchGroup = useCallback(
    async (groupId: number): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await client.groups.switch.$post({
          json: { groupId },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          // ローカル状態を更新
          setCurrentGroupId(groupId);
          clientCookieUtils.setSelectedGroupId(groupId);

          return { success: true };
        } else {
          return {
            success: false,
            error: data.message || "Failed to switch group",
          };
        }
      } catch (err) {
        console.error("Error switching group:", err);
        return {
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    },
    []
  );

  // 認証状態が変わった時にデータを取得
  useEffect(() => {
    if (status !== "loading") {
      loadGroupsFromSession();
    }
  }, [loadGroupsFromSession, status]);

  // クッキーの変更を監視（他のタブでの変更を検知）
  useEffect(() => {
    const handleCookieChange = () => {
      const cookieGroupId = clientCookieUtils.getSelectedGroupId();
      if (cookieGroupId !== currentGroupId) {
        setCurrentGroupId(cookieGroupId);
      }
    };

    // クッキーの変更を定期的にチェック（簡易実装）
    const interval = setInterval(handleCookieChange, 1000);

    return () => clearInterval(interval);
  }, [currentGroupId]);

  return {
    groups,
    currentGroup,
    loading,
    error,
    isAuthenticated,
    refreshGroups: loadGroupsFromSession,
    switchGroup,
  };
}
