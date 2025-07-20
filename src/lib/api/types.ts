// API共通の型定義

// 成功レスポンスの基本構造
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

// エラーレスポンスの基本構造
export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// ヘルスチェックレスポンス
export interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
  service: string;
  version: string;
  environment: string;
}

// 詳細ヘルスチェックレスポンス
export interface DetailedHealthResponse extends HealthResponse {
  runtime: {
    platform: string;
    node_version: string;
  };
  uptime: number;
  memory: {
    rss?: number;
    heapTotal?: number;
    heapUsed?: number;
    external?: number;
    arrayBuffers?: number;
  };
}

// DBヘルスチェックレスポンス
export interface DbHealthResponse extends HealthResponse {
  database: {
    connected: boolean;
    query_time_ms: number;
    families_count: number;
    families_data: Array<{
      id: number;
      name: string | null;
    }>;
  };
}

// HTTPステータスコード
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

// Cloudflare Workers環境変数の型定義
export interface CloudflareEnv {
  NODE_ENV?: string;
  AUTH_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}

// ユーザー関連のAPI型定義
export interface UserResponse {
  id: number;
  googleId: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  googleId: string;
  email: string;
  name: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

// グループ関連のAPI型定義
export interface GroupResponse {
  id: number;
  name: string;
  createdBy: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupRequest {
  name: string;
  createdBy: number;
}

export interface UpdateGroupRequest {
  name?: string;
}

// グループメンバー関連のAPI型定義
export interface GroupMemberResponse {
  id: number;
  groupId: number;
  userId: number;
  role: "system" | "admin" | "member";
  joinedAt: string;
}

export interface CreateGroupMemberRequest {
  groupId: number;
  userId: number;
  role?: "system" | "admin" | "member";
}

export interface UpdateGroupMemberRequest {
  role?: "system" | "admin" | "member";
}

// 招待関連のAPI型定義
export interface InvitationApiResponse {
  id: number;
  email: string;
  groupId: number;
  invitedBy: number;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  updatedAt: string;
}

export interface InvitationApiRequest {
  email: string;
  groupId: number;
  invitedBy: number;
}
