import type {
  CreateInvitationRequest,
  Invitation,
  UpdateInvitationRequest,
} from "../models/invitation";

export interface InvitationRepository {
  findById(id: number): Promise<Invitation | null>;
  findByEmail(email: string): Promise<Invitation | null>;
  findByGroupId(groupId: number): Promise<Invitation[]>;
  findPendingByEmail(email: string): Promise<Invitation | null>;
  create(invitation: CreateInvitationRequest): Promise<Invitation>;
  update(
    id: number,
    invitation: UpdateInvitationRequest
  ): Promise<Invitation | null>;
  delete(id: number): Promise<boolean>;
  findAll(): Promise<Invitation[]>;
  acceptInvitation(email: string): Promise<Invitation | null>;
}
