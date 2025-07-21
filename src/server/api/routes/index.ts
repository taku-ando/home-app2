import { Hono } from "hono";
import { groupsRoutes } from "./groups";
import { healthRoutes } from "./health";
import invitationsRoutes from "./invitations";
import { usersRoutes } from "./users";

// APIルートをまとめるためのメインルーター
export const apiRoutes = new Hono()
  .route("/health", healthRoutes)
  .route("/users", usersRoutes)
  .route("/groups", groupsRoutes)
  .route("/invitations", invitationsRoutes);

export default apiRoutes;
export type ApiRoutesType = typeof apiRoutes;
