import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  ClipboardCheck,
  Code2,
  Cpu,
  Database,
  FileText,
  GitFork,
  GraduationCap,
  Home,
  Layers,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Terminal,
  X,
} from "lucide-react";
import type { AppView } from "./Header";
import type { SimuladoNavigationContext, StudyArea } from "../types/question";
import { availableYears, studyAreas, yearQuestionsCount } from "../data/areas";
import { cn } from "../lib/utils";

const areaIconMap = {
  Code2,
  Database,
  GitFork,
  Network,
  Terminal,
  Cpu,
  BrainCircuit,
  Layers,
} as const;

interface AppSidebarProps {
  readonly isExpanded: boolean;
  readonly isMobileOpen: boolean;
  readonly activeView: AppView;
  readonly activeYear?: number | "Todos";
  readonly activeAreaSlug?: string;
  readonly onToggleExpand: () => void;
  readonly onCloseMobile: () => void;
  readonly onNavigateHome: () => void;
  readonly onStartSimulado: (context?: SimuladoNavigationContext) => void;
  readonly onOpenMetrics: () => void;
}

export function AppSidebar({
  isExpanded,
  isMobileOpen,
  activeView,
  activeYear,
  activeAreaSlug,
  onToggleExpand,
  onCloseMobile,
  onNavigateHome,
  onStartSimulado,
  onOpenMetrics,
}: AppSidebarProps) {
  const [isDisciplinasOpen, setIsDisciplinasOpen] = useState(false);
  const [isYearsOpen, setIsYearsOpen] = useState(false);

  const handleAction = (callback: () => void) => {
    callback();
    onCloseMobile();
  };

  const handleSelectArea = (area: StudyArea) => {
    handleAction(() =>
      onStartSimulado({
        areaSlug: area.slug,
        areaTitle: area.title,
        category: area.category,
      }),
    );
  };

  const handleToggleDisciplinas = (expanded: boolean) => {
    if (!expanded) {
      onToggleExpand();
      setIsDisciplinasOpen(true);
      return;
    }
    setIsDisciplinasOpen((prev) => !prev);
  };

  const handleToggleYears = (expanded: boolean) => {
    if (!expanded) {
      onToggleExpand();
      setIsYearsOpen(true);
      return;
    }
    setIsYearsOpen((prev) => !prev);
  };

  const isGeneralSimulado =
    activeView === "simulado" &&
    !activeYear &&
    (!activeAreaSlug || activeAreaSlug === "simulado-geral");

  const hasActiveDiscipline =
    activeView === "simulado" &&
    Boolean(activeAreaSlug) &&
    activeAreaSlug !== "simulado-geral" &&
    !activeAreaSlug?.startsWith("enade-");

  const hasActiveYear =
    activeView === "simulado" &&
    typeof activeYear === "number" &&
    (!activeAreaSlug || activeAreaSlug.startsWith("enade-"));

  const sidebarContent = (expanded: boolean, isMobile = false) => (
    <div className="flex h-full flex-col py-3.5">
      {/* Topo da Sidebar: Marca + Botão de expandir/recolher */}
      <div
        className={cn(
          "flex shrink-0 items-center px-3 pb-4",
          expanded ? "justify-between" : "justify-center",
        )}
      >
        <button
          type="button"
          onClick={() => handleAction(onNavigateHome)}
          aria-label="Ir para o início"
          className={cn(
            "flex items-center gap-2.5 rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
            !expanded && "justify-center",
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm shadow-brand-600/30">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          {expanded && (
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold tracking-tight text-slate-900">
                Simula<span className="text-brand-600">ENADE</span>
              </p>
              <p className="truncate text-[10px] font-semibold text-slate-400">Computação</p>
            </div>
          )}
        </button>

        {isMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Fechar menu lateral"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          expanded && (
            <button
              type="button"
              onClick={onToggleExpand}
              title="Recolher menu lateral"
              aria-label="Recolher menu lateral"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
            </button>
          )
        )}
      </div>

      {/* Botão de expandir quando recolhido (Desktop) */}
      {!expanded && !isMobile && (
        <div className="mb-3 flex shrink-0 justify-center px-2">
          <button
            type="button"
            onClick={onToggleExpand}
            title="Expandir menu lateral"
            aria-label="Expandir menu lateral"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600"
          >
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Área rolável da Sidebar */}
      <div className="flex-1 overflow-y-auto px-2.5">
        {expanded && (
          <p className="mb-1.5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menu
          </p>
        )}

        <nav aria-label="Menu principal" className="space-y-1">
          {/* Início */}
          <button
            type="button"
            onClick={() => handleAction(onNavigateHome)}
            title="Início"
            aria-current={activeView === "dashboard" ? "page" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all",
              !expanded && "justify-center px-0",
              activeView === "dashboard"
                ? "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <Home className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
            {expanded && <span className="truncate">Início</span>}
          </button>

          {/* Simulado Geral */}
          <button
            type="button"
            onClick={() =>
              handleAction(() =>
                onStartSimulado({
                  areaSlug: "simulado-geral",
                  areaTitle: "Simulado Geral ENADE",
                }),
              )
            }
            title="Simulado Geral"
            aria-current={isGeneralSimulado ? "page" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all",
              !expanded && "justify-center px-0",
              isGeneralSimulado
                ? "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <ClipboardCheck className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
            {expanded && <span className="truncate">Simulado Geral</span>}
          </button>

          {/* Ver Métricas */}
          <button
            type="button"
            onClick={() => handleAction(onOpenMetrics)}
            title="Ver Métricas"
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900",
              !expanded && "justify-center px-0",
            )}
          >
            <BarChart3 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            {expanded && <span className="truncate">Ver Métricas</span>}
          </button>

          {/* Sanfona 1: Disciplinas */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => handleToggleDisciplinas(expanded)}
              aria-expanded={expanded ? isDisciplinasOpen : false}
              title="Disciplinas"
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all",
                !expanded && "justify-center px-0",
                hasActiveDiscipline || (expanded && isDisciplinasOpen)
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <BookOpen className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              {expanded && (
                <>
                  <span className="truncate">Disciplinas</span>
                  <ChevronDown
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
                      isDisciplinasOpen && "rotate-180 text-brand-600",
                    )}
                    aria-hidden="true"
                  />
                </>
              )}
            </button>

            {expanded && (
              <div
                className={cn(
                  "grid transition-all duration-200 ease-out",
                  isDisciplinasOpen
                    ? "mt-1 grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <div className="ml-3 space-y-1 border-l border-slate-200/80 pl-2.5 pt-0.5">
                    {studyAreas.map((area) => {
                      const IconComponent = areaIconMap[area.iconName];
                      const isSelectedArea =
                        activeView === "simulado" && activeAreaSlug === area.slug;

                      return (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => handleSelectArea(area)}
                          title={`${area.title} (${area.totalQuestions} questões)`}
                          aria-current={isSelectedArea ? "page" : undefined}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all",
                            isSelectedArea
                              ? "bg-brand-600 text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                          )}
                        >
                          <IconComponent
                            className={cn(
                              "h-3.5 w-3.5 shrink-0",
                              isSelectedArea ? "text-white" : "text-brand-600",
                            )}
                            aria-hidden="true"
                          />
                          <span className="truncate text-left">{area.title}</span>
                          <span
                            className={cn(
                              "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                              isSelectedArea
                                ? "bg-white/20 text-white"
                                : "bg-slate-100 text-slate-500",
                            )}
                          >
                            {area.totalQuestions}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sanfona 2: Provas por Ano */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => handleToggleYears(expanded)}
              aria-expanded={expanded ? isYearsOpen : false}
              title="Provas por Ano"
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all",
                !expanded && "justify-center px-0",
                hasActiveYear || (expanded && isYearsOpen)
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <FileText className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              {expanded && (
                <>
                  <span className="truncate">Provas por Ano</span>
                  <ChevronDown
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
                      isYearsOpen && "rotate-180 text-brand-600",
                    )}
                    aria-hidden="true"
                  />
                </>
              )}
            </button>

            {expanded && (
              <div
                className={cn(
                  "grid transition-all duration-200 ease-out",
                  isYearsOpen
                    ? "mt-1 grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <div className="ml-3 space-y-1 border-l border-slate-200/80 pl-2.5 pt-0.5">
                    {availableYears.map((year) => {
                      const isSelectedYear =
                        activeView === "simulado" &&
                        activeYear === year &&
                        (!activeAreaSlug || activeAreaSlug.startsWith("enade-"));

                      return (
                        <button
                          key={year}
                          type="button"
                          onClick={() =>
                            handleAction(() =>
                              onStartSimulado({
                                areaSlug: `enade-${year}`,
                                areaTitle: `Prova ENADE ${year} · Todas as Questões`,
                                year,
                              }),
                            )
                          }
                          title={`Prova ENADE ${year}`}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all",
                            isSelectedYear
                              ? "bg-slate-900 text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                          )}
                        >
                          <FileText
                            className={cn(
                              "h-3.5 w-3.5 shrink-0",
                              isSelectedYear ? "text-slate-300" : "text-slate-400",
                            )}
                            aria-hidden="true"
                          />
                          <span className="truncate">ENADE {year}</span>
                          <span
                            className={cn(
                              "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                              isSelectedYear
                                ? "bg-white/15 text-white"
                                : "bg-slate-100 text-slate-500",
                            )}
                          >
                            {yearQuestionsCount[year] ?? 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop (Expansível) */}
      <aside
        aria-label="Barra lateral de navegação"
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r border-slate-200/80 bg-white transition-all duration-200 lg:block",
          isExpanded ? "w-64" : "w-[68px]",
        )}
      >
        {sidebarContent(isExpanded, false)}
      </aside>

      {/* Drawer Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
        >
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 h-full w-64 bg-white shadow-2xl">
            {sidebarContent(true, true)}
          </aside>
        </div>
      )}
    </>
  );
}
