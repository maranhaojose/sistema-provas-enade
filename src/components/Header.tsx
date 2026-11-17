import {
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  LayoutGrid,
  Play,
  Target,
  Trophy,
} from "lucide-react";
import type { ExamMeta, StudentProfile } from "../types/question";
import type { SimuladoStats } from "../hooks/useSimulado";
import { globalStudySummary } from "../data/areas";
import { cn } from "../lib/utils";

export type AppView = "dashboard" | "simulado";

interface HeaderProps {
  readonly exam: ExamMeta;
  readonly student: StudentProfile;
  readonly stats: SimuladoStats;
  readonly activeView?: AppView;
  readonly activeAreaTitle?: string;
  readonly onOpenResults: () => void;
  readonly onNavigateHome?: () => void;
  readonly onStartSimulado?: () => void;
}

export function Header({
  exam,
  student,
  stats,
  activeView = "simulado",
  activeAreaTitle,
  onOpenResults,
  onNavigateHome,
  onStartSimulado,
}: HeaderProps) {
  const isDashboard = activeView === "dashboard";

  // Combina o histórico acumulado da estudante com as respostas da sessão atual
  const totalAnsweredOverall = globalStudySummary.baseAnswered + stats.answered;
  const totalCorrectOverall = globalStudySummary.baseCorrect + stats.correct;
  const overallAccuracy =
    totalAnsweredOverall > 0 ? Math.round((totalCorrectOverall / totalAnsweredOverall) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:py-3.5">
        {/* Identidade da plataforma + Navegação rápida */}
        <div className="flex min-w-0 items-center justify-between gap-3 lg:w-auto lg:justify-start lg:gap-5">
          <button
            type="button"
            onClick={onNavigateHome}
            aria-label="Ir para a página inicial do SimulaENADE"
            className="group flex min-w-0 items-center gap-3 rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm shadow-brand-600/30 transition-transform duration-200 group-hover:scale-[1.03]">
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
                {isDashboard
                  ? `Preparação ENADE ${exam.year} · Banco de Questões`
                  : `${activeAreaTitle ?? `Simulado ${exam.year}`} · ${exam.totalQuestions} questões · ${exam.durationMinutes} min`}
              </p>
            </div>
          </button>

          {/* Navegação rápida entre páginas (Desktop) */}
          {onNavigateHome && onStartSimulado && (
            <nav
              aria-label="Navegação principal"
              className="hidden items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-100/80 p-1 xl:flex"
            >
              <button
                type="button"
                onClick={onNavigateHome}
                aria-current={isDashboard ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                  isDashboard
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                Explorar Áreas
              </button>
              <button
                type="button"
                onClick={onStartSimulado}
                aria-current={!isDashboard ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                  !isDashboard
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                <Play className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                Simulado Ativo
                {stats.answered > 0 && (
                  <span className="rounded-full bg-brand-50 px-1.5 py-0.2 text-[10px] font-bold tabular-nums text-brand-700">
                    {stats.answered}/{stats.total}
                  </span>
                )}
              </button>
            </nav>
          )}

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

        {/* Barra central: Progresso do simulado (na tela de prova) ou Meta semanal (no Dashboard) */}
        {!isDashboard ? (
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
        ) : (
          <div className="hidden flex-1 flex-col gap-1.5 lg:mx-2 lg:flex lg:max-w-xs">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-600">Domínio da trilha ENADE</span>
              <span className="tabular-nums font-bold text-brand-600">
                {Math.round((totalAnsweredOverall / globalStudySummary.totalBankQuestions) * 100)}%
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={globalStudySummary.totalBankQuestions}
              aria-valuenow={totalAnsweredOverall}
              aria-label="Progresso geral no banco de questões"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((totalAnsweredOverall / globalStudySummary.totalBankQuestions) * 100),
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Indicadores + Ação + Perfil (desktop e mobile) */}
        <div className="flex items-center justify-between gap-2.5 sm:gap-3 lg:justify-end">
          {isDashboard ? (
            <div className="flex flex-wrap items-center gap-2">
              <span
                title="Total de questões respondidas na plataforma"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-100"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                <span className="tabular-nums font-bold">{totalAnsweredOverall}</span>
                <span className="font-medium text-brand-600/85">respondidas</span>
              </span>
              <span
                title="Taxa de acerto geral acumulada"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100"
              >
                <Target className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                <span className="tabular-nums font-bold">{overallAccuracy}%</span>
                <span className="hidden font-medium text-emerald-600/85 sm:inline">de acerto</span>
              </span>
            </div>
          ) : (
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
          )}

          {isDashboard ? (
            <button
              type="button"
              onClick={onStartSimulado}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-brand-600/25 transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              <span>Iniciar Simulado</span>
            </button>
          ) : (
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
          )}

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
