import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { paginationQuerySchema, updateUserRequestSchema } from "@/lib/schemas";
import { handleError, jsonSuccess } from "../../utils";
import { diMiddleware } from "../middleware/di";

export const usersRoutes = new Hono()
  .use("*", diMiddleware)
  // GET /api/v1/users - 全ユーザー取得
  .get("/", zValidator("query", paginationQuerySchema), async (c) => {
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
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.coerce.number().int().positive() })),
    async (c) => {
      try {
        const container = c.get("diContainer");
        const userUseCase = container.getUserUseCase();
        const { id } = c.req.valid("param");

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
    }
  )

  // GET /api/v1/users/:id/groups - ユーザーのグループ一覧取得
  .get(
    "/:id/groups",
    zValidator("param", z.object({ id: z.coerce.number().int().positive() })),
    async (c) => {
      try {
        const container = c.get("diContainer");
        const groupUseCase = container.getGroupUseCase();
        const { id } = c.req.valid("param");

        const userGroups = await groupUseCase.getUserGroups(id);
        return jsonSuccess(c, userGroups, "User groups retrieved successfully");
      } catch (error) {
        return handleError(c, error);
      }
    }
  )

  // PUT /api/v1/users/:id - ユーザー情報更新
  .put(
    "/:id",
    zValidator("param", z.object({ id: z.coerce.number().int().positive() })),
    zValidator("json", updateUserRequestSchema),
    async (c) => {
      try {
        const container = c.get("diContainer");
        const userUseCase = container.getUserUseCase();
        const { id } = c.req.valid("param");
        const updateData = c.req.valid("json");

        const updatedUser = await userUseCase.updateUser(id, updateData);
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
    }
  )

  // DELETE /api/v1/users/:id - ユーザー削除
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.coerce.number().int().positive() })),
    async (c) => {
      try {
        const container = c.get("diContainer");
        const userUseCase = container.getUserUseCase();
        const { id } = c.req.valid("param");

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
    }
  );
