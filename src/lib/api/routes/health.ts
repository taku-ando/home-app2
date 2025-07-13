import { Hono } from "hono";
import type { DetailedHealthResponse, HealthResponse } from "../types";
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
