import { FastifyInstance } from "fastify";
import { healthRoutes } from "./health.routes.js";
import { questionRoutes } from "./question.routes.js";

export async function appRoutes(fastify: FastifyInstance) {
  await fastify.register(healthRoutes);
  await fastify.register(questionRoutes);
}
