import { Hono } from "hono";
import { setSelectedGroupId } from "@/lib/utils/server-cookie";
import { auth } from "../../../auth";
import {
  authError,
  handleError,
  jsonSuccess,
  validationError,
} from "../../utils";
import { diMiddleware } from "../middleware/di";

export const groupsRoutes = new Hono()
  .use("*", diMiddleware)
  // POST /api/v1/groups/switch - グループ切り替え
  .post("/switch", async (c) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return authError(c, "User not authenticated");
      }

      const userId = parseInt(session.user.id);
      const body = await c.req.json();
      const { groupId } = body;

      if (!groupId || Number.isNaN(parseInt(groupId))) {
        return validationError(c, "Valid group ID is required");
      }

      const targetGroupId = parseInt(groupId);

      const container = c.get("diContainer");
      const groupUseCase = container.getGroupUseCase();
      const isUserInGroup = await groupUseCase.isUserInGroup(
        userId,
        targetGroupId
      );

      if (!isUserInGroup) {
        return c.json(
          {
            success: false,
            error: "Forbidden",
            message: "You are not a member of the specified group",
          },
          403
        );
      }

      // cookieに新しいグループIDを設定
      await setSelectedGroupId(targetGroupId);

      return jsonSuccess(c, { success: true });
    } catch (error) {
      return handleError(c, error);
    }
  });
