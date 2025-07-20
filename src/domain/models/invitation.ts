export type InvitationStatus = "pending" | "accepted";

export interface Invitation {
  id: number;
  email: string;
  groupId: number;
  invitedBy: number;
  status: InvitationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvitationRequest {
  email: string;
  groupId: number;
  invitedBy: number;
}

export interface UpdateInvitationRequest {
  status?: InvitationStatus;
}
