import type { CreateUserRequest, User } from "../domain/models/user";
import type { UserRepository } from "../domain/repositories/user_repository";

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string;
}

export class AuthUseCase {
  constructor(private userRepository: UserRepository) {}

  async authenticateGoogleUser(profile: GoogleUserProfile): Promise<User> {
    const user = await this.userRepository.findByGoogleId(profile.googleId);

    if (user) {
      // 既存ユーザーの場合、必要に応じて情報を更新
      if (user.email !== profile.email || user.name !== profile.name) {
        const updatedUser = await this.userRepository.update(user.id, {
          email: profile.email,
          name: profile.name,
        });
        return updatedUser || user;
      }
      return user;
    }

    // 新規ユーザーの場合、作成
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
