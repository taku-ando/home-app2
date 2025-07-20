"use client";

import { useSession } from "next-auth/react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { GroupMember } from "@/domain/models/group_member";
import { client } from "@/lib/rpc-client";
import { clientCookieUtils } from "@/lib/utils/cookie";

interface GroupContextType {
  groups: GroupMember[];
  currentGroup: GroupMember | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refreshGroups: () => Promise<void>;
  switchGroup: (
    groupId: number
  ) => Promise<{ success: boolean; error?: string }>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

interface GroupProviderProps {
  children: ReactNode;
}

export function GroupProvider({ children }: GroupProviderProps) {
  const { data: session, status } = useSession();
  const [groups, setGroups] = useState<GroupMember[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = status === "authenticated" && !!session?.user;

  // 現在のグループオブジェクトを取得
  const currentGroup =
    groups.find((group) => group.groupId === currentGroupId) || null;

  // グループデータを取得する関数
  const fetchGroups = useCallback(async () => {
    // 認証されていない場合は処理をスキップ
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await client.groups.me.$get();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as {
        success: boolean;
        data?: GroupMember[];
        message?: string;
      };

      if (data.success && data.data) {
        setGroups(data.data);

        // 初回ロード時にクッキーからグループIDを読み取り
        const cookieGroupId = clientCookieUtils.getSelectedGroupId();
        if (
          cookieGroupId &&
          data.data.some((g: GroupMember) => g.groupId === cookieGroupId)
        ) {
          setCurrentGroupId(cookieGroupId);
        } else if (data.data.length > 0) {
          // デフォルトグループを設定
          const defaultGroupId = data.data[0].groupId;
          setCurrentGroupId(defaultGroupId);
          clientCookieUtils.setSelectedGroupId(defaultGroupId);
        }
      } else {
        throw new Error(data.message || "Failed to fetch groups");
      }
    } catch (err) {
      console.error("Error fetching user groups:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // グループ切り替え関数
  const switchGroup = useCallback(
    async (groupId: number): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await client.groups.switch.$post({
          json: { groupId },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = (await response.json()) as {
          success: boolean;
          message?: string;
        };

        if (data.success) {
          // ローカル状態を更新
          setCurrentGroupId(groupId);
          clientCookieUtils.setSelectedGroupId(groupId);

          // ページをリロードして変更を反映
          window.location.reload();

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
      fetchGroups();
    }
  }, [fetchGroups, status]);

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

  const value: GroupContextType = {
    groups,
    currentGroup,
    loading,
    error,
    isAuthenticated,
    refreshGroups: fetchGroups,
    switchGroup,
  };

  return (
    <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
  );
}

export function useGroups(): GroupContextType {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error("useGroups must be used within a GroupProvider");
  }
  return context;
}
