import { useCallback, useEffect, useMemo, useState } from "react";
import type { AnswerMap, Question, QuestionStatus } from "../types/question";

export interface SimuladoStats {
  readonly total: number;
  readonly answered: number;
  readonly correct: number;
  readonly incorrect: number;
  readonly progressPercent: number;
  readonly accuracyPercent: number;
  readonly isFinished: boolean;
}

export interface UseSimuladoResult {
  readonly currentIndex: number;
  readonly currentQuestion: Question;
  readonly answers: AnswerMap;
  readonly stats: SimuladoStats;
  readonly currentSelection: number | null;
  readonly isCurrentConfirmed: boolean;
  readonly currentStatus: QuestionStatus;
  readonly selectAlternative: (alternativeIndex: number) => void;
  readonly confirmAnswer: () => void;
  readonly goToQuestion: (index: number) => void;
  readonly goToNext: () => void;
  readonly goToPrevious: () => void;
  readonly getStatus: (questionIndex: number) => QuestionStatus;
  readonly isAnswered: (questionId: string) => boolean;
  readonly restart: () => void;
}

export function useSimulado(questions: readonly Question[]): UseSimuladoResult {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Guarda seleções e confirmações indexadas pelo id da questão.
  const [answers, setAnswers] = useState<AnswerMap>({});

  // Ao trocar de caderno (ex.: mudar de ano do ENADE ou de disciplina), volta para a 1ª questão.
  useEffect(() => {
    setCurrentIndex(0);
  }, [questions]);

  const safeIndex =
    questions.length > 0 ? Math.min(currentIndex, questions.length - 1) : 0;
  const currentQuestion = questions[safeIndex];

  const currentSelection = useMemo(() => {
    if (!currentQuestion) return null;
    const answer = answers[currentQuestion.id];
    return answer ? answer.selectedIndex : null;
  }, [answers, currentQuestion]);

  const isCurrentConfirmed = useMemo(() => {
    if (!currentQuestion) return false;
    return Boolean(answers[currentQuestion.id]?.confirmed);
  }, [answers, currentQuestion]);

  const stats = useMemo<SimuladoStats>(() => {
    const confirmedQuestions = questions.filter((q) => answers[q.id]?.confirmed);
    const correct = confirmedQuestions.reduce((total, question) => {
      const answer = answers[question.id];
      if (!answer) return total;
      return total + (answer.selectedIndex === question.correctIndex ? 1 : 0);
    }, 0);

    const total = questions.length;
    const answered = confirmedQuestions.length;

    return {
      total,
      answered,
      correct,
      incorrect: answered - correct,
      progressPercent: total > 0 ? Math.round((answered / total) * 100) : 0,
      accuracyPercent: answered > 0 ? Math.round((correct / answered) * 100) : 0,
      isFinished: total > 0 && answered === total,
    };
  }, [answers, questions]);

  const selectAlternative = useCallback(
    (alternativeIndex: number) => {
      if (!currentQuestion) return;
      setAnswers((previous) => {
        const existing = previous[currentQuestion.id];
        // Questões confirmadas ficam bloqueadas para edição.
        if (existing?.confirmed) return previous;
        return {
          ...previous,
          [currentQuestion.id]: {
            questionId: currentQuestion.id,
            selectedIndex: alternativeIndex,
            confirmed: false,
          },
        };
      });
    },
    [currentQuestion],
  );

  const confirmAnswer = useCallback(() => {
    if (!currentQuestion) return;
    setAnswers((previous) => {
      const existing = previous[currentQuestion.id];
      if (!existing || existing.confirmed) return previous;
      return {
        ...previous,
        [currentQuestion.id]: { ...existing, confirmed: true },
      };
    });
  }, [currentQuestion]);

  const goToQuestion = useCallback(
    (index: number) => {
      if (index < 0 || index >= questions.length) return;
      setCurrentIndex(index);
    },
    [questions.length],
  );

  const goToNext = useCallback(() => {
    setCurrentIndex((index) => Math.min(index + 1, Math.max(0, questions.length - 1)));
  }, [questions.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }, []);

  const isAnswered = useCallback(
    (questionId: string) => Boolean(answers[questionId]?.confirmed),
    [answers],
  );

  const getStatus = useCallback(
    (questionIndex: number): QuestionStatus => {
      const question = questions[questionIndex];
      if (!question) return "unanswered";
      const answer = answers[question.id];
      if (answer?.confirmed) {
        return answer.selectedIndex === question.correctIndex ? "correct" : "incorrect";
      }
      return questionIndex === safeIndex ? "current" : "unanswered";
    },
    [answers, safeIndex, questions],
  );

  const currentStatus = getStatus(safeIndex);

  const restart = useCallback(() => {
    setAnswers((previous) => {
      const next = { ...previous };
      for (const q of questions) {
        delete next[q.id];
      }
      return next;
    });
    setCurrentIndex(0);
  }, [questions]);

  return {
    currentIndex: safeIndex,
    currentQuestion,
    answers,
    stats,
    currentSelection,
    isCurrentConfirmed,
    currentStatus,
    selectAlternative,
    confirmAnswer,
    goToQuestion,
    goToNext,
    goToPrevious,
    getStatus,
    isAnswered,
    restart,
  };
}
