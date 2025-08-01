import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { DataResponse, ErrorResponse } from "@/lib/schemas";
import { HTTP_STATUS } from "./constants";
import { DIContainer } from "./di/container";
import { checkGroupAuth, type GroupAuthResult } from "./group-auth";
import { getDb } from "./infrastructure/db";

// 成功レスポンスのヘルパー関数
export function createSuccessResponse<T>(
  data: T,
  message?: string
): DataResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

// エラーレスポンスのヘルパー関数
export function createErrorResponse(
  error: string,
  message: string,
  code?: string,
  details?: Record<string, unknown>
): ErrorResponse {
  return {
    success: false,
    error,
    message,
    code,
    details,
  };
}

// Honoコンテキスト用の成功レスポンス
export function jsonSuccess<T>(
  c: Context,
  data: T,
  message?: string,
  status?: ContentfulStatusCode
) {
  return c.json(createSuccessResponse(data, message), status ?? 200);
}

// Honoコンテキスト用のエラーレスポンス
export function jsonError(
  c: Context,
  error: string,
  message: string,
  status = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  code?: string,
  details?: Record<string, unknown>
) {
  return c.json(createErrorResponse(error, message, code, details), status);
}

// バリデーションエラーのヘルパー
export function validationError(
  c: Context,
  message: string,
  details?: Record<string, unknown>
) {
  return c.json(
    createErrorResponse(
      "ValidationError",
      message,
      "VALIDATION_ERROR",
      details
    ),
    400
  );
}

// 認証エラーのヘルパー
export function authError(c: Context, message: string = "Unauthorized") {
  return c.json(
    createErrorResponse("AuthenticationError", message, "AUTH_ERROR"),
    401
  );
}

// リソースが見つからないエラーのヘルパー
export function notFoundError(
  c: Context,
  message: string = "Resource not found"
) {
  return c.json(
    createErrorResponse("NotFoundError", message, "NOT_FOUND"),
    404
  );
}

// 一般的なエラーハンドラー
export function handleError(c: Context, error: unknown) {
  console.error("API Error:", error);

  if (error instanceof Error) {
    return c.json(
      createErrorResponse(
        "InternalServerError",
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
        "INTERNAL_ERROR"
      ),
      500
    );
  }

  return c.json(
    createErrorResponse(
      "UnknownError",
      "An unknown error occurred",
      "UNKNOWN_ERROR"
    ),
    500
  );
}

// データベース接続とDIコンテナ取得のヘルパー関数
export function getDbContainer(c: Context):
  | { success: false; error: Response }
  | {
      success: true;
      data: { db: ReturnType<typeof getDb>; container: DIContainer };
    } {
  const { env } = getCloudflareContext();
  if (!env.HOME_APP2_DB) {
    return {
      success: false,
      error: c.json(
        {
          success: false,
          error: "Database not configured",
          message: "D1 database binding not found",
        },
        503
      ),
    };
  }

  const db = getDb(env.HOME_APP2_DB);
  const container = new DIContainer(db);

  return {
    success: true,
    data: { db, container },
  };
}

/**
 * データベース接続とグループ認証を同時に行うヘルパー関数
 */
export async function getDbContainerWithGroupAuth(c: Context): Promise<
  | { success: false; error: Response }
  | {
      success: true;
      data: {
        db: ReturnType<typeof getDb>;
        container: DIContainer;
        groupAuth: GroupAuthResult;
      };
    }
> {
  const dbResult = getDbContainer(c);
  if (!dbResult.success) {
    return dbResult;
  }

  const { db, container } = dbResult.data;

  // グループ認証チェック
  const groupAuth = await checkGroupAuth(db);
  if (!groupAuth.isAuthorized) {
    return {
      success: false,
      error: c.json(
        {
          success: false,
          error: "GroupAuthorizationError",
          message: groupAuth.error || "Group authorization failed",
        },
        403
      ),
    };
  }

  return {
    success: true,
    data: { db, container, groupAuth },
  };
}
