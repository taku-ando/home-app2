import type { CreateInvitationRequest, Invitation } from "@/lib/schemas";
import type { GroupRepository } from "../domain/repositories/group_repository";
import type { InvitationRepository } from "../domain/repositories/invitation_repository";
import type { UserRepository } from "../domain/repositories/user_repository";

export class InvitationUseCase {
  constructor(
    private invitationRepository: InvitationRepository,
    private userRepository: UserRepository,
    private groupRepository: GroupRepository
  ) {}

  async createInvitation(
    invitationRequest: CreateInvitationRequest
  ): Promise<Invitation> {
    // グループの存在確認
    const group = await this.groupRepository.findById(
      invitationRequest.groupId
    );
    if (!group) {
      throw new Error("Group not found");
    }

    // 招待者の存在確認
    const inviter = await this.userRepository.findById(
      invitationRequest.invitedBy
    );
    if (!inviter) {
      throw new Error("Inviter not found");
    }

    // 既に招待済みかチェック
    const existingInvitation = await this.invitationRepository.findByEmail(
      invitationRequest.email
    );
    if (existingInvitation) {
      throw new Error("User is already invited");
    }

    // 既にユーザーとして登録済みかチェック
    const existingUser = await this.userRepository.findByEmail(
      invitationRequest.email
    );
    if (existingUser) {
      throw new Error("User is already registered");
    }

    return await this.invitationRepository.create(invitationRequest);
  }

  async getInvitationById(id: number): Promise<Invitation | null> {
    return await this.invitationRepository.findById(id);
  }

  async getInvitationsByGroupId(groupId: number): Promise<Invitation[]> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    return await this.invitationRepository.findByGroupId(groupId);
  }

  async getAllInvitations(): Promise<Invitation[]> {
    return await this.invitationRepository.findAll();
  }

  async deleteInvitation(id: number): Promise<boolean> {
    const invitation = await this.invitationRepository.findById(id);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    return await this.invitationRepository.delete(id);
  }

  async getPendingInvitationByEmail(email: string): Promise<Invitation | null> {
    return await this.invitationRepository.findPendingByEmail(email);
  }
}
