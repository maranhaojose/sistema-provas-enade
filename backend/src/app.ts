import fastify, { FastifyError, FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { appRoutes } from "./routes/index.js";
import { healthCheckHandler } from "./controllers/health.controller.js";

export function buildApp(): FastifyInstance {
  const app = fastify({
    logger: {
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
    },
  });

  // Enable Cross-Origin Resource Sharing for frontend integration
  app.register(cors, {
    origin: true,
  });

  // Root health endpoint for quick Docker/Kubernetes probes
  app.get("/health", healthCheckHandler);

  // Grouped API routes
  app.register(appRoutes, { prefix: "/api" });

  // Global error handler adhering to fail-fast and specific errors
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    app.log.error(error);
    const statusCode = typeof error.statusCode === "number" ? error.statusCode : 500;
    reply.status(statusCode).send({
      error: error.name || "InternalServerError",
      message: error.message || "An unexpected error occurred",
      statusCode,
    });
  });

  return app;
}
