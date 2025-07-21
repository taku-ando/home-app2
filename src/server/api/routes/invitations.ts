import { Hono } from "hono";
import { GroupRepositoryImpl } from "../../infrastructure/repositories/group_repository_impl";
import { InvitationRepositoryImpl } from "../../infrastructure/repositories/invitation_repository_impl";
import { UserRepositoryImpl } from "../../infrastructure/repositories/user_repository_impl";
import type { InvitationApiRequest } from "../../types";
import { InvitationUseCase } from "../../usecases/invitation_usecase";
import {
  getDbContainer,
  handleError,
  jsonSuccess,
  notFoundError,
  validationError,
} from "../../utils";

const app = new Hono();

// 招待作成
app.post("/", async (c) => {
  try {
    const dbResult = getDbContainer(c);
    if (dbResult.success === false) {
      return dbResult.error;
    }
    const { db } = dbResult.data;

    const body = await c.req.json<InvitationApiRequest>();

    const invitationRepository = new InvitationRepositoryImpl(db);
    const userRepository = new UserRepositoryImpl(db);
    const groupRepository = new GroupRepositoryImpl(db);
    const invitationUseCase = new InvitationUseCase(
      invitationRepository,
      userRepository,
      groupRepository
    );

    const invitation = await invitationUseCase.createInvitation(body);
    return jsonSuccess(c, invitation, undefined, 201);
  } catch (error) {
    return handleError(c, error);
  }
});

// 招待一覧取得
app.get("/", async (c) => {
  try {
    const dbResult = getDbContainer(c);
    if (dbResult.success === false) {
      return dbResult.error;
    }
    const { db } = dbResult.data;

    const invitationRepository = new InvitationRepositoryImpl(db);
    const userRepository = new UserRepositoryImpl(db);
    const groupRepository = new GroupRepositoryImpl(db);
    const invitationUseCase = new InvitationUseCase(
      invitationRepository,
      userRepository,
      groupRepository
    );

    const invitations = await invitationUseCase.getAllInvitations();
    return jsonSuccess(c, invitations);
  } catch (error) {
    return handleError(c, error);
  }
});

// 招待詳細取得
app.get("/:id", async (c) => {
  try {
    const dbResult = getDbContainer(c);
    if (dbResult.success === false) {
      return dbResult.error;
    }
    const { db } = dbResult.data;

    const id = parseInt(c.req.param("id"));
    if (Number.isNaN(id)) {
      return validationError(c, "Invalid invitation ID");
    }

    const invitationRepository = new InvitationRepositoryImpl(db);
    const userRepository = new UserRepositoryImpl(db);
    const groupRepository = new GroupRepositoryImpl(db);
    const invitationUseCase = new InvitationUseCase(
      invitationRepository,
      userRepository,
      groupRepository
    );

    const invitation = await invitationUseCase.getInvitationById(id);
    if (!invitation) {
      return notFoundError(c, "Invitation not found");
    }

    return jsonSuccess(c, invitation);
  } catch (error) {
    return handleError(c, error);
  }
});

// グループ別招待一覧取得
app.get("/group/:groupId", async (c) => {
  try {
    const dbResult = getDbContainer(c);
    if (dbResult.success === false) {
      return dbResult.error;
    }
    const { db } = dbResult.data;

    const groupId = parseInt(c.req.param("groupId"));
    if (Number.isNaN(groupId)) {
      return validationError(c, "Invalid group ID");
    }

    const invitationRepository = new InvitationRepositoryImpl(db);
    const userRepository = new UserRepositoryImpl(db);
    const groupRepository = new GroupRepositoryImpl(db);
    const invitationUseCase = new InvitationUseCase(
      invitationRepository,
      userRepository,
      groupRepository
    );

    const invitations =
      await invitationUseCase.getInvitationsByGroupId(groupId);
    return jsonSuccess(c, invitations);
  } catch (error) {
    return handleError(c, error);
  }
});

// 招待削除
app.delete("/:id", async (c) => {
  try {
    const dbResult = getDbContainer(c);
    if (dbResult.success === false) {
      return dbResult.error;
    }
    const { db } = dbResult.data;

    const id = parseInt(c.req.param("id"));
    if (Number.isNaN(id)) {
      return validationError(c, "Invalid invitation ID");
    }

    const invitationRepository = new InvitationRepositoryImpl(db);
    const userRepository = new UserRepositoryImpl(db);
    const groupRepository = new GroupRepositoryImpl(db);
    const invitationUseCase = new InvitationUseCase(
      invitationRepository,
      userRepository,
      groupRepository
    );

    const success = await invitationUseCase.deleteInvitation(id);
    return jsonSuccess(c, { success });
  } catch (error) {
    return handleError(c, error);
  }
});

export default app;
