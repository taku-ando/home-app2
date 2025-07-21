import { eq } from "drizzle-orm";
import type { CreateUserRequest, User } from "@/lib/schemas";
import type { UserRepository } from "../../domain/repositories/user_repository";
import { users } from "../db/schema";
import type { DrizzleD1DB } from "../db/types";

export class UserRepositoryImpl implements UserRepository {
  constructor(private db: DrizzleD1DB) {}

  async findByGoogleId(googleId: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.googleId, googleId))
      .limit(1);
    return result[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] || null;
  }

  async create(userRequest: CreateUserRequest): Promise<User> {
    const now = new Date();
    const result = await this.db
      .insert(users)
      .values({
        googleId: userRequest.googleId,
        email: userRequest.email,
        name: userRequest.name,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return result[0];
  }
}
