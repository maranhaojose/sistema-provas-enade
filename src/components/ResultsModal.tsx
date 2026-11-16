import { useEffect, useRef } from "react";
import { ArrowRight, RotateCcw, Trophy, X } from "lucide-react";
import type { AnswerMap, Question } from "../types/question";
import type { SimuladoStats } from "../hooks/useSimulado";
import { cn } from "../lib/utils";

interface ResultsModalProps {
  readonly isOpen: boolean;
  readonly stats: SimuladoStats;
  readonly questions: readonly Question[];
  readonly answers: AnswerMap;
  readonly onClose: () => void;
  readonly onRestart: () => void;
  readonly onReview: (questionIndex: number) => void;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ResultsModal({
  isOpen,
  stats,
  questions,
  answers,
  onClose,
  onRestart,
  onReview,
}: ResultsModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tone =
    stats.accuracyPercent >= 70
      ? { ring: "stroke-emerald-500", text: "text-emerald-600", label: "Excelente desempenho" }
      : stats.accuracyPercent >= 50
        ? { ring: "stroke-amber-500", text: "text-amber-600", label: "Desempenho razoável" }
        : { ring: "stroke-rose-500", text: "text-rose-600", label: "Precisa de revisão" };

  const dashOffset = CIRCUMFERENCE - (stats.accuracyPercent / 100) * CIRCUMFERENCE;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="results-title"
        className="animate-scale-in w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-brand-900 px-6 pb-7 pt-6 text-center text-white">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar resultado"
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/80 ring-1 ring-inset ring-white/15">
            <Trophy className="h-3 w-3" aria-hidden="true" />
            Simulado concluído
          </span>

          <div className="relative mx-auto mt-5 h-32 w-32">
            <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={RADIUS}
                fill="none"
                strokeWidth="9"
                className="stroke-white/10"
              />
              <circle
                cx="64"
                cy="64"
                r={RADIUS}
                fill="none"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                className={cn("transition-all duration-700 ease-out", tone.ring)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold tabular-nums tracking-tight">
                {stats.accuracyPercent}%
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                de acertos
              </span>
            </div>
          </div>

          <h2 id="results-title" className="mt-4 text-lg font-bold tracking-tight">
            {tone.label}
          </h2>
          <p className="mt-1 text-xs text-white/60">
            Você acertou {stats.correct} de {stats.total} questões neste simulado
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-3 text-center">
              <p className="text-xl font-extrabold tabular-nums text-emerald-600">
                {stats.correct}
              </p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700/70">
                Acertos
              </p>
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-3 text-center">
              <p className="text-xl font-extrabold tabular-nums text-rose-600">{stats.incorrect}</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700/70">
                Erros
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center">
              <p className="text-xl font-extrabold tabular-nums text-slate-700">{stats.total}</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Total
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Revisão rápida
            </p>
            <ul className="mt-2 divide-y divide-slate-100">
              {questions.map((question, index) => {
                const answer = answers[question.id];
                const correct = answer?.selectedIndex === question.correctIndex;
                return (
                  <li key={question.id}>
                    <button
                      type="button"
                      onClick={() => onReview(index)}
                      className="group flex w-full items-center gap-3 py-2.5 text-left"
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold",
                          correct
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700",
                        )}
                      >
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600">
                        {question.subject}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] font-bold tabular-nums",
                          correct ? "text-emerald-600" : "text-rose-500",
                        )}
                      >
                        {answer ? question.alternatives[answer.selectedIndex]?.letter : "—"} /{" "}
                        {question.alternatives[question.correctIndex]?.letter}
                      </span>
                      <ArrowRight
                        className="h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onRestart}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-600/25 transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reiniciar simulado
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Revisar questões
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
