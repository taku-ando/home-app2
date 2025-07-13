import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Hono } from "hono";
import { getDb } from "../../db";
import { families } from "../../db/schema";
import type {
  DbHealthResponse,
  DetailedHealthResponse,
  HealthResponse,
} from "../types";
import { handleError, jsonSuccess } from "../utils";

// ヘルスチェック用のルーター
export const healthRoutes = new Hono();

// GET /api/v1/health - 基本的なヘルスチェック
healthRoutes.get("/", (c) => {
  try {
    const healthInfo: HealthResponse = {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "home-app2-api",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "unknown",
    };

    return jsonSuccess(c, healthInfo, "Service is healthy");
  } catch (error) {
    return handleError(c, error);
  }
});

// GET /api/v1/health/detailed - 詳細なヘルスチェック
healthRoutes.get("/detailed", (c) => {
  try {
    const healthInfo: DetailedHealthResponse = {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "home-app2-api",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "unknown",
      runtime: {
        platform: "cloudflare-workers",
        node_version: process.version || "unknown",
      },
      uptime: process.uptime?.() || 0,
      memory: process.memoryUsage?.() || {
        rss: 0,
        heapTotal: 0,
        heapUsed: 0,
        external: 0,
        arrayBuffers: 0,
      },
    };

    return jsonSuccess(c, healthInfo, "Detailed health information");
  } catch (error) {
    return handleError(c, error);
  }
});

// GET /api/v1/health/db - DB接続チェック
healthRoutes.get("/db", async (c) => {
  try {
    const startTime = Date.now();

    // Cloudflare環境からD1データベースを取得
    const { env } = getCloudflareContext();
    if (!env.HOME_APP2_DB) {
      return c.json(
        {
          success: false,
          error: "Database not configured",
          message: "D1 database binding not found",
        },
        503
      );
    }

    // データベース接続を取得してクエリ実行
    const db = getDb(env.HOME_APP2_DB);
    const familiesData = await db.select().from(families);

    const queryTime = Date.now() - startTime;

    const healthInfo: DbHealthResponse = {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "home-app2-api",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "unknown",
      database: {
        connected: true,
        query_time_ms: queryTime,
        families_count: familiesData.length,
        families_data: familiesData,
      },
    };

    return jsonSuccess(c, healthInfo, "Database connection successful");
  } catch (error) {
    const healthInfo: DbHealthResponse = {
      status: "error",
      timestamp: new Date().toISOString(),
      service: "home-app2-api",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "unknown",
      database: {
        connected: false,
        query_time_ms: 0,
        families_count: 0,
        families_data: [],
      },
    };

    return c.json(
      {
        success: false,
        error: "Database connection failed",
        message:
          error instanceof Error ? error.message : "Unknown database error",
        data: healthInfo,
      },
      503
    );
  }
});
