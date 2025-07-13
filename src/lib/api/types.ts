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

// Cloudflare Workers環境変数の型定義
export interface CloudflareEnv {
  NODE_ENV?: string;
  AUTH_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}
