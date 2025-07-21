import { Hono } from "hono";
import { groupsRoutes } from "./groups";
import { healthRoutes } from "./health";

// APIルートをまとめるためのメインルーター
export const apiRoutes = new Hono()
  .route("/health", healthRoutes)
  .route("/groups", groupsRoutes);

export default apiRoutes;
export type ApiRoutesType = typeof apiRoutes;
