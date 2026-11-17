import { BarChart3, CheckCircle2, Menu, Trophy } from "lucide-react";
import type { ExamMeta, StudentProfile } from "../types/question";
import type { SimuladoStats } from "../hooks/useSimulado";
import { cn } from "../lib/utils";

export type AppView = "dashboard" | "simulado";

interface HeaderProps {
  readonly exam: ExamMeta;
  readonly student: StudentProfile;
  readonly stats: SimuladoStats;
  readonly activeView?: AppView;
  readonly activeAreaTitle?: string;
  readonly onOpenResults: () => void;
  readonly onOpenMetrics: () => void;
  readonly onOpenMobileNav: () => void;
}

export function Header({
  exam,
  student,
  stats,
  activeView = "simulado",
  activeAreaTitle,
  onOpenResults,
  onOpenMetrics,
  onOpenMobileNav,
}: HeaderProps) {
  const isDashboard = activeView === "dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Esquerda: Gatilho Mobile + Contexto da Página */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileNav}
            aria-label="Abrir menu de navegação"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 lg:hidden"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-bold tracking-tight text-slate-900 sm:text-[15px]">
                {isDashboard ? "Banco de Questões e Simulados" : (activeAreaTitle ?? exam.title)}
              </p>
              <span className="hidden rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700 ring-1 ring-inset ring-brand-100 sm:inline">
                {exam.course}
              </span>
            </div>
            <p className="truncate text-[11px] font-medium text-slate-400">
              {isDashboard
                ? "Selecione um ano do ENADE ou uma disciplina para praticar"
                : `${stats.answered} de ${stats.total} respondidas (${stats.progressPercent}%)`}
            </p>
          </div>
        </div>

        {/* Direita: Botão de Métricas (Popup) + Status da Prova + Perfil */}
        <div className="flex shrink-0 items-center gap-2.5">
          {!isDashboard && (
            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="tabular-nums">{stats.correct}</span>
              </span>
              <button
                type="button"
                onClick={onOpenResults}
                disabled={!stats.isFinished}
                title={
                  stats.isFinished
                    ? "Ver resultado do simulado"
                    : "Responda todas as questões para liberar o resultado"
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition",
                  stats.isFinished
                    ? "bg-slate-900 text-white shadow-sm hover:bg-slate-800"
                    : "cursor-not-allowed bg-slate-100 text-slate-400",
                )}
              >
                <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden md:inline">Resultado</span>
              </button>
            </div>
          )}

          {/* Botão Principal para abrir o Popup de Métricas */}
          <button
            type="button"
            onClick={onOpenMetrics}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <BarChart3 className="h-4 w-4 text-brand-600" aria-hidden="true" />
            <span>Ver Métricas</span>
          </button>

          {/* Avatar compacto */}
          <div className="hidden items-center gap-2 border-l border-slate-200 pl-2.5 sm:flex">
            <span
              title={`${student.name} (${student.registration})`}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white"
            >
              {student.initials}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
