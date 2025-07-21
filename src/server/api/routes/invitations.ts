import { Hono } from "hono";
import type { CreateInvitationRequest } from "@/lib/schemas";
import {
  handleError,
  jsonSuccess,
  notFoundError,
  validationError,
} from "../../utils";
import { diMiddleware } from "../middleware/di";

export const invitationsRoutes = new Hono()
  .use("*", diMiddleware)
  // 招待作成
  .post("/", async (c) => {
    try {
      const container = c.get("diContainer");
      const invitationUseCase = container.getInvitationUseCase();

      const body = await c.req.json<CreateInvitationRequest>();

      const invitation = await invitationUseCase.createInvitation(body);
      return jsonSuccess(c, invitation, undefined, 201);
    } catch (error) {
      return handleError(c, error);
    }
  })

  // 招待一覧取得
  .get("/", async (c) => {
    try {
      const container = c.get("diContainer");
      const invitationUseCase = container.getInvitationUseCase();

      const invitations = await invitationUseCase.getAllInvitations();
      return jsonSuccess(c, invitations);
    } catch (error) {
      return handleError(c, error);
    }
  })

  // 招待詳細取得
  .get("/:id", async (c) => {
    try {
      const container = c.get("diContainer");
      const invitationUseCase = container.getInvitationUseCase();

      const id = parseInt(c.req.param("id"));
      if (Number.isNaN(id)) {
        return validationError(c, "Invalid invitation ID");
      }

      const invitation = await invitationUseCase.getInvitationById(id);
      if (!invitation) {
        return notFoundError(c, "Invitation not found");
      }

      return jsonSuccess(c, invitation);
    } catch (error) {
      return handleError(c, error);
    }
  })

  // グループ別招待一覧取得
  .get("/group/:groupId", async (c) => {
    try {
      const container = c.get("diContainer");
      const invitationUseCase = container.getInvitationUseCase();

      const groupId = parseInt(c.req.param("groupId"));
      if (Number.isNaN(groupId)) {
        return validationError(c, "Invalid group ID");
      }

      const invitations =
        await invitationUseCase.getInvitationsByGroupId(groupId);
      return jsonSuccess(c, invitations);
    } catch (error) {
      return handleError(c, error);
    }
  })

  // 招待削除
  .delete("/:id", async (c) => {
    try {
      const container = c.get("diContainer");
      const invitationUseCase = container.getInvitationUseCase();

      const id = parseInt(c.req.param("id"));
      if (Number.isNaN(id)) {
        return validationError(c, "Invalid invitation ID");
      }

      const success = await invitationUseCase.deleteInvitation(id);
      return jsonSuccess(c, { success });
    } catch (error) {
      return handleError(c, error);
    }
  });
