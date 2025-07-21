import { z } from "zod";

export const groupMemberSchema = z.object({
  id: z.number().int().positive(),
  groupId: z.number().int().positive(),
  userId: z.number().int().positive(),
  role: z.enum(["system", "admin", "member"]),
  joinedAt: z.date(),
});

export const createGroupMemberSchema = z.object({
  groupId: z.number().int().positive(),
  userId: z.number().int().positive(),
  role: z.enum(["system", "admin", "member"]).default("member"),
});

export const updateGroupMemberSchema = z.object({
  role: z.enum(["system", "admin", "member"]).optional(),
});

export type GroupMember = z.infer<typeof groupMemberSchema>;
export type CreateGroupMemberRequest = z.infer<typeof createGroupMemberSchema>;
export type UpdateGroupMemberRequest = z.infer<typeof updateGroupMemberSchema>;
export type GroupMemberRole = "system" | "admin" | "member";
