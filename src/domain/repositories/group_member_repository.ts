import type {
  CreateGroupMemberRequest,
  GroupMember,
  UpdateGroupMemberRequest,
} from "../models/group_member";

export interface GroupMemberRepository {
  findById(id: number): Promise<GroupMember | null>;
  findByGroupId(groupId: number): Promise<GroupMember[]>;
  findByUserId(userId: number): Promise<GroupMember[]>;
  findByGroupAndUser(
    groupId: number,
    userId: number
  ): Promise<GroupMember | null>;
  create(member: CreateGroupMemberRequest): Promise<GroupMember>;
  update(
    id: number,
    member: UpdateGroupMemberRequest
  ): Promise<GroupMember | null>;
  delete(id: number): Promise<boolean>;
  deleteByGroupAndUser(groupId: number, userId: number): Promise<boolean>;
  isUserInGroup(userId: number, groupId: number): Promise<boolean>;
}
