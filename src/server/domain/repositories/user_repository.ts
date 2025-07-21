import type { CreateUserRequest, UpdateUserRequest, User } from "@/lib/schemas";

export interface UserRepository {
  findById(id: number): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: CreateUserRequest): Promise<User>;
  update(id: number, user: UpdateUserRequest): Promise<User | null>;
  delete(id: number): Promise<boolean>;
  findAll(): Promise<User[]>;
}
