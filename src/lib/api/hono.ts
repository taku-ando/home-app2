import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { apiRoutes } from "./routes";

// Cloudflare Workers環境用の型定義
type Bindings = Record<string, unknown>;

// Honoアプリケーションを作成
export const app = new Hono<{ Bindings: Bindings }>();

// CORS設定
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://*.workers.dev"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

// ログ出力設定
app.use("*", logger());

// APIルートを追加
app.route("/", apiRoutes);

// 基本エラーハンドリング
app.onError((err, c) => {
  console.error("API Error:", err);
  return c.json(
    {
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    },
    500
  );
});

// 404ハンドリング
app.notFound((c) => {
  return c.json(
    { error: "Not Found", message: "The requested endpoint was not found" },
    404
  );
});

export default app;
export type AppType = typeof apiRoutes;
