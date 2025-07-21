import type { DrizzleD1DB } from "../infrastructure/db/types";
import { GroupMemberRepositoryImpl } from "../infrastructure/repositories/group_member_repository_impl";
import { GroupRepositoryImpl } from "../infrastructure/repositories/group_repository_impl";
import { InvitationRepositoryImpl } from "../infrastructure/repositories/invitation_repository_impl";
import { UserRepositoryImpl } from "../infrastructure/repositories/user_repository_impl";
import { AuthUseCase } from "../usecases/auth_usecase";
import { GroupUseCase } from "../usecases/group_usecase";
import { InvitationUseCase } from "../usecases/invitation_usecase";
import { UserUseCase } from "../usecases/user_usecase";

export class DIContainer {
  private db: DrizzleD1DB;

  constructor(db: DrizzleD1DB) {
    this.db = db;
  }

  // Repository インスタンス
  getUserRepository() {
    return new UserRepositoryImpl(this.db);
  }

  getGroupRepository() {
    return new GroupRepositoryImpl(this.db);
  }

  getGroupMemberRepository() {
    return new GroupMemberRepositoryImpl(this.db);
  }

  getInvitationRepository() {
    return new InvitationRepositoryImpl(this.db);
  }

  // UseCase インスタンス
  getUserUseCase() {
    return new UserUseCase(this.getUserRepository());
  }

  getGroupUseCase() {
    return new GroupUseCase(
      this.getGroupRepository(),
      this.getGroupMemberRepository(),
      this.getUserRepository()
    );
  }

  getAuthUseCase() {
    return new AuthUseCase(this.getUserRepository());
  }

  getInvitationUseCase() {
    return new InvitationUseCase(
      this.getInvitationRepository(),
      this.getUserRepository(),
      this.getGroupRepository()
    );
  }
}
