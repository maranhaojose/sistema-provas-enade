import type { FastifyInstance } from "fastify";
import {
  getMeHandler,
  loginHandler,
  registerProfessorHandler,
  registerStudentHandler,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post("/auth/login", loginHandler);
  fastify.post("/auth/register/student", registerStudentHandler);
  fastify.post("/auth/register/professor", registerProfessorHandler);
  fastify.get("/auth/me", { preHandler: [authenticate] }, getMeHandler);
}
