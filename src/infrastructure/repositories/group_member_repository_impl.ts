import { and, eq } from "drizzle-orm";
import type {
  CreateGroupMemberRequest,
  GroupMember,
  UpdateGroupMemberRequest,
} from "../../domain/models/group_member";
import type { GroupMemberRepository } from "../../domain/repositories/group_member_repository";
import { groupMembers } from "../../lib/db/schema";
import type { DrizzleD1DB } from "../../lib/db/types";

export class GroupMemberRepositoryImpl implements GroupMemberRepository {
  constructor(private db: DrizzleD1DB) {}

  async findById(id: number): Promise<GroupMember | null> {
    const result = await this.db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findByGroupId(groupId: number): Promise<GroupMember[]> {
    return await this.db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));
  }

  async findByUserId(userId: number): Promise<GroupMember[]> {
    return await this.db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.userId, userId));
  }

  async findByGroupAndUser(
    groupId: number,
    userId: number
  ): Promise<GroupMember | null> {
    const result = await this.db
      .select()
      .from(groupMembers)
      .where(
        and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))
      )
      .limit(1);
    return result[0] || null;
  }

  async create(memberRequest: CreateGroupMemberRequest): Promise<GroupMember> {
    const now = new Date();
    const result = await this.db
      .insert(groupMembers)
      .values({
        groupId: memberRequest.groupId,
        userId: memberRequest.userId,
        role: memberRequest.role || "member",
        joinedAt: now,
      })
      .returning();

    return result[0];
  }

  async update(
    id: number,
    memberRequest: UpdateGroupMemberRequest
  ): Promise<GroupMember | null> {
    const result = await this.db
      .update(groupMembers)
      .set(memberRequest)
      .where(eq(groupMembers.id, id))
      .returning();

    return result[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(groupMembers)
      .where(eq(groupMembers.id, id))
      .returning();
    return result.length > 0;
  }

  async deleteByGroupAndUser(
    groupId: number,
    userId: number
  ): Promise<boolean> {
    const result = await this.db
      .delete(groupMembers)
      .where(
        and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))
      )
      .returning();
    return result.length > 0;
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
