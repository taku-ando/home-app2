import type { Context } from "hono";
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
  status = HTTP_STATUS.OK
) {
  return c.json(createSuccessResponse(data, message), status as 200);
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
  return c.json(createErrorResponse(error, message, code, details), status as 500);
}

// バリデーションエラーのヘルパー
export function validationError(
  c: Context,
  message: string,
  details?: Record<string, unknown>
) {
  return c.json(
    createErrorResponse("ValidationError", message, "VALIDATION_ERROR", details),
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
