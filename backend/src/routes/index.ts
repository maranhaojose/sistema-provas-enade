import { FastifyInstance } from "fastify";
import { adminRoutes } from "./admin.routes.js";
import { authRoutes } from "./auth.routes.js";
import { healthRoutes } from "./health.routes.js";
import { profileRoutes } from "./profile.routes.js";
import { questionRoutes } from "./question.routes.js";

export async function appRoutes(fastify: FastifyInstance) {
  await fastify.register(healthRoutes);
  await fastify.register(authRoutes);
  await fastify.register(profileRoutes);
  await fastify.register(adminRoutes);
  await fastify.register(questionRoutes);
}
