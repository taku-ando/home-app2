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
  // GET /api/v1/groups - 全グループ取得（アクティブのみ）
  .get("/", async (c) => {
    try {
      const container = c.get("diContainer");
      const groupUseCase = container.getGroupUseCase();

      const groups = await groupUseCase.getActiveGroups();
      return jsonSuccess(c, groups, "Active groups retrieved successfully");
    } catch (error) {
      return handleError(c, error);
    }
  })

  // POST /api/v1/groups - グループ作成
  .post("/", async (c) => {
    try {
      const container = c.get("diContainer");
      const groupUseCase = container.getGroupUseCase();

      const body = await c.req.json();
      const { name, createdBy } = body;

      if (!name || !createdBy) {
        return validationError(c, "Name and createdBy are required");
      }

      const group = await groupUseCase.createGroup({ name, createdBy });
      return jsonSuccess(c, group, "Group created successfully", 201);
    } catch (error) {
      return handleError(c, error);
    }
  })

  // GET /api/v1/groups/me - ログインユーザーの所属グループ一覧取得
  .get("/me", async (c) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return authError(c, "User not authenticated");
      }

      const userId = parseInt(session.user.id);
      if (Number.isNaN(userId)) {
        return validationError(c, "Invalid user ID in session");
      }

      const container = c.get("diContainer");
      const groupUseCase = container.getGroupUseCase();
      const userGroups = await groupUseCase.getUserGroups(userId);

      return jsonSuccess(c, userGroups, "User groups retrieved successfully");
    } catch (error) {
      return handleError(c, error);
    }
  })

  // GET /api/v1/groups/:id - 特定グループ取得
  .get("/:id", async (c) => {
    try {
      const id = parseInt(c.req.param("id"));
      if (Number.isNaN(id)) {
        return validationError(c, "Invalid group ID");
      }

      const container = c.get("diContainer");
      const groupUseCase = container.getGroupUseCase();
      const group = await groupUseCase.getGroupById(id);

      if (!group) {
        return c.json({ success: false, error: "Group not found" }, 404);
      }

      return jsonSuccess(c, group, "Group retrieved successfully");
    } catch (error) {
      return handleError(c, error);
    }
  })

  // PUT /api/v1/groups/:id - グループ情報更新
  .put("/:id", async (c) => {
    try {
      const id = parseInt(c.req.param("id"));
      if (Number.isNaN(id)) {
        return validationError(c, "Invalid group ID");
      }

      const body = await c.req.json();
      const { name } = body;

      if (!name) {
        return validationError(c, "Name is required");
      }

      const container = c.get("diContainer");
      const groupUseCase = container.getGroupUseCase();
      const updatedGroup = await groupUseCase.updateGroup(id, { name });

      if (!updatedGroup) {
        return c.json({ success: false, error: "Group not found" }, 404);
      }

      return jsonSuccess(c, updatedGroup, "Group updated successfully");
    } catch (error) {
      return handleError(c, error);
    }
  })

  // DELETE /api/v1/groups/:id - グループ削除（論理削除）
  .delete("/:id", async (c) => {
    try {
      const id = parseInt(c.req.param("id"));
      if (Number.isNaN(id)) {
        return validationError(c, "Invalid group ID");
      }

      const container = c.get("diContainer");
      const groupUseCase = container.getGroupUseCase();
      const deleted = await groupUseCase.deleteGroup(id);

      if (!deleted) {
        return c.json({ success: false, error: "Group not found" }, 404);
      }

      return jsonSuccess(c, { deleted: true }, "Group deleted successfully");
    } catch (error) {
      return handleError(c, error);
    }
  })

  // GET /api/v1/groups/:id/members - グループメンバー一覧取得
  .get("/:id/members", async (c) => {
    try {
      const id = parseInt(c.req.param("id"));
      if (Number.isNaN(id)) {
        return validationError(c, "Invalid group ID");
      }

      const container = c.get("diContainer");
      const groupUseCase = container.getGroupUseCase();
      const members = await groupUseCase.getGroupMembers(id);

      return jsonSuccess(c, members, "Group members retrieved successfully");
    } catch (error) {
      return handleError(c, error);
    }
  })

  // POST /api/v1/groups/:id/members - グループにメンバー追加
  .post("/:id/members", async (c) => {
    try {
      const groupId = parseInt(c.req.param("id"));
      if (Number.isNaN(groupId)) {
        return validationError(c, "Invalid group ID");
      }

      const body = await c.req.json();
      const { userId, role } = body;

      if (!userId) {
        return validationError(c, "UserId is required");
      }

      const container = c.get("diContainer");
      const groupUseCase = container.getGroupUseCase();
      const member = await groupUseCase.addGroupMember({
        groupId,
        userId,
        role,
      });

      return jsonSuccess(c, member, "Member added to group successfully", 201);
    } catch (error) {
      return handleError(c, error);
    }
  })

  // DELETE /api/v1/groups/:groupId/members/:userId - グループからメンバー削除
  .delete("/:groupId/members/:userId", async (c) => {
    try {
      const groupId = parseInt(c.req.param("groupId"));
      const userId = parseInt(c.req.param("userId"));

      if (Number.isNaN(groupId) || Number.isNaN(userId)) {
        return validationError(c, "Invalid group ID or user ID");
      }

      const container = c.get("diContainer");
      const groupUseCase = container.getGroupUseCase();
      const removed = await groupUseCase.removeGroupMember(groupId, userId);

      if (!removed) {
        return c.json(
          { success: false, error: "Member not found in group" },
          404
        );
      }

      return jsonSuccess(
        c,
        { removed: true },
        "Member removed from group successfully"
      );
    } catch (error) {
      return handleError(c, error);
    }
  })

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

      return c.json({ success: true });
    } catch (error) {
      return handleError(c, error);
    }
  });
