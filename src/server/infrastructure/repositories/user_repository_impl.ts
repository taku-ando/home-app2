import { eq } from "drizzle-orm";
import type { CreateUserRequest, UpdateUserRequest, User } from "@/lib/schemas";
import type { UserRepository } from "../../domain/repositories/user_repository";
import { users } from "../db/schema";
import type { DrizzleD1DB } from "../db/types";

export class UserRepositoryImpl implements UserRepository {
  constructor(private db: DrizzleD1DB) {}

  async findById(id: number): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] || null;
  }

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

  async update(
    id: number,
    userRequest: UpdateUserRequest
  ): Promise<User | null> {
    const now = new Date();
    const result = await this.db
      .update(users)
      .set({
        ...userRequest,
        updatedAt: now,
      })
      .where(eq(users.id, id))
      .returning();

    return result[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return result.length > 0;
  }

  async findAll(): Promise<User[]> {
    return await this.db.select().from(users);
  }
}
