import type { FastifyInstance } from "fastify";
import { UserRole } from "@prisma/client";
import {
  updateAdminProfileHandler,
  updateProfessorProfileHandler,
  updateStudentProfileHandler,
} from "../controllers/profile.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";
import { requireAdmin, requireStudent } from "../middlewares/rbac.middleware.js";

export async function profileRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.patch(
    "/profiles/student/me",
    { preHandler: [authenticate, requireStudent] },
    updateStudentProfileHandler,
  );

  fastify.patch(
    "/profiles/professor/me",
    { preHandler: [authenticate, authorizeRoles(UserRole.PROFESSOR)] },
    updateProfessorProfileHandler,
  );

  fastify.patch(
    "/profiles/admin/me",
    { preHandler: [authenticate, requireAdmin] },
    updateAdminProfileHandler,
  );
}
