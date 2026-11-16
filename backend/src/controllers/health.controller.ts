import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma.js";

export async function healthCheckHandler(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  let dbStatus = "up";
  try {
    // Quick probe to verify database connectivity
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = "down";
    requestLog(error);
  }

  const payload = {
    status: dbStatus === "up" ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    services: {
      api: "up",
      database: dbStatus,
    },
    version: "1.0.0",
  };

  const statusCode = dbStatus === "up" ? 200 : 503;
  return reply.status(statusCode).send(payload);
}

function requestLog(err: unknown) {
  console.error("Health check database probe failed:", err);
}
