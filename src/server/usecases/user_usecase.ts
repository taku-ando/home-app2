import type { CreateUserRequest, UpdateUserRequest, User } from "@/lib/schemas";
import type { UserRepository } from "../domain/repositories/user_repository";

export class UserUseCase {
  constructor(private userRepository: UserRepository) {}

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

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

  async updateUser(
    id: number,
    userRequest: UpdateUserRequest
  ): Promise<User | null> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    if (userRequest.email && userRequest.email !== existingUser.email) {
      const emailExistingUser = await this.userRepository.findByEmail(
        userRequest.email
      );
      if (emailExistingUser && emailExistingUser.id !== id) {
        throw new Error("User with this email already exists");
      }
    }

    return await this.userRepository.update(id, userRequest);
  }

  async deleteUser(id: number): Promise<boolean> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    return await this.userRepository.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }
}
