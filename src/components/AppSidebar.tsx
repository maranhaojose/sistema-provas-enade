import {
  BarChart3,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import type { AppView } from "./Header";
import type { SimuladoNavigationContext } from "../types/question";
import { availableYears } from "../data/areas";
import { cn } from "../lib/utils";

interface AppSidebarProps {
  readonly isExpanded: boolean;
  readonly isMobileOpen: boolean;
  readonly activeView: AppView;
  readonly activeYear?: number | "Todos";
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
  onToggleExpand,
  onCloseMobile,
  onNavigateHome,
  onStartSimulado,
  onOpenMetrics,
}: AppSidebarProps) {
  const handleAction = (callback: () => void) => {
    callback();
    onCloseMobile();
  };

  const sidebarContent = (expanded: boolean, isMobile = false) => (
    <div className="flex h-full flex-col py-3.5">
      {/* Topo da Sidebar: Marca + Botão de expandir/recolher */}
      <div
        className={cn(
          "flex items-center px-3 pb-4",
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
        <div className="mb-3 flex justify-center px-2">
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

      {/* Navegação Principal */}
      <div className="px-2.5">
        {expanded && (
          <p className="mb-1.5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menu
          </p>
        )}
        <nav aria-label="Menu principal" className="space-y-1">
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
            aria-current={activeView === "simulado" && !activeYear ? "page" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all",
              !expanded && "justify-center px-0",
              activeView === "simulado" && !activeYear
                ? "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <ClipboardCheck className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
            {expanded && <span className="truncate">Simulado Geral</span>}
          </button>

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
        </nav>
      </div>

      {/* Atalhos Rápidos por Ano do ENADE */}
      <div className="mt-5 border-t border-slate-100 px-2.5 pt-4">
        {expanded ? (
          <p className="mb-1.5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Provas por Ano
          </p>
        ) : (
          <p className="mb-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Anos
          </p>
        )}
        <div className="space-y-1">
          {availableYears.map((year) => {
            const isSelectedYear = activeView === "simulado" && activeYear === year;
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
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all",
                  !expanded && "justify-center px-0",
                  isSelectedYear
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                {expanded ? (
                  <>
                    <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                    <span className="truncate">ENADE {year}</span>
                  </>
                ) : (
                  <span className="font-mono text-[11px] font-bold tabular-nums">
                    &rsquo;{String(year).slice(-2)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
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
          isExpanded ? "w-56" : "w-[68px]",
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
          <aside className="relative z-10 h-full w-60 bg-white shadow-2xl">
            {sidebarContent(true, true)}
          </aside>
        </div>
      )}
    </>
  );
}
