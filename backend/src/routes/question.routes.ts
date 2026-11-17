import { FastifyInstance } from "fastify";
import {
  listQuestionsHandler,
  getQuestionByIdHandler,
  seedInitialQuestionsHandler,
} from "../controllers/question.controller.js";

export async function questionRoutes(fastify: FastifyInstance) {
  fastify.get("/questions", listQuestionsHandler);
  fastify.get("/questions/:id", getQuestionByIdHandler);
  fastify.post("/questions/seed", seedInitialQuestionsHandler);
}
