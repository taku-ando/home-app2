import type { CreateUserRequest, User } from "@/lib/schemas";

export interface UserRepository {
  findByGoogleId(googleId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: CreateUserRequest): Promise<User>;
}
