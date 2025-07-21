import { z } from "zod";
import { activitySchema } from "../activity";
import { createGroupSchema, updateGroupSchema } from "../group";
import { createUserSchema, updateUserSchema } from "../user";

// ユーザー関連のリクエストスキーマ
export const createUserRequestSchema = createUserSchema;
export const updateUserRequestSchema = updateUserSchema;

// グループ関連のリクエストスキーマ
export const createGroupRequestSchema = createGroupSchema;
export const updateGroupRequestSchema = updateGroupSchema;

// アクティビティ関連のリクエストスキーマ
export const createActivityRequestSchema = activitySchema;
export const updateActivityRequestSchema = activitySchema.partial();

// 招待関連のリクエストスキーマ
export const inviteUserRequestSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  groupId: z.number().int().positive(),
});

export const acceptInvitationRequestSchema = z.object({
  token: z.string().min(1, "招待トークンが必要です"),
});

// パジネーションクエリスキーマ
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// 検索クエリスキーマ
export const searchQuerySchema = z
  .object({
    q: z.string().optional(),
    tag: z.string().optional(),
  })
  .merge(paginationQuerySchema);

// 型エクスポート
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;
export type CreateGroupRequest = z.infer<typeof createGroupRequestSchema>;
export type UpdateGroupRequest = z.infer<typeof updateGroupRequestSchema>;
export type CreateActivityRequest = z.infer<typeof createActivityRequestSchema>;
export type UpdateActivityRequest = z.infer<typeof updateActivityRequestSchema>;
export type InviteUserRequest = z.infer<typeof inviteUserRequestSchema>;
export type AcceptInvitationRequest = z.infer<
  typeof acceptInvitationRequestSchema
>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
