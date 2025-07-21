export type GroupMemberRole = "system" | "admin" | "member";

export interface GroupMember {
  id: number;
  groupId: number;
  userId: number;
  role: GroupMemberRole;
  joinedAt: Date;
  groupName?: string | null;
}

export interface CreateGroupMemberRequest {
  groupId: number;
  userId: number;
  role?: GroupMemberRole;
}

export interface UpdateGroupMemberRequest {
  role?: GroupMemberRole;
}
