import { hc } from "hono/client";
import type { apiRoutes } from "@/lib/api/routes";

export const client = hc<typeof apiRoutes>("/api/v1");
