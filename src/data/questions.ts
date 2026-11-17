import enadeData from "./enade-questions.json";
import type {
  AlternativeLetter,
  AreaCategory,
  Difficulty,
  ExamMeta,
  Question,
  SimuladoNavigationContext,
  StudentProfile,
} from "../types/question";

/**
 * Questões extraídas e normalizadas diretamente do arquivo `enade-questions.json`.
 * Sempre que o JSON for atualizado (novas questões ou novos temas), a aplicação
 * reflete automaticamente a mudança.
 */
export const questions: readonly Question[] = enadeData.areas.flatMap((area) =>
  area.questions.map((q) => ({
    id: q.id,
    areaSlug: area.slug,
    category: area.category as Exclude<AreaCategory, "Todas as Áreas">,
    year: q.year,
    subject: area.title,
    courseArea: q.courseArea,
    difficulty: q.difficulty as Difficulty,
    statement: q.statement,
    ...(q.supportBlock ? { supportBlock: q.supportBlock } : {}),
    command: q.command,
    alternatives: q.alternatives.map((alt) => ({
      letter: alt.letter as AlternativeLetter,
      text: alt.text,
    })),
    correctIndex: q.correctIndex,
    explanation: q.explanation,
  })),
);

export const examMeta: ExamMeta = {
  title: enadeData.examMeta.title,
  course: enadeData.examMeta.course,
  year: enadeData.examMeta.year,
  totalQuestions: questions.length,
  durationMinutes: enadeData.examMeta.durationMinutes,
};

export const student: StudentProfile = {
  name: enadeData.student.name,
  registration: enadeData.student.registration,
  initials: enadeData.student.initials,
  course: enadeData.student.course,
};

/**
 * Filtra o banco de questões de acordo com o contexto de navegação
 * (por ano do ENADE, por tema/disciplina, categoria, dificuldade ou termo de busca).
 */
export function filterQuestionsByContext(
  allQuestions: readonly Question[],
  context?: SimuladoNavigationContext | null,
): readonly Question[] {
  if (!context) {
    return allQuestions;
  }

  const normalizedQuery = context.searchQuery?.trim().toLowerCase() ?? "";
  const isSpecificArea =
    Boolean(context.areaSlug) &&
    context.areaSlug !== "simulado-geral" &&
    !context.areaSlug?.startsWith("enade-");

  const filtered = allQuestions.filter((question) => {
    if (typeof context.year === "number" && question.year !== context.year) {
      return false;
    }

    if (isSpecificArea && question.areaSlug !== context.areaSlug) {
      return false;
    }

    if (
      !isSpecificArea &&
      context.category &&
      context.category !== "Todas as Áreas" &&
      question.category !== context.category
    ) {
      return false;
    }

    if (
      context.difficulty &&
      context.difficulty !== "Todas" &&
      question.difficulty !== context.difficulty
    ) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const matchesSubject = question.subject.toLowerCase().includes(normalizedQuery);
    const matchesCommand = question.command.toLowerCase().includes(normalizedQuery);
    const matchesStatement = question.statement.some((paragraph) =>
      paragraph.toLowerCase().includes(normalizedQuery),
    );
    const matchesSupport =
      question.supportBlock?.content.toLowerCase().includes(normalizedQuery) ?? false;
    const matchesAlternative = question.alternatives.some((alt) =>
      alt.text.toLowerCase().includes(normalizedQuery),
    );

    return (
      matchesSubject ||
      matchesCommand ||
      matchesStatement ||
      matchesSupport ||
      matchesAlternative
    );
  });

  return filtered;
}
