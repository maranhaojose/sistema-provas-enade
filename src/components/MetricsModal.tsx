import { useEffect, useRef } from "react";
import {
  Award,
  BarChart3,
  CheckCircle2,
  Play,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import type { StudentProfile } from "../types/question";
import type { SimuladoStats } from "../hooks/useSimulado";
import { globalStudySummary, studyAreas } from "../data/areas";

interface MetricsModalProps {
  readonly isOpen: boolean;
  readonly student: StudentProfile;
  readonly stats: SimuladoStats;
  readonly onClose: () => void;
  readonly onStartSimulado: () => void;
}

const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function MetricsModal({
  isOpen,
  student,
  stats,
  onClose,
  onStartSimulado,
}: MetricsModalProps) {
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

  const totalAnswered = globalStudySummary.baseAnswered + stats.answered;
  const totalCorrect = globalStudySummary.baseCorrect + stats.correct;
  const overallAccuracy =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const weeklyCurrent = globalStudySummary.weeklyGoalCurrent + stats.answered;
  const weeklyPercent = Math.min(
    100,
    Math.round((weeklyCurrent / globalStudySummary.weeklyGoalTarget) * 100),
  );
  const completedExams = globalStudySummary.completedExams + (stats.isFinished ? 1 : 0);

  const dashOffset = CIRCUMFERENCE - (overallAccuracy / 100) * CIRCUMFERENCE;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="metrics-modal-title"
        className="animate-scale-in w-full max-w-xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Cabeçalho do modal */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-brand-900 px-6 pb-6 pt-6 text-white">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar métricas"
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="flex flex-col items-center gap-5 sm:flex-row sm:text-left">
            <div className="relative h-28 w-28 shrink-0">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r={RADIUS}
                  fill="none"
                  strokeWidth="8"
                  className="stroke-white/10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={RADIUS}
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                  className="stroke-emerald-400 transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold tabular-nums">{overallAccuracy}%</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/60">
                  Acerto Geral
                </span>
              </div>
            </div>

            <div className="text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-200 ring-1 ring-inset ring-white/15">
                <BarChart3 className="h-3 w-3" aria-hidden="true" />
                Métricas de Desempenho
              </span>
              <h2 id="metrics-modal-title" className="mt-2 text-lg font-bold tracking-tight">
                {student.name}
              </h2>
              <p className="mt-0.5 text-xs text-slate-300">
                {student.course} · Matrícula {student.registration}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Você já resolveu <strong className="text-white">{totalAnswered}</strong> de{" "}
                <strong className="text-white">{globalStudySummary.totalBankQuestions}</strong>{" "}
                questões oficiais disponíveis no banco.
              </p>
            </div>
          </div>
        </div>

        {/* Corpo com KPIs e progresso por área */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-center">
              <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="mt-1.5 text-lg font-extrabold tabular-nums text-slate-900">
                {totalAnswered}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Respondidas
              </p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-center">
              <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100/80 text-emerald-600">
                <Target className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="mt-1.5 text-lg font-extrabold tabular-nums text-emerald-600">
                {totalCorrect}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/70">
                Acertos
              </p>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-center">
              <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100/80 text-amber-600">
                <Award className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="mt-1.5 text-lg font-extrabold tabular-nums text-amber-700">
                {completedExams}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700/70">
                Simulados
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-center">
              <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="mt-1.5 text-lg font-extrabold tabular-nums text-slate-900">
                {weeklyPercent}%
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Meta ({weeklyCurrent}/{globalStudySummary.weeklyGoalTarget})
              </p>
            </div>
          </div>

          {/* Desempenho resumido por disciplina */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Aproveitamento por disciplina
              </p>
              <span className="text-[10px] font-semibold text-slate-400">Taxa de acerto</span>
            </div>

            <ul className="mt-2.5 max-h-48 space-y-2.5 overflow-y-auto pr-1">
              {studyAreas.map((area) => (
                <li key={area.id} className="flex items-center gap-3 text-xs">
                  <span className="w-40 truncate font-semibold text-slate-700 sm:w-48">
                    {area.title}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500"
                      style={{ width: `${area.accuracyPercent}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-bold tabular-nums text-slate-700">
                    {area.accuracyPercent}%
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ações do modal */}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartSimulado();
              }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-brand-600/25 transition hover:bg-brand-700 sm:text-sm"
            >
              <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              Praticar Agora
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 sm:text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
