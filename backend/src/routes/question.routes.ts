import type { FastifyInstance } from "fastify";
import {
  listQuestionsHandler,
  getQuestionByIdHandler,
  seedInitialQuestionsHandler,
} from "../controllers/question.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/rbac.middleware.js";

export async function questionRoutes(fastify: FastifyInstance): Promise<void> {
  // Leitura para consulta no simulado
  fastify.get("/questions", listQuestionsHandler);
  fastify.get("/questions/:id", getQuestionByIdHandler);

  // Criação e edição: Professor verificado ou Administração (rotas ainda não implementadas)
  // fastify.post("/questions", { preHandler: [authenticate, requireVerifiedProfessor] }, createQuestionHandler);
  // fastify.put("/questions/:id", { preHandler: [authenticate, requireVerifiedProfessor] }, updateQuestionHandler);

  // Carga inicial / importação em lote: apenas Administração
  fastify.post(
    "/questions/seed",
    { preHandler: [authenticate, requireAdmin] },
    seedInitialQuestionsHandler,
  );
}
