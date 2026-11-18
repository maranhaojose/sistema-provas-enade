import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  Trophy,
} from "lucide-react";
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
  readonly onOpenSettings: () => void;
  readonly onLogout: () => void;
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
  onOpenSettings,
  onLogout,
}: HeaderProps) {
  const isDashboard = activeView === "dashboard";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Esquerda: Gatilho Mobile + Título da Página */}
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
                {isDashboard ? "Início" : (activeAreaTitle ?? exam.title)}
              </p>
              <span className="hidden rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700 ring-1 ring-inset ring-brand-100 sm:inline">
                {exam.course}
              </span>
            </div>
            <p className="truncate text-[11px] font-medium text-slate-400">
              {isDashboard
                ? "Provas anteriores e questões por disciplina"
                : `${stats.answered} de ${stats.total} respondidas (${stats.progressPercent}%)`}
            </p>
          </div>
        </div>

        {/* Direita: Botão Ver Métricas + Perfil com menu sanfona logo abaixo */}
        <div className="flex shrink-0 items-center gap-3">
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
                    ? "Ver desempenho final"
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

          {/* Botão para abrir o Popup de Métricas */}
          <button
            type="button"
            onClick={onOpenMetrics}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <BarChart3 className="h-4 w-4 text-brand-600" aria-hidden="true" />
            <span>Ver Métricas</span>
          </button>

          {/* Container do Perfil + Menu Sanfona logo abaixo do botão */}
          <div ref={menuContainerRef} className="relative lg:border-l lg:border-slate-200 lg:pl-3">
            {/* Gatilho Mobile */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
              aria-label={`Abrir menu de ${student.name}`}
              className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2.5 transition hover:border-slate-300 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                {student.initials}
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-slate-400 transition-transform duration-200",
                  isMenuOpen && "rotate-180 text-slate-700",
                )}
                aria-hidden="true"
              />
            </button>

            {/* Gatilho Desktop (Nome + Matrícula + Iniciais) */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
              title="Abrir menu da conta"
              className={cn(
                "group hidden items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:flex",
                isMenuOpen ? "bg-slate-100" : "hover:bg-slate-100/80",
              )}
            >
              <div className="text-right">
                <p className="max-w-[150px] truncate text-xs font-bold text-slate-800 group-hover:text-brand-700">
                  {student.name}
                </p>
                <p className="text-[11px] font-medium text-slate-400">{student.registration}</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[11px] font-bold text-white shadow-sm ring-2 ring-white transition group-hover:from-brand-600 group-hover:to-brand-800">
                {student.initials}
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:text-slate-700",
                  isMenuOpen && "rotate-180 text-brand-600",
                )}
                aria-hidden="true"
              />
            </button>

            {/* Menu estilo sanfona (dropdown) posicionado logo abaixo do botão */}
            <div
              role="menu"
              aria-label="Opções do usuário"
              className={cn(
                "absolute right-0 top-full z-50 mt-2 w-48 origin-top overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl transition-all duration-200 ease-out",
                isMenuOpen
                  ? "max-h-48 translate-y-0 opacity-100"
                  : "pointer-events-none max-h-0 -translate-y-1 border-transparent opacity-0",
              )}
            >
              {/* Itens: Configurações e Sair */}
              <div className="p-1.5 space-y-0.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:bg-slate-100"
                >
                  <Settings className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                  <span>Configurações</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus-visible:bg-rose-50"
                >
                  <LogOut className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
