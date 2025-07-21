import { z } from "zod";

export const groupSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  createdBy: z.number().int().positive(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(1, "グループ名を入力してください")
    .max(100, "グループ名は100文字以内で入力してください"),
  createdBy: z.number().int().positive(),
});

export const updateGroupSchema = z.object({
  name: z
    .string()
    .min(1, "グループ名を入力してください")
    .max(100, "グループ名は100文字以内で入力してください")
    .optional(),
});

export type Group = z.infer<typeof groupSchema>;
export type CreateGroupRequest = z.infer<typeof createGroupSchema>;
export type UpdateGroupRequest = z.infer<typeof updateGroupSchema>;
