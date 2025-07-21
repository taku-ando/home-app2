import type {
  CreateGroupRequest,
  Group,
  UpdateGroupRequest,
} from "../domain/models/group";
import type {
  CreateGroupMemberRequest,
  GroupMember,
} from "../domain/models/group_member";
import type { GroupMemberRepository } from "../domain/repositories/group_member_repository";
import type { GroupRepository } from "../domain/repositories/group_repository";
import type { UserRepository } from "../domain/repositories/user_repository";

export class GroupUseCase {
  constructor(
    private groupRepository: GroupRepository,
    private groupMemberRepository: GroupMemberRepository,
    private userRepository: UserRepository
  ) {}

  async getGroupById(id: number): Promise<Group | null> {
    return await this.groupRepository.findById(id);
  }

  async getGroupsByCreatedBy(createdBy: number): Promise<Group[]> {
    return await this.groupRepository.findByCreatedBy(createdBy);
  }

  async getActiveGroups(): Promise<Group[]> {
    return await this.groupRepository.findActiveGroups();
  }

  async createGroup(groupRequest: CreateGroupRequest): Promise<Group> {
    const creator = await this.userRepository.findById(groupRequest.createdBy);
    if (!creator) {
      throw new Error("Creator user not found");
    }

    const group = await this.groupRepository.create(groupRequest);

    // グループ作成者を自動的にadminとして追加
    const memberRequest: CreateGroupMemberRequest = {
      groupId: group.id,
      userId: groupRequest.createdBy,
      role: "admin",
    };
    await this.groupMemberRepository.create(memberRequest);

    return group;
  }

  async updateGroup(
    id: number,
    groupRequest: UpdateGroupRequest
  ): Promise<Group | null> {
    const existingGroup = await this.groupRepository.findById(id);
    if (!existingGroup) {
      throw new Error("Group not found");
    }

    if (existingGroup.deletedAt) {
      throw new Error("Cannot update deleted group");
    }

    return await this.groupRepository.update(id, groupRequest);
  }

  async deleteGroup(id: number): Promise<boolean> {
    const existingGroup = await this.groupRepository.findById(id);
    if (!existingGroup) {
      throw new Error("Group not found");
    }

    return await this.groupRepository.softDelete(id);
  }

  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    return await this.groupMemberRepository.findByGroupId(groupId);
  }

  async addGroupMember(
    memberRequest: CreateGroupMemberRequest
  ): Promise<GroupMember> {
    const group = await this.groupRepository.findById(memberRequest.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    if (group.deletedAt) {
      throw new Error("Cannot add member to deleted group");
    }

    const user = await this.userRepository.findById(memberRequest.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const existingMember = await this.groupMemberRepository.findByGroupAndUser(
      memberRequest.groupId,
      memberRequest.userId
    );
    if (existingMember) {
      throw new Error("User is already a member of this group");
    }

    return await this.groupMemberRepository.create(memberRequest);
  }

  async removeGroupMember(groupId: number, userId: number): Promise<boolean> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    const member = await this.groupMemberRepository.findByGroupAndUser(
      groupId,
      userId
    );
    if (!member) {
      throw new Error("User is not a member of this group");
    }

    return await this.groupMemberRepository.deleteByGroupAndUser(
      groupId,
      userId
    );
  }

  async getUserGroups(userId: number): Promise<GroupMember[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return await this.groupMemberRepository.findByUserId(userId);
  }

  async isUserInGroup(userId: number, groupId: number): Promise<boolean> {
    return this.groupMemberRepository.isUserInGroup(userId, groupId);
  }
}
