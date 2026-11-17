import enadeData from "./enade-questions.json";
import { questions } from "./questions";
import type { AreaCategory, Difficulty, StudyArea, StudyStatus } from "../types/question";

export const areaCategories: readonly AreaCategory[] = [
  "Todas as Áreas",
  "Fundamentos",
  "Desenvolvimento",
  "Infraestrutura",
  "Matemática e Teoria",
];

export const difficultyOptions: ReadonlyArray<Difficulty | "Todas"> = [
  "Todas",
  "Fácil",
  "Média",
  "Difícil",
];

export interface GlobalStudySummary {
  readonly baseAnswered: number;
  readonly baseCorrect: number;
  readonly totalBankQuestions: number;
  readonly completedExams: number;
  readonly weeklyGoalTarget: number;
  readonly weeklyGoalCurrent: number;
}

/**
 * Áreas/temas de estudo gerados dinamicamente a partir do arquivo `enade-questions.json`.
 * O total de questões e os anos disponíveis de cada tema são calculados automaticamente
 * a partir do array `questions` daquele tema no JSON.
 */
export const studyAreas: readonly StudyArea[] = enadeData.areas.map((area) => {
  const uniqueYears = Array.from(new Set(area.questions.map((q) => q.year))).sort(
    (a, b) => b - a,
  );

  return {
    id: area.id,
    slug: area.slug,
    title: area.title,
    category: area.category as Exclude<AreaCategory, "Todas as Áreas">,
    description: area.description,
    subtopics: area.subtopics,
    totalQuestions: area.questions.length,
    answeredQuestions: Math.min(area.answeredQuestions, area.questions.length),
    accuracyPercent: area.accuracyPercent,
    defaultDifficulty: area.defaultDifficulty as Difficulty,
    years: uniqueYears,
    status: area.status as StudyStatus,
    iconName: area.iconName as StudyArea["iconName"],
  };
});

/**
 * Lista de anos de provas do ENADE calculada automaticamente a partir das questões do JSON.
 */
export const availableYears: readonly number[] = Array.from(
  new Set(questions.map((q) => q.year)),
).sort((a, b) => b - a);

/**
 * Quantidade exata de questões por ano calculada dinamicamente a partir do JSON.
 */
export const yearQuestionsCount: Readonly<Record<number, number>> = questions.reduce<
  Record<number, number>
>((acc, question) => {
  acc[question.year] = (acc[question.year] ?? 0) + 1;
  return acc;
}, {});

export const globalStudySummary: GlobalStudySummary = {
  baseAnswered: enadeData.globalStudySummary.baseAnswered,
  baseCorrect: enadeData.globalStudySummary.baseCorrect,
  totalBankQuestions: questions.length,
  completedExams: enadeData.globalStudySummary.completedExams,
  weeklyGoalTarget: enadeData.globalStudySummary.weeklyGoalTarget,
  weeklyGoalCurrent: enadeData.globalStudySummary.weeklyGoalCurrent,
};
