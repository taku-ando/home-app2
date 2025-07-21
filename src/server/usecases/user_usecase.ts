import type { CreateUserRequest, User } from "@/lib/schemas";
import type { UserRepository } from "../domain/repositories/user_repository";

export class UserUseCase {
  constructor(private userRepository: UserRepository) {}

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    return await this.userRepository.findByGoogleId(googleId);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async createUser(userRequest: CreateUserRequest): Promise<User> {
    const existingUser = await this.userRepository.findByGoogleId(
      userRequest.googleId
    );
    if (existingUser) {
      throw new Error("User with this Google ID already exists");
    }

    const emailExistingUser = await this.userRepository.findByEmail(
      userRequest.email
    );
    if (emailExistingUser) {
      throw new Error("User with this email already exists");
    }

    return await this.userRepository.create(userRequest);
  }
}
