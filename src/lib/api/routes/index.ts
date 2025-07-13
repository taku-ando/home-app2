import { Hono } from "hono";
import { healthRoutes } from "./health";

// APIルートをまとめるためのメインルーター
export const apiRoutes = new Hono().route("/health", healthRoutes);

export default apiRoutes;
export type ApiRoutesType = typeof apiRoutes;
