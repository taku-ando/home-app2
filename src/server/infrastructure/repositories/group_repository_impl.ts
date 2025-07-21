import { eq, isNull } from "drizzle-orm";
import type {
  CreateGroupRequest,
  Group,
  UpdateGroupRequest,
} from "@/lib/schemas";
import type { GroupRepository } from "../../domain/repositories/group_repository";
import { groups } from "../db/schema";
import type { DrizzleD1DB } from "../db/types";

export class GroupRepositoryImpl implements GroupRepository {
  constructor(private db: DrizzleD1DB) {}

  async findById(id: number): Promise<Group | null> {
    const result = await this.db
      .select()
      .from(groups)
      .where(eq(groups.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findByCreatedBy(createdBy: number): Promise<Group[]> {
    return await this.db
      .select()
      .from(groups)
      .where(eq(groups.createdBy, createdBy));
  }

  async findActiveGroups(): Promise<Group[]> {
    return await this.db.select().from(groups).where(isNull(groups.deletedAt));
  }

  async create(groupRequest: CreateGroupRequest): Promise<Group> {
    const now = new Date();
    const result = await this.db
      .insert(groups)
      .values({
        name: groupRequest.name,
        createdBy: groupRequest.createdBy,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return result[0];
  }

  async update(
    id: number,
    groupRequest: UpdateGroupRequest
  ): Promise<Group | null> {
    const now = new Date();
    const result = await this.db
      .update(groups)
      .set({
        ...groupRequest,
        updatedAt: now,
      })
      .where(eq(groups.id, id))
      .returning();

    return result[0] || null;
  }

  async softDelete(id: number): Promise<boolean> {
    const now = new Date();
    const result = await this.db
      .update(groups)
      .set({
        deletedAt: now,
        updatedAt: now,
      })
      .where(eq(groups.id, id))
      .returning();

    return result.length > 0;
  }

  async findAll(): Promise<Group[]> {
    return await this.db.select().from(groups);
  }
}
