import { Hono } from "hono";
import { handleError, jsonSuccess } from "../../utils";
import { diMiddleware } from "../middleware/di";

export const usersRoutes = new Hono()
  .use("*", diMiddleware)
  // GET /api/v1/users - 全ユーザー取得
  .get("/", async (c) => {
    try {
      const container = c.get("diContainer");
      const userUseCase = container.getUserUseCase();

      const users = await userUseCase.getAllUsers();
      return jsonSuccess(c, users, "Users retrieved successfully");
    } catch (error) {
      return handleError(c, error);
    }
  })

  // GET /api/v1/users/:id - 特定ユーザー取得
  .get("/:id", async (c) => {
    try {
      const container = c.get("diContainer");
      const userUseCase = container.getUserUseCase();

      const id = parseInt(c.req.param("id"));
      if (Number.isNaN(id)) {
        return c.json(
          {
            success: false,
            error: "Invalid user ID",
            message: "Invalid user ID",
          },
          400
        );
      }

      const user = await userUseCase.getUserById(id);
      if (!user) {
        return c.json(
          {
            success: false,
            error: "User not found",
            message: "User not found",
          },
          404
        );
      }

      return jsonSuccess(c, user, "User retrieved successfully");
    } catch (error) {
      return handleError(c, error);
    }
  })

  // GET /api/v1/users/:id/groups - ユーザーのグループ一覧取得
  .get("/:id/groups", async (c) => {
    try {
      const container = c.get("diContainer");
      const groupUseCase = container.getGroupUseCase();

      const id = parseInt(c.req.param("id"));
      if (Number.isNaN(id)) {
        return c.json(
          {
            success: false,
            error: "Invalid user ID",
            message: "Invalid user ID",
          },
          400
        );
      }

      const userGroups = await groupUseCase.getUserGroups(id);
      return jsonSuccess(c, userGroups, "User groups retrieved successfully");
    } catch (error) {
      return handleError(c, error);
    }
  })

  // PUT /api/v1/users/:id - ユーザー情報更新
  .put("/:id", async (c) => {
    try {
      const container = c.get("diContainer");
      const userUseCase = container.getUserUseCase();

      const id = parseInt(c.req.param("id"));
      if (Number.isNaN(id)) {
        return c.json(
          {
            success: false,
            error: "Invalid user ID",
            message: "Invalid user ID",
          },
          400
        );
      }

      const body = await c.req.json();
      const { name, email } = body;

      if (!name && !email) {
        return c.json(
          {
            success: false,
            error: "At least one field (name or email) is required",
            message: "At least one field (name or email) is required",
          },
          400
        );
      }

      const updatedUser = await userUseCase.updateUser(id, { name, email });
      if (!updatedUser) {
        return c.json(
          {
            success: false,
            error: "User not found",
            message: "User not found",
          },
          404
        );
      }

      return jsonSuccess(c, updatedUser, "User updated successfully");
    } catch (error) {
      return handleError(c, error);
    }
  })

  // DELETE /api/v1/users/:id - ユーザー削除
  .delete("/:id", async (c) => {
    try {
      const container = c.get("diContainer");
      const userUseCase = container.getUserUseCase();

      const id = parseInt(c.req.param("id"));
      if (Number.isNaN(id)) {
        return c.json(
          {
            success: false,
            error: "Invalid user ID",
            message: "Invalid user ID",
          },
          400
        );
      }

      const deleted = await userUseCase.deleteUser(id);
      if (!deleted) {
        return c.json(
          {
            success: false,
            error: "User not found",
            message: "User not found",
          },
          404
        );
      }

      return jsonSuccess(c, { deleted: true }, "User deleted successfully");
    } catch (error) {
      return handleError(c, error);
    }
  });
