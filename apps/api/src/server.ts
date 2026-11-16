import Fastify from "fastify";

const app = Fastify({ logger: true });

app.get("/health", async () => ({
  status: "ok",
  service: "api",
}));

const port = Number(process.env.PORT ?? 3000);
const host = "0.0.0.0";

async function start() {
  await app.listen({ port, host });
}

try {
  start();
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
