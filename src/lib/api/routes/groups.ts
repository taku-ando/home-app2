import { Hono } from "hono";
import { getDbContainer, handleError, jsonSuccess } from "../utils";

export const groupsRoutes = new Hono()
  // GET /api/v1/groups - 全グループ取得（アクティブのみ）
  .get("/", async (c) => {
    try {
      const dbResult = getDbContainer(c);
      if (!dbResult.success) {
        return dbResult.error;
      }

      const groupUseCase = dbResult.container.getGroupUseCase();

      const groups = await groupUseCase.getActiveGroups();
      return jsonSuccess(c, groups, "Active groups retrieved successfully");
    } catch (error) {
      return handleError(c, error);
    }
  })

  // POST /api/v1/groups - グループ作成
  .post("/", async (c) => {
    try {
      const dbResult = getDbContainer(c);
      if (!dbResult.success) {
        return dbResult.error;
      }

      const body = await c.req.json();
      const { name, createdBy } = body;

      if (!name || !createdBy) {
        return c.json(
          {
            success: false,
            error: "Name and createdBy are required",
            message: "Name and createdBy are required",
          },
          400
        );
      }

      const groupUseCase = dbResult.container.getGroupUseCase();

      const group = await groupUseCase.createGroup({ name, createdBy });
      return jsonSuccess(c, group, "Group created successfully", 201);
    } catch (error) {
      return handleError(c, error);
    }
  })

  // GET /api/v1/groups/:id - 特定グループ取得
  .get("/:id", async (c) => {
    try {
      const dbResult = getDbContainer(c);
      if (!dbResult.success) {
        return dbResult.error;
      }

      const id = parseInt(c.req.param("id"));
      if (Number.isNaN(id)) {
        return c.json(
          {
            success: false,
            error: "Invalid group ID",
            message: "Invalid group ID",
          },
          400
        );
      }

      const groupUseCase = dbResult.container.getGroupUseCase();

      const group = await groupUseCase.getGroupById(id);
      if (!group) {
        return c.json(
          {
            success: false,
            error: "Group not found",
            message: "Group not found",
          },
          404
        );
      }

      return jsonSuccess(c, group, "Group retrieved successfully");
    } catch (error) {
      return handleError(c, error);
    }
  })

  // PUT /api/v1/groups/:id - グループ情報更新
  .put("/:id", async (c) => {
    try {
      const dbResult = getDbContainer(c);
      if (!dbResult.success) {
        return dbResult.error;
      }

      const id = parseInt(c.req.param("id"));
      if (Number.isNaN(id)) {
        return c.json(
          {
            success: false,
            error: "Invalid group ID",
            message: "Invalid group ID",
          },
          400
        );
      }

      const body = await c.req.json();
      const { name } = body;

      if (!name) {
        return c.json(
          {
            success: false,
            error: "Name is required",
            message: "Name is required",
          },
          400
        );
      }

      const groupUseCase = dbResult.container.getGroupUseCase();

      const updatedGroup = await groupUseCase.updateGroup(id, { name });
      if (!updatedGroup) {
        return c.json(
          {
            success: false,
            error: "Group not found",
            message: "Group not found",
          },
          404
        );
      }

      return jsonSuccess(c, updatedGroup, "Group updated successfully");
    } catch (error) {
      return handleError(c, error);
    }
  })

  // DELETE /api/v1/groups/:id - グループ削除（論理削除）
  .delete("/:id", async (c) => {
    try {
      const dbResult = getDbContainer(c);
      if (!dbResult.success) {
        return dbResult.error;
      }

      const id = parseInt(c.req.param("id"));
      if (Number.isNaN(id)) {
        return c.json(
          {
            success: false,
            error: "Invalid group ID",
            message: "Invalid group ID",
          },
          400
        );
      }

      const groupUseCase = dbResult.container.getGroupUseCase();

      const deleted = await groupUseCase.deleteGroup(id);
      if (!deleted) {
        return c.json(
          {
            success: false,
            error: "Group not found",
            message: "Group not found",
          },
          404
        );
      }

      return jsonSuccess(c, { deleted: true }, "Group deleted successfully");
    } catch (error) {
      return handleError(c, error);
    }
  })

  // GET /api/v1/groups/:id/members - グループメンバー一覧取得
  .get("/:id/members", async (c) => {
    try {
      const dbResult = getDbContainer(c);
      if (!dbResult.success) {
        return dbResult.error;
      }

      const id = parseInt(c.req.param("id"));
      if (Number.isNaN(id)) {
        return c.json(
          {
            success: false,
            error: "Invalid group ID",
            message: "Invalid group ID",
          },
          400
        );
      }

      const groupUseCase = dbResult.container.getGroupUseCase();

      const members = await groupUseCase.getGroupMembers(id);
      return jsonSuccess(c, members, "Group members retrieved successfully");
    } catch (error) {
      return handleError(c, error);
    }
  })

  // POST /api/v1/groups/:id/members - グループにメンバー追加
  .post("/:id/members", async (c) => {
    try {
      const dbResult = getDbContainer(c);
      if (!dbResult.success) {
        return dbResult.error;
      }

      const groupId = parseInt(c.req.param("id"));
      if (Number.isNaN(groupId)) {
        return c.json(
          {
            success: false,
            error: "Invalid group ID",
            message: "Invalid group ID",
          },
          400
        );
      }

      const body = await c.req.json();
      const { userId, role } = body;

      if (!userId) {
        return c.json(
          {
            success: false,
            error: "UserId is required",
            message: "UserId is required",
          },
          400
        );
      }

      const groupUseCase = dbResult.container.getGroupUseCase();

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
      const dbResult = getDbContainer(c);
      if (!dbResult.success) {
        return dbResult.error;
      }

      const groupId = parseInt(c.req.param("groupId"));
      const userId = parseInt(c.req.param("userId"));

      if (Number.isNaN(groupId) || Number.isNaN(userId)) {
        return c.json(
          {
            success: false,
            error: "Invalid group ID or user ID",
            message: "Invalid group ID or user ID",
          },
          400
        );
      }

      const groupUseCase = dbResult.container.getGroupUseCase();

      const removed = await groupUseCase.removeGroupMember(groupId, userId);
      if (!removed) {
        return c.json(
          {
            success: false,
            error: "Member not found in group",
            message: "Member not found in group",
          },
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
  });
