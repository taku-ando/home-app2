import type { CreateUserRequest, User } from "../domain/models/user";
import type { GroupMemberRepository } from "../domain/repositories/group_member_repository";
import type { InvitationRepository } from "../domain/repositories/invitation_repository";
import type { UserRepository } from "../domain/repositories/user_repository";

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string;
}

export class AuthUseCase {
  constructor(
    private userRepository: UserRepository,
    private invitationRepository?: InvitationRepository,
    private groupMemberRepository?: GroupMemberRepository
  ) {}

  async authenticateGoogleUser(profile: GoogleUserProfile): Promise<User> {
    // 1. 既存ユーザーの確認
    const existingUser = await this.userRepository.findByGoogleId(
      profile.googleId
    );

    if (existingUser) {
      // 既存ユーザーの場合、必要に応じて情報を更新
      if (
        existingUser.email !== profile.email ||
        existingUser.name !== profile.name
      ) {
        const updatedUser = await this.userRepository.update(existingUser.id, {
          email: profile.email,
          name: profile.name,
        });
        return updatedUser || existingUser;
      }
      return existingUser;
    }

    // 2. 招待状の確認（招待システムが有効な場合）
    if (this.invitationRepository && this.groupMemberRepository) {
      const invitation = await this.invitationRepository.findPendingByEmail(
        profile.email
      );

      if (!invitation) {
        throw new Error("このメールアドレスは招待されていません");
      }

      // 3. 新規ユーザー作成
      const createUserRequest: CreateUserRequest = {
        googleId: profile.googleId,
        email: profile.email,
        name: profile.name,
      };

      const newUser = await this.userRepository.create(createUserRequest);

      // 4. グループメンバーとして追加
      await this.groupMemberRepository.create({
        groupId: invitation.groupId,
        userId: newUser.id,
        role: "member",
      });

      // 5. 招待状を承認済みに更新
      await this.invitationRepository.acceptInvitation(profile.email);

      return newUser;
    }

    // 招待システムが無効な場合は従来通り
    const createUserRequest: CreateUserRequest = {
      googleId: profile.googleId,
      email: profile.email,
      name: profile.name,
    };

    return await this.userRepository.create(createUserRequest);
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    return await this.userRepository.findByGoogleId(googleId);
  }
}
