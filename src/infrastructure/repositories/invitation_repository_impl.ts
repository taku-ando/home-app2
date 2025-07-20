import { and, eq } from "drizzle-orm";
import type {
  CreateInvitationRequest,
  Invitation,
  UpdateInvitationRequest,
} from "../../domain/models/invitation";
import type { InvitationRepository } from "../../domain/repositories/invitation_repository";
import { invitations } from "../../lib/db/schema";
import type { DrizzleD1DB } from "../../lib/db/types";

export class InvitationRepositoryImpl implements InvitationRepository {
  constructor(private db: DrizzleD1DB) {}

  async findById(id: number): Promise<Invitation | null> {
    const result = await this.db
      .select()
      .from(invitations)
      .where(eq(invitations.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findByEmail(email: string): Promise<Invitation | null> {
    const result = await this.db
      .select()
      .from(invitations)
      .where(eq(invitations.email, email))
      .limit(1);
    return result[0] || null;
  }

  async findByGroupId(groupId: number): Promise<Invitation[]> {
    return await this.db
      .select()
      .from(invitations)
      .where(eq(invitations.groupId, groupId));
  }

  async findPendingByEmail(email: string): Promise<Invitation | null> {
    const result = await this.db
      .select()
      .from(invitations)
      .where(
        and(eq(invitations.email, email), eq(invitations.status, "pending"))
      )
      .limit(1);
    return result[0] || null;
  }

  async create(
    invitationRequest: CreateInvitationRequest
  ): Promise<Invitation> {
    const now = new Date();
    const result = await this.db
      .insert(invitations)
      .values({
        email: invitationRequest.email,
        groupId: invitationRequest.groupId,
        invitedBy: invitationRequest.invitedBy,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return result[0];
  }

  async update(
    id: number,
    invitationRequest: UpdateInvitationRequest
  ): Promise<Invitation | null> {
    const now = new Date();
    const result = await this.db
      .update(invitations)
      .set({
        ...invitationRequest,
        updatedAt: now,
      })
      .where(eq(invitations.id, id))
      .returning();

    return result[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(invitations)
      .where(eq(invitations.id, id))
      .returning();
    return result.length > 0;
  }

  async findAll(): Promise<Invitation[]> {
    return await this.db.select().from(invitations);
  }

  async acceptInvitation(email: string): Promise<Invitation | null> {
    const now = new Date();
    const result = await this.db
      .update(invitations)
      .set({
        status: "accepted",
        updatedAt: now,
      })
      .where(
        and(eq(invitations.email, email), eq(invitations.status, "pending"))
      )
      .returning();

    return result[0] || null;
  }
}
