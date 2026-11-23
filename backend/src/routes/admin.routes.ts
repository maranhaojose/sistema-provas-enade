import type { FastifyInstance } from "fastify";
import {
  createAdminUserHandler,
  listUsersHandler,
  updateUserStatusHandler,
  verifyProfessorHandler,
} from "../controllers/admin.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin, requireSuperAdmin } from "../middlewares/rbac.middleware.js";

export async function adminRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post(
    "/admin/users/admin",
    { preHandler: [authenticate, requireSuperAdmin] },
    createAdminUserHandler,
  );

  fastify.get(
    "/admin/users",
    { preHandler: [authenticate, requireAdmin] },
    listUsersHandler,
  );

  fastify.patch(
    "/admin/professors/:profileId/verify",
    { preHandler: [authenticate, requireAdmin] },
    verifyProfessorHandler,
  );

  fastify.patch(
    "/admin/users/:userId/status",
    { preHandler: [authenticate, requireAdmin] },
    updateUserStatusHandler,
  );
}
