import { FastifyReply, FastifyRequest } from "fastify";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";

const listQuestionsQuerySchema = z.object({
  area: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

const getQuestionParamsSchema = z.object({
  id: z.string().uuid(),
});

export async function listQuestionsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parseResult = listQuestionsQuerySchema.safeParse(request.query);
  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Invalid query parameters",
      details: parseResult.error.format(),
    });
  }

  const { area, difficulty, limit, offset } = parseResult.data;

  // Questões removidas logicamente não devem aparecer no catálogo, mas seus
  // registros (e as respostas associadas) permanecem para histórico.
  const whereClause: Prisma.QuestionWhereInput = { deletedAt: null };
  if (area) whereClause.area = area;
  if (difficulty) whereClause.difficulty = difficulty;

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where: whereClause,
      include: {
        alternatives: {
          orderBy: { letter: "asc" },
        },
      },
      orderBy: { number: "asc" },
      take: limit,
      skip: offset,
    }),
    prisma.question.count({ where: whereClause }),
  ]);

  return reply.send({
    data: questions,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + questions.length < total,
    },
  });
}

export async function getQuestionByIdHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parseResult = getQuestionParamsSchema.safeParse(request.params);
  if (!parseResult.success) {
    return reply.status(400).send({
      error: "Invalid question ID format",
      details: parseResult.error.format(),
    });
  }

  const { id } = parseResult.data;

  const question = await prisma.question.findUnique({
    where: { id, deletedAt: null },
    include: {
      alternatives: {
        orderBy: { letter: "asc" },
      },
      exam: true,
    },
  });

  if (!question) {
    return reply.status(404).send({ error: "Question not found" });
  }

  return reply.send({ data: question });
}

export async function seedInitialQuestionsHandler(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const existingCount = await prisma.question.count({ where: { deletedAt: null } });
  if (existingCount > 0) {
    return reply.send({
      message: "Database already contains questions. Skipping seed.",
      count: existingCount,
    });
  }

  const exam = await prisma.exam.create({
    data: {
      title: "Simulado Geral ENADE - Computação",
      year: 2023,
      course: "Ciência da Computação / Engenharia de Software",
      description: "Banco de questões selecionadas dos exames ENADE.",
    },
  });

  const sampleQuestions = [
    {
      number: 1,
      area: "Algoritmos e Estruturas de Dados",
      difficulty: "easy",
      contextText: "A busca binária é um algoritmo eficiente para encontrar um elemento em uma lista ordenada.",
      prompt: "Qual é a complexidade de tempo de pior caso do algoritmo de busca binária?",
      correctLetter: "B",
      explanation: "A busca binária divide o espaço de busca pela metade a cada passo, resultando em complexidade O(log n).",
      alternatives: [
        { letter: "A", text: "O(1)" },
        { letter: "B", text: "O(log n)" },
        { letter: "C", text: "O(n)" },
        { letter: "D", text: "O(n log n)" },
        { letter: "E", text: "O(n²)" },
      ],
    },
    {
      number: 2,
      area: "Banco de Dados",
      difficulty: "medium",
      contextText: "A normalização de dados visa reduzir a redundância e eliminar anomalias de atualização.",
      prompt: "Uma tabela está na Terceira Forma Normal (3FN) se e somente se:",
      correctLetter: "C",
      explanation: "Para estar na 3FN, a relação deve estar na 2FN e nenhum atributo não-chave deve depender transitivamente da chave primária.",
      alternatives: [
        { letter: "A", text: "Todos os atributos possuem valores atômicos." },
        { letter: "B", text: "Não possui dependências parciais da chave primária composta." },
        { letter: "C", text: "Está na 2FN e não possui dependências transitivas." },
        { letter: "D", text: "Está na Forma Normal de Boyce-Codd." },
        { letter: "E", text: "Não existem chaves estrangeiras nulas." },
      ],
    },
  ];

  for (const q of sampleQuestions) {
    await prisma.question.create({
      data: {
        examId: exam.id,
        number: q.number,
        area: q.area,
        difficulty: q.difficulty,
        contextText: q.contextText,
        prompt: q.prompt,
        correctLetter: q.correctLetter,
        explanation: q.explanation,
        alternatives: {
          create: q.alternatives,
        },
      },
    });
  }

  return reply.status(201).send({
    message: "Initial sample questions created successfully",
    examId: exam.id,
    questionsInserted: sampleQuestions.length,
  });
}
