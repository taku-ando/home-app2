import { hc } from "hono/client";
import type { apiRoutes } from "@/server/api/routes";

export const client = hc<typeof apiRoutes>("/api/v1");
