import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CircleHelp,
  Lock,
  Sparkles,
  X,
} from "lucide-react";
import type { Question } from "../types/question";
import { cn } from "../lib/utils";
import { FeedbackBanner } from "./FeedbackBanner";

interface QuestionCardProps {
  readonly question: Question;
  readonly index: number;
  readonly total: number;
  readonly selection: number | null;
  readonly isConfirmed: boolean;
  readonly onSelect: (alternativeIndex: number) => void;
  readonly onConfirm: () => void;
  readonly onNext: () => void;
  readonly onPrevious: () => void;
}

const difficultyStyles: Record<Question["difficulty"], string> = {
  Fácil: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Média: "bg-amber-50 text-amber-700 ring-amber-100",
  Difícil: "bg-rose-50 text-rose-700 ring-rose-100",
};

type AlternativeState = "idle" | "selected" | "correct" | "incorrect" | "muted";

export function QuestionCard({
  question,
  index,
  total,
  selection,
  isConfirmed,
  onSelect,
  onConfirm,
  onNext,
  onPrevious,
}: QuestionCardProps) {
  const correctLetter = question.alternatives[question.correctIndex]?.letter ?? "A";
  const selectedLetter =
    selection !== null ? (question.alternatives[selection]?.letter ?? "") : "";
  const isCorrect = isConfirmed && selection === question.correctIndex;

  const resolveState = (alternativeIndex: number): AlternativeState => {
    if (!isConfirmed) {
      return selection === alternativeIndex ? "selected" : "idle";
    }
    if (alternativeIndex === question.correctIndex) return "correct";
    if (alternativeIndex === selection) return "incorrect";
    return "muted";
  };

  const alternativeClasses: Record<AlternativeState, string> = {
    idle: "border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/40 hover:shadow-sm",
    selected:
      "border-brand-500 bg-brand-50/60 ring-1 ring-brand-500 shadow-sm shadow-brand-600/10",
    correct: "border-emerald-400 bg-emerald-50/80 ring-1 ring-emerald-400",
    incorrect: "border-rose-400 bg-rose-50/70 ring-1 ring-rose-400",
    muted: "border-slate-200 bg-white opacity-55",
  };

  const letterClasses: Record<AlternativeState, string> = {
    idle: "border-slate-200 bg-slate-50 text-slate-500",
    selected: "border-brand-600 bg-brand-600 text-white",
    correct: "border-emerald-500 bg-emerald-500 text-white",
    incorrect: "border-rose-500 bg-rose-500 text-white",
    muted: "border-slate-200 bg-slate-50 text-slate-400",
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
      {/* Cabeçalho da questão */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3.5 sm:px-6 sm:py-4">
        <span className="inline-flex items-center rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
          Questão {String(index + 1).padStart(2, "0")}
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
          ENADE {question.year}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-inset ring-slate-200/70">
          <BookOpen className="h-3 w-3" aria-hidden="true" />
          {question.subject}
        </span>
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset",
            difficultyStyles[question.difficulty],
          )}
        >
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          {question.difficulty}
        </span>
      </div>

      <div className="px-4 py-5 sm:px-6 sm:py-6">
        {/* Texto-base */}
        <div className="space-y-3">
          {question.statement.map((paragraph, paragraphIndex) => (
            <p
              key={paragraphIndex}
              className="text-[13.5px] leading-relaxed text-slate-600 sm:text-[14.5px]"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Bloco de apoio */}
        {question.supportBlock && (
          <figure className="mt-4 overflow-hidden rounded-xl border border-slate-800/10 bg-slate-900">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
              <figcaption className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                {question.supportBlock.title}
              </figcaption>
              {question.supportBlock.language && (
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
                  {question.supportBlock.language}
                </span>
              )}
            </div>
            <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[12px] leading-relaxed text-slate-100 sm:text-[12.5px]">
              <code>{question.supportBlock.content}</code>
            </pre>
          </figure>
        )}

        {/* Comando */}
        <div className="mt-5 border-l-[3px] border-brand-500 pl-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
            Comando da questão
          </p>
          <p className="mt-1 text-[14px] font-semibold leading-relaxed text-slate-900 sm:text-[15px]">
            {question.command}
          </p>
        </div>

        {/* Alternativas */}
        <div className="mt-5 space-y-2.5" role="group" aria-label="Alternativas da questão">
          {question.alternatives.map((alternative, alternativeIndex) => {
            const state = resolveState(alternativeIndex);
            const isChooseable = !isConfirmed;
            return (
              <button
                key={alternative.letter}
                type="button"
                onClick={() => onSelect(alternativeIndex)}
                disabled={!isChooseable}
                aria-pressed={selection === alternativeIndex}
                aria-label={`Alternativa ${alternative.letter}: ${alternative.text}`}
                className={cn(
                  "group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:gap-3.5 sm:p-3.5",
                  alternativeClasses[state],
                  !isChooseable && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[13px] font-bold transition-colors sm:h-9 sm:w-9",
                    letterClasses[state],
                  )}
                  aria-hidden="true"
                >
                  {alternative.letter}
                </span>
                <span
                  className={cn(
                    "flex-1 pt-1 text-[13px] leading-relaxed sm:text-[13.5px]",
                    state === "correct"
                      ? "font-semibold text-emerald-900"
                      : state === "incorrect"
                        ? "font-medium text-rose-900"
                        : "font-medium text-slate-700",
                  )}
                >
                  {alternative.text}
                </span>
                {state === "correct" && (
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                )}
                {state === "incorrect" && (
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
                    <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Ação principal ou feedback */}
        <div className="mt-6">
          {!isConfirmed ? (
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-400">
                <CircleHelp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {selection === null
                  ? "Selecione uma alternativa para habilitar a resposta."
                  : "Após confirmar, a questão será bloqueada para edição."}
              </p>
              <button
                type="button"
                onClick={onConfirm}
                disabled={selection === null}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
                  selection === null
                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                    : "bg-brand-600 text-white shadow-md shadow-brand-600/25 hover:bg-brand-700 hover:shadow-lg active:scale-[0.99]",
                )}
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                Responder Questão
              </button>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <Lock className="h-3 w-3" aria-hidden="true" />
                Resposta registrada e bloqueada para edição
              </div>
              <FeedbackBanner
                isCorrect={isCorrect}
                selectedLetter={selectedLetter}
                correctLetter={correctLetter}
                explanation={question.explanation}
              />
            </>
          )}
        </div>

        {/* Navegação entre questões */}
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onPrevious}
            disabled={index === 0}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-[12.5px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
              index === 0
                ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Questão anterior</span>
            <span className="sm:hidden">Anterior</span>
          </button>

          <span className="hidden text-[11.5px] font-semibold tabular-nums text-slate-400 sm:block">
            {index + 1} de {total}
          </span>

          <button
            type="button"
            onClick={onNext}
            disabled={index === total - 1}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-[12.5px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
              index === total - 1
                ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            <span className="hidden sm:inline">Próxima questão</span>
            <span className="sm:hidden">Próxima</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
