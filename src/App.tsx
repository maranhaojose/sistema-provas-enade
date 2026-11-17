import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Clock3, FolderKanban, ShieldCheck } from "lucide-react";
import { Header, type AppView } from "./components/Header";
import { AppSidebar } from "./components/AppSidebar";
import { Dashboard } from "./components/Dashboard";
import { MetricsModal } from "./components/MetricsModal";
import { QuestionSidebar } from "./components/QuestionSidebar";
import { QuestionCard } from "./components/QuestionCard";
import { ResultsModal } from "./components/ResultsModal";
import { useSimulado } from "./hooks/useSimulado";
import { examMeta, questions, student } from "./data/questions";
import { studyAreas } from "./data/areas";
import type { SimuladoNavigationContext } from "./types/question";

function readInitialRouteFromUrl(): {
  view: AppView;
  context: SimuladoNavigationContext | null;
} {
  if (typeof window === "undefined") {
    return { view: "dashboard", context: null };
  }

  const params = new URLSearchParams(window.location.search);
  const areaSlug = params.get("area") ?? undefined;
  const searchQuery = params.get("q") ?? undefined;
  const yearParam = params.get("ano");
  const parsedYear = yearParam ? Number(yearParam) : undefined;
  const viewParam = params.get("view");

  if (areaSlug || searchQuery || parsedYear || viewParam === "simulado") {
    const matchedArea = studyAreas.find((item) => item.slug === areaSlug);
    return {
      view: "simulado",
      context: {
        areaSlug,
        year: parsedYear,
        areaTitle:
          matchedArea?.title ??
          (parsedYear
            ? `Prova ENADE ${parsedYear} · Todas as Questões`
            : searchQuery
              ? `Busca: "${searchQuery}"`
              : `${examMeta.title} ${examMeta.year}`),
        searchQuery,
      },
    };
  }

  return { view: "dashboard", context: null };
}

export default function App() {
  const {
    currentIndex,
    currentQuestion,
    answers,
    stats,
    currentSelection,
    isCurrentConfirmed,
    selectAlternative,
    confirmAnswer,
    goToQuestion,
    goToNext,
    goToPrevious,
    getStatus,
    restart,
  } = useSimulado(questions);

  const [routeState, setRouteState] = useState(readInitialRouteFromUrl);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const activeView = routeState.view;
  const navContext = routeState.context;

  useEffect(() => {
    const handlePopState = () => {
      setRouteState(readInitialRouteFromUrl());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex, activeView]);

  const handleNavigateToSimulado = useCallback((context?: SimuladoNavigationContext) => {
    const nextContext: SimuladoNavigationContext = context ?? {
      areaSlug: "simulado-geral",
      areaTitle: `${examMeta.title} ${examMeta.year}`,
    };

    if (typeof window !== "undefined") {
      const params = new URLSearchParams();
      if (typeof nextContext.year === "number") {
        params.set("ano", String(nextContext.year));
      } else if (nextContext.areaSlug) {
        params.set("area", nextContext.areaSlug);
      } else {
        params.set("view", "simulado");
      }
      if (nextContext.searchQuery) {
        params.set("q", nextContext.searchQuery);
      }
      const queryString = params.toString();
      const nextUrl = queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname;
      window.history.pushState({ view: "simulado", context: nextContext }, "", nextUrl);
    }

    setRouteState({ view: "simulado", context: nextContext });
  }, []);

  const handleNavigateHome = useCallback(() => {
    if (typeof window !== "undefined") {
      window.history.pushState({ view: "dashboard" }, "", window.location.pathname);
    }
    setRouteState((previous) => ({ ...previous, view: "dashboard" }));
  }, []);

  const handleRestart = () => {
    restart();
    setIsResultsOpen(false);
  };

  const handleReview = (questionIndex: number) => {
    goToQuestion(questionIndex);
    setIsResultsOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Navegação Lateral Expansível */}
      <AppSidebar
        isExpanded={isSidebarExpanded}
        isMobileOpen={isMobileNavOpen}
        activeView={activeView}
        activeYear={navContext?.year}
        student={student}
        onToggleExpand={() => setIsSidebarExpanded((value) => !value)}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onNavigateHome={handleNavigateHome}
        onStartSimulado={handleNavigateToSimulado}
        onOpenMetrics={() => setIsMetricsOpen(true)}
      />

      {/* Área Principal (Header limpo + Conteúdo) */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          exam={examMeta}
          student={student}
          stats={stats}
          activeView={activeView}
          activeAreaTitle={navContext?.areaTitle}
          onOpenResults={() => setIsResultsOpen(true)}
          onOpenMetrics={() => setIsMetricsOpen(true)}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
        />

        {activeView === "dashboard" ? (
          <Dashboard onStartSimulado={handleNavigateToSimulado} />
        ) : (
          <main className="mx-auto w-full max-w-[1360px] px-4 pb-16 pt-5 sm:px-6">
            {/* Linha de contexto e retorno */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleNavigateHome}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  Voltar ao início
                </button>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                      {navContext?.areaTitle ?? "Resolução de prova"}
                    </h1>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700 ring-1 ring-inset ring-brand-100">
                      <FolderKanban className="h-3 w-3" aria-hidden="true" />
                      {typeof navContext?.year === "number"
                        ? `Edição ${navContext.year}`
                        : "Caderno ativo"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {examMeta.title} · {examMeta.course}
                    {navContext?.searchQuery ? ` · Filtro: "${navContext.searchQuery}"` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  {examMeta.durationMinutes} minutos
                </span>
                <span className="hidden items-center gap-1.5 sm:inline-flex">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                  Respostas salvas automaticamente
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-6">
              <div className="order-1 lg:sticky lg:top-[84px]">
                <QuestionSidebar
                  questions={questions}
                  currentIndex={currentIndex}
                  stats={stats}
                  getStatus={getStatus}
                  onSelect={goToQuestion}
                  onOpenResults={() => setIsResultsOpen(true)}
                />
              </div>

              <div className="order-2 min-w-0">
                <QuestionCard
                  question={currentQuestion}
                  index={currentIndex}
                  total={questions.length}
                  selection={currentSelection}
                  isConfirmed={isCurrentConfirmed}
                  onSelect={selectAlternative}
                  onConfirm={confirmAnswer}
                  onNext={goToNext}
                  onPrevious={goToPrevious}
                />

                <p className="mt-4 px-1 text-center text-[11px] font-medium text-slate-400 lg:text-left">
                  Questões comentadas elaboradas a partir de provas oficiais do ENADE. Use as setas
                  ou a navegação lateral para revisar antes de finalizar.
                </p>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Popup de Métricas de Estudo */}
      <MetricsModal
        isOpen={isMetricsOpen}
        student={student}
        stats={stats}
        onClose={() => setIsMetricsOpen(false)}
        onStartSimulado={() => handleNavigateToSimulado()}
      />

      {/* Modal de Resultados do Simulado */}
      <ResultsModal
        isOpen={isResultsOpen}
        stats={stats}
        questions={questions}
        answers={answers}
        onClose={() => setIsResultsOpen(false)}
        onRestart={handleRestart}
        onReview={handleReview}
      />
    </div>
  );
}
