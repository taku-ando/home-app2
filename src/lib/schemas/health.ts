import { z } from "zod";

// 基本ヘルスチェックレスポンス
export const healthResponseSchema = z.object({
  status: z.enum(["ok", "error"]),
  timestamp: z.string().datetime(),
  service: z.string(),
  version: z.string(),
  environment: z.string(),
});

// 詳細ヘルスチェックレスポンス
export const detailedHealthResponseSchema = healthResponseSchema.extend({
  runtime: z.object({
    platform: z.string(),
    node_version: z.string(),
  }),
  uptime: z.number(),
  memory: z.object({
    rss: z.number().optional(),
    heapTotal: z.number().optional(),
    heapUsed: z.number().optional(),
    external: z.number().optional(),
    arrayBuffers: z.number().optional(),
  }),
});

// DBヘルスチェックレスポンス
export const dbHealthResponseSchema = healthResponseSchema.extend({
  database: z.object({
    connected: z.boolean(),
    query_time_ms: z.number(),
    families_count: z.number(),
    families_data: z.array(
      z.object({
        id: z.number(),
        name: z.string().nullable(),
      })
    ),
  }),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type DetailedHealthResponse = z.infer<
  typeof detailedHealthResponseSchema
>;
export type DbHealthResponse = z.infer<typeof dbHealthResponseSchema>;
