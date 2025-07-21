import { and, eq } from "drizzle-orm";
import type { GroupMember } from "@/lib/schemas";
import type { GroupMemberRepository } from "../../domain/repositories/group_member_repository";
import { groupMembers, groups } from "../db/schema";
import type { DrizzleD1DB } from "../db/types";

export class GroupMemberRepositoryImpl implements GroupMemberRepository {
  constructor(private db: DrizzleD1DB) {}

  async findByUserId(userId: number): Promise<GroupMember[]> {
    const result = await this.db
      .select({
        id: groupMembers.id,
        userId: groupMembers.userId,
        groupId: groupMembers.groupId,
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt,
        groupName: groups.name,
      })
      .from(groupMembers)
      .leftJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.userId, userId));

    return result.map((row) => ({
      id: row.id,
      userId: row.userId,
      groupId: row.groupId,
      role: row.role as "system" | "admin" | "member",
      joinedAt: row.joinedAt,
      groupName: row.groupName || `グループ ${row.groupId}`,
    }));
  }

  async isUserInGroup(userId: number, groupId: number): Promise<boolean> {
    const result = await this.db
      .select({ id: groupMembers.id })
      .from(groupMembers)
      .where(
        and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId))
      )
      .limit(1);

    return result.length > 0;
  }
}
