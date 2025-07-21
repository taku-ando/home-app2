import { z } from "zod";
import { activitySchema } from "../activity";
import { groupSchema } from "../group";
import { userSchema } from "../user";

// 基本的なレスポンススキーマ
export const baseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});

// データを含むレスポンススキーマ
export const dataResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  baseResponseSchema.extend({
    success: z.literal(true),
    data: dataSchema,
  });

// ページネーション付きレスポンススキーマ
export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  dataResponseSchema(
    z.object({
      items: z.array(itemSchema),
      pagination: z.object({
        page: z.number().int().positive(),
        limit: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        totalPages: z.number().int().nonnegative(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
      }),
    })
  );

// 具体的なレスポンススキーマ
export const userResponseSchema = dataResponseSchema(userSchema);
export const usersResponseSchema = paginatedResponseSchema(userSchema);

export const groupResponseSchema = dataResponseSchema(groupSchema);
export const groupsResponseSchema = paginatedResponseSchema(groupSchema);

export const activityResponseSchema = dataResponseSchema(activitySchema);
export const activitiesResponseSchema = paginatedResponseSchema(activitySchema);

// ヘルスチェック用
export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string().datetime(),
  version: z.string().optional(),
});

// 認証関連
export const authResponseSchema = dataResponseSchema(
  z.object({
    user: userSchema,
    sessionId: z.string().optional(),
  })
);

// 招待関連
export const invitationSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  groupId: z.number().int().positive(),
  groupName: z.string(),
  invitedBy: z.number().int().positive(),
  invitedByName: z.string(),
  token: z.string(),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export const invitationResponseSchema = dataResponseSchema(invitationSchema);
export const invitationsResponseSchema =
  paginatedResponseSchema(invitationSchema);

// 型エクスポート
export type BaseResponse = z.infer<typeof baseResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type DataResponse<T> = BaseResponse & { success: true; data: T };
export type PaginatedResponse<T> = DataResponse<{
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}>;

export type UserResponse = z.infer<typeof userResponseSchema>;
export type UsersResponse = z.infer<typeof usersResponseSchema>;
export type GroupResponse = z.infer<typeof groupResponseSchema>;
export type GroupsResponse = z.infer<typeof groupsResponseSchema>;
export type ActivityResponse = z.infer<typeof activityResponseSchema>;
export type ActivitiesResponse = z.infer<typeof activitiesResponseSchema>;
export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type Invitation = z.infer<typeof invitationSchema>;
export type InvitationResponse = z.infer<typeof invitationResponseSchema>;
export type InvitationsResponse = z.infer<typeof invitationsResponseSchema>;
