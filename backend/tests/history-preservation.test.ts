import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, beforeEach, describe, it } from "node:test";
import { PrismaClient } from "@prisma/client";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (!testDatabaseUrl) {
  throw new Error(
    "TEST_DATABASE_URL é obrigatório: execute os testes apenas em um b PostgreSQL descartável.",
  );
}

const parsedUrl = new URL(testDatabaseUrl);
const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]", "db"]);
if (!parsedUrl.pathname.includes("test") || !localHosts.has(parsedUrl.hostname)) {
  throw new Error(
    "TEST_DATABASE_URL deve apontar para um banco de testes local cujo nome contenha 'test'.",
  );
}

const prisma = new PrismaClient({
  datasources: { db: { url: testDatabaseUrl } },
});

async function resetDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "student_answers", "attempts", "alternatives", "questions", "exams", "student_profiles", "professor_profiles", "admin_profiles", "users" RESTART IDENTITY CASCADE',
  );
}

async function createAnsweredAttempt() {
  const user = await prisma.user.create({
    data: {
      name: "Aluno Teste",
      email: `aluno-${randomUUID()}@teste.local`,
      passwordHash: "hash-teste",
      role: "STUDENT",
    },
  });
  const student = await prisma.studentProfile.create({
    data: {
      userId: user.id,
      registration: `REG-${randomUUID()}`,
      course: "Ciência da Computação",
    },
  });
  const exam = await prisma.exam.create({
    data: { title: "ENADE 2026", year: 2026, course: "Computação" },
  });
  const question = await prisma.question.create({
    data: {
      examId: exam.id,
      number: 1,
      area: "Banco de Dados",
      contextText: "Contexto",
      prompt: "Enunciado",
      correctLetter: "A",
      explanation: "Explicação",
      alternatives: {
        create: [
          { letter: "A", text: "Alternativa A" },
          { letter: "B", text: "Alternativa B" },
        ],
      },
    },
  });
  const attempt = await prisma.attempt.create({
    data: { studentId: student.id, title: "Simulado", finishedAt: new Date() },
  });
  const answer = await prisma.studentAnswer.create({
    data: {
      attemptId: attempt.id,
      questionId: question.id,
      selectedLetter: "A",
      isCorrect: true,
    },
  });

  return { user, student, exam, question, attempt, answer };
}

describe("preservação de histórico de respostas", () => {
  beforeEach(resetDatabase);

  after(async () => {
    await prisma.$disconnect();
  });

  it("bloqueia exclusão física de questão que possui resposta registrada", async () => {
    const { question, answer } = await createAnsweredAttempt();

    await assert.rejects(() => prisma.question.delete({ where: { id: question.id } }));

    const preserved = await prisma.studentAnswer.findUnique({ where: { id: answer.id } });
    assert.ok(preserved);
    assert.equal(preserved.selectedLetter, "A");
  });

  it("bloqueia exclusão de prova quando suas questões foram respondidas", async () => {
    const { exam, answer } = await createAnsweredAttempt();

    await assert.rejects(() => prisma.exam.delete({ where: { id: exam.id } }));

    const preserved = await prisma.studentAnswer.findUnique({ where: { id: answer.id } });
    assert.ok(preserved);
  });

  it("preserva tentativa finalizada após remoção lógica do catálogo", async () => {
    const { exam, question, attempt, answer } = await createAnsweredAttempt();

    await prisma.exam.update({ where: { id: exam.id }, data: { deletedAt: new Date() } });
    await prisma.question.update({
      where: { id: question.id },
      data: { deletedAt: new Date() },
    });

    const visibleQuestions = await prisma.question.findMany({
      where: { deletedAt: null },
    });
    assert.equal(visibleQuestions.length, 0);

    const finishedAttempt = await prisma.attempt.findUnique({
      where: { id: attempt.id },
      include: { answers: true },
    });
    assert.ok(finishedAttempt?.finishedAt);
    assert.equal(finishedAttempt.answers.length, 1);
    assert.equal(finishedAttempt.answers[0]?.id, answer.id);
  });

  it("bloqueia hard delete de aluno e perfil com histórico", async () => {
    const { user, student, answer } = await createAnsweredAttempt();

    await assert.rejects(() => prisma.user.delete({ where: { id: user.id } }));
    await assert.rejects(
      () => prisma.studentProfile.delete({ where: { id: student.id } }),
    );

    const preserved = await prisma.studentAnswer.findUnique({ where: { id: answer.id } });
    assert.ok(preserved);
  });
});
