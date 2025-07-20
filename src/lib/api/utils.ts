import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Context } from "hono";
import { getDb } from "../db";
import { DIContainer } from "./di/container";
import { type ApiErrorResponse, type ApiResponse, HTTP_STATUS } from "./types";

// 成功レスポンスのヘルパー関数
export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
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
): ApiErrorResponse {
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
  status = 200
) {
  return c.json(createSuccessResponse(data, message), status as never);
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
