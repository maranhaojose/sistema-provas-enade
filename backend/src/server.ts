import "dotenv/config";
import { buildApp } from "./app.js";

const PORT = Number(process.env.PORT) || 3333;
const HOST = "0.0.0.0";

const app = buildApp();

async function start() {
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`🚀 Fastify Server listening on http://${HOST}:${PORT}`);
    console.log(`📋 Health check: http://${HOST}:${PORT}/health`);
    console.log(`📚 API Questions: http://${HOST}:${PORT}/api/questions`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown handling
const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
for (const signal of signals) {
  process.on(signal, async () => {
    console.log(`Received ${signal}, closing server gracefully...`);
    await app.close();
    process.exit(0);
  });
}

start();
