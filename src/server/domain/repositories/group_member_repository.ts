import type { GroupMember } from "@/lib/schemas";

export interface GroupMemberRepository {
  findByUserId(userId: number): Promise<GroupMember[]>;
  isUserInGroup(userId: number, groupId: number): Promise<boolean>;
}
