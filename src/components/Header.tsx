import { CheckCircle2, ChevronDown, GraduationCap, Trophy } from "lucide-react";
import type { ExamMeta, StudentProfile } from "../types/question";
import type { SimuladoStats } from "../hooks/useSimulado";
import { cn } from "../lib/utils";

interface HeaderProps {
  readonly exam: ExamMeta;
  readonly student: StudentProfile;
  readonly stats: SimuladoStats;
  readonly onOpenResults: () => void;
}

export function Header({ exam, student, stats, onOpenResults }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-6 lg:py-3.5">
        {/* Identidade da plataforma */}
        <div className="flex min-w-0 items-center justify-between gap-3 lg:w-auto lg:justify-start">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm shadow-brand-600/30">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[15px] font-extrabold tracking-tight text-slate-900">
                  Simula<span className="text-brand-600">ENADE</span>
                </p>
                <span className="hidden rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700 ring-1 ring-inset ring-brand-100 sm:inline">
                  {exam.course}
                </span>
              </div>
              <p className="truncate text-xs font-medium text-slate-500">
                Simulado {exam.year} · {exam.totalQuestions} questões · {exam.durationMinutes} min
              </p>
            </div>
          </div>

          {/* Perfil (mobile) */}
          <button
            type="button"
            aria-label={`Perfil de ${student.name}`}
            className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2.5 transition hover:border-slate-300 hover:shadow-sm lg:hidden"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
              {student.initials}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          </button>
        </div>

        {/* Progresso geral */}
        <div className="flex flex-1 flex-col gap-2 lg:mx-2 lg:max-w-md">
          <div className="flex items-center justify-between gap-3 text-xs">
            <p className="font-semibold text-slate-700">
              {stats.answered} de {stats.total} questões respondidas
            </p>
            <span className="tabular-nums font-semibold text-slate-400">
              {stats.progressPercent}%
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={stats.total}
            aria-valuenow={stats.answered}
            aria-label="Progresso do simulado"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500 ease-out"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Indicadores + perfil (desktop) */}
        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="tabular-nums">{stats.correct}</span>
              <span className="font-medium text-emerald-600/80">acertos</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-100">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden="true" />
              <span className="tabular-nums">{stats.incorrect}</span>
              <span className="font-medium text-rose-600/80">erros</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenResults}
            disabled={!stats.isFinished}
            title={
              stats.isFinished
                ? "Ver desempenho final"
                : "Responda todas as questões para liberar o resultado"
            }
            aria-label="Ver desempenho final"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition sm:px-3",
              stats.isFinished
                ? "bg-slate-900 text-white shadow-sm hover:bg-slate-800"
                : "cursor-not-allowed bg-slate-100 text-slate-400",
            )}
          >
            <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Desempenho</span>
          </button>

          <div className="hidden items-center gap-2.5 border-l border-slate-200 pl-3 lg:flex">
            <div className="text-right">
              <p className="max-w-[150px] truncate text-xs font-bold text-slate-800">
                {student.name}
              </p>
              <p className="text-[11px] font-medium text-slate-400">{student.registration}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[11px] font-bold text-white ring-2 ring-white shadow-sm">
              {student.initials}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
