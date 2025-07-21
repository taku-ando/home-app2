import type { GroupMemberRepository } from "../domain/repositories/group_member_repository";

export class GroupUseCase {
  constructor(private groupMemberRepository: GroupMemberRepository) {}

  async isUserInGroup(userId: number, groupId: number): Promise<boolean> {
    return await this.groupMemberRepository.isUserInGroup(userId, groupId);
  }
}
