import { z } from "zod";

export const invitationSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  groupId: z.number().int().positive(),
  invitedBy: z.number().int().positive(),
  status: z.enum(["pending", "accepted"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createInvitationSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  groupId: z.number().int().positive(),
  invitedBy: z.number().int().positive(),
});

export const updateInvitationSchema = z.object({
  status: z.enum(["pending", "accepted"]).optional(),
});

export type Invitation = z.infer<typeof invitationSchema>;
export type CreateInvitationRequest = z.infer<typeof createInvitationSchema>;
export type UpdateInvitationRequest = z.infer<typeof updateInvitationSchema>;
