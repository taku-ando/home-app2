"use client";

import { AlertCircle, ChevronDown, Loader2, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCurrentGroup } from "@/hooks/useCurrentGroup";
import type { GroupMember } from "@/server/domain/models/group_member";

interface GroupSelectorProps {
  className?: string;
}

export default function GroupSelector({ className }: GroupSelectorProps) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const { groups, currentGroup, loading, error, switchGroup } =
    useCurrentGroup();

  const handleGroupSwitch = async (groupId: number) => {
    if (switching || groupId === currentGroup?.groupId) {
      return;
    }

    setSwitching(true);
    try {
      const result = await switchGroup(groupId);
      if (!result.success) {
        console.error("Failed to switch group:", result.error);
        // エラー処理（必要に応じてトーストやアラートを表示）
      }
    } catch (err) {
      console.error("Error during group switch:", err);
    } finally {
      setSwitching(false);
      setOpen(false);
    }
  };

  // ローディング中
  if (loading) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-500">読み込み中...</span>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 ${className}`}>
        <AlertCircle className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-500">エラー: {error}</span>
      </div>
    );
  }

  // グループが存在しない場合
  if (groups.length === 0) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 ${className}`}>
        <Users className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">グループなし</span>
      </div>
    );
  }

  // 現在のグループが見つからない場合
  if (!currentGroup) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 ${className}`}>
        <AlertCircle className="h-4 w-4 text-orange-500" />
        <span className="text-sm text-orange-500">
          グループを選択してください
        </span>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className={`justify-between ${className}`}
          disabled={switching}
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="truncate">{getGroupName(currentGroup)}</span>
          </div>
          {switching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronDown className="h-4 w-4 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2">
        <div className="space-y-1">
          <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
            所属グループ
          </div>
          {groups.map((group) => (
            <Button
              key={group.id}
              variant={
                group.groupId === currentGroup.groupId ? "secondary" : "ghost"
              }
              className="w-full justify-start"
              onClick={() => handleGroupSwitch(group.groupId)}
              disabled={switching}
            >
              <div className="flex items-center gap-2 w-full">
                <Users className="h-4 w-4" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{getGroupName(group)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {getRoleDisplayName(group.role)}
                  </div>
                </div>
                {group.groupId === currentGroup.groupId && (
                  <div className="text-xs text-green-600 dark:text-green-400">
                    選択中
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * グループ名を取得
 */
function getGroupName(group: GroupMember): string {
  return group.groupName || `グループ ${group.groupId}`;
}

/**
 * ロール名の表示用変換
 */
function getRoleDisplayName(role: string): string {
  switch (role) {
    case "system":
      return "システム";
    case "admin":
      return "管理者";
    case "member":
      return "メンバー";
    default:
      return role;
  }
}
