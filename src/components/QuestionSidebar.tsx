import { useState } from "react";
import { Check, ChevronDown, ListChecks, Trophy, X } from "lucide-react";
import type { Question, QuestionStatus } from "../types/question";
import type { SimuladoStats } from "../hooks/useSimulado";
import { cn } from "../lib/utils";

interface QuestionSidebarProps {
  readonly questions: readonly Question[];
  readonly currentIndex: number;
  readonly stats: SimuladoStats;
  readonly getStatus: (questionIndex: number) => QuestionStatus;
  readonly onSelect: (questionIndex: number) => void;
  readonly onOpenResults: () => void;
}

const statusStyles: Record<QuestionStatus, string> = {
  unanswered:
    "border-slate-200 bg-white text-slate-500 hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600 hover:shadow-sm",
  current:
    "border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-600/25 ring-2 ring-brand-100",
  correct: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300",
  incorrect: "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300",
};

const legendItems: ReadonlyArray<{ label: string; swatch: string }> = [
  { label: "Não respondida", swatch: "border border-slate-300 bg-white" },
  { label: "Atual", swatch: "bg-brand-600" },
  { label: "Acertou", swatch: "bg-emerald-400" },
  { label: "Errou", swatch: "bg-rose-400" },
];

export function QuestionSidebar({
  questions,
  currentIndex,
  stats,
  getStatus,
  onSelect,
  onOpenResults,
}: QuestionSidebarProps) {
  // No mobile a navegação inicia recolhida para priorizar a questão.
  const [isOpen, setIsOpen] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches,
  );

  return (
    <aside className="flex flex-col gap-4">
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 lg:cursor-default"
        >
          <span className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-brand-600" aria-hidden="true" />
            <span className="text-sm font-bold text-slate-900">Navegação de questões</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold tabular-nums text-slate-500">
              {stats.answered}/{stats.total}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-slate-400 transition-transform lg:hidden",
                isOpen && "rotate-180",
              )}
              aria-hidden="true"
            />
          </span>
        </button>

        <div className={cn("px-4 pb-4", !isOpen && "hidden lg:block")}>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((question, index) => {
              const status = getStatus(index);
              const isCurrent = index === currentIndex;
              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => onSelect(index)}
                  aria-label={`Ir para a questão ${index + 1} — ${
                    status === "correct"
                      ? "acertou"
                      : status === "incorrect"
                        ? "errou"
                        : status === "current"
                          ? "questão atual"
                          : "não respondida"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "relative flex aspect-square items-center justify-center rounded-xl border text-sm font-bold tabular-nums transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
                    statusStyles[status],
                  )}
                >
                  {index + 1}
                  {(status === "correct" || status === "incorrect") && (
                    <span
                      className={cn(
                        "absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-white ring-2 ring-white",
                        status === "correct" ? "bg-emerald-500" : "bg-rose-500",
                      )}
                      aria-hidden="true"
                    >
                      {status === "correct" ? (
                        <Check className="h-2.5 w-2.5" strokeWidth={4} />
                      ) : (
                        <X className="h-2.5 w-2.5" strokeWidth={4} />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <ul className="mt-4 grid grid-cols-2 gap-x-2 gap-y-2 border-t border-slate-100 pt-3.5">
            {legendItems.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                <span className={cn("h-2.5 w-2.5 rounded-[4px]", item.swatch)} aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card lg:block">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Seu progresso
        </p>
        <div className="mt-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">Respondidas</span>
            <span className="font-bold tabular-nums text-slate-800">
              {stats.answered}/{stats.total}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">Aproveitamento</span>
            <span className="font-bold tabular-nums text-slate-800">{stats.accuracyPercent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
              style={{ width: `${stats.accuracyPercent}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenResults}
          disabled={!stats.isFinished}
          className={cn(
            "mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition",
            stats.isFinished
              ? "bg-brand-600 text-white shadow-sm shadow-brand-600/25 hover:bg-brand-700"
              : "cursor-not-allowed bg-slate-100 text-slate-400",
          )}
        >
          <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
          Ver desempenho final
        </button>
        <p className="mt-2 text-center text-[10px] font-medium leading-relaxed text-slate-400">
          {stats.isFinished
            ? "Todas as questões foram respondidas."
            : `Faltam ${stats.total - stats.answered} questão(ões) para liberar o resultado.`}
        </p>
      </section>
    </aside>
  );
}
