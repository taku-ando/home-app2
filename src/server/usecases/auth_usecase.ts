import type { CreateUserRequest, User } from "@/lib/schemas";
import type { UserRepository } from "../domain/repositories/user_repository";

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string;
}

export class AuthUseCase {
  constructor(private userRepository: UserRepository) {}

  async authenticateGoogleUser(profile: GoogleUserProfile): Promise<User> {
    // 1. 既存ユーザーの確認
    const existingUser = await this.userRepository.findByGoogleId(
      profile.googleId
    );

    if (existingUser) {
      return existingUser;
    }

    // 2. 新規ユーザー作成
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
