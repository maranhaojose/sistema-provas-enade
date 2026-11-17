import { FastifyInstance } from "fastify";
import { healthCheckHandler } from "../controllers/health.controller.js";

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get("/health", healthCheckHandler);
}
