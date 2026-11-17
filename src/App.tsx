import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Clock3, FolderKanban, ShieldCheck } from "lucide-react";
import { Header, type AppView } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
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
  const viewParam = params.get("view");

  if (areaSlug || searchQuery || viewParam === "simulado") {
    const matchedArea = studyAreas.find((item) => item.slug === areaSlug);
    return {
      view: "simulado",
      context: {
        areaSlug,
        areaTitle:
          matchedArea?.title ??
          (searchQuery ? `Busca: "${searchQuery}"` : `${examMeta.title} ${examMeta.year}`),
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

  const activeView = routeState.view;
  const navContext = routeState.context;

  // Sincroniza o botão Voltar/Avançar do navegador com a view ativa
  useEffect(() => {
    const handlePopState = () => {
      setRouteState(readInitialRouteFromUrl());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Volta ao topo ao trocar de questão ou alternar entre Dashboard e Simulado
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
      if (nextContext.areaSlug) {
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
    <div className="min-h-screen bg-slate-50">
      <Header
        exam={examMeta}
        student={student}
        stats={stats}
        activeView={activeView}
        activeAreaTitle={navContext?.areaTitle}
        onOpenResults={() => setIsResultsOpen(true)}
        onNavigateHome={handleNavigateHome}
        onStartSimulado={() => handleNavigateToSimulado(navContext ?? undefined)}
      />

      {activeView === "dashboard" ? (
        <Dashboard
          exam={examMeta}
          student={student}
          stats={stats}
          onStartSimulado={handleNavigateToSimulado}
        />
      ) : (
        <main className="mx-auto max-w-[1360px] px-4 pb-16 pt-5 sm:px-6 sm:pt-6">
          {/* Linha de contexto e retorno ao Dashboard */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleNavigateHome}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Voltar às disciplinas
              </button>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                    {navContext?.areaTitle ?? "Resolução de prova"}
                  </h1>
                  {navContext?.areaSlug && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700 ring-1 ring-inset ring-brand-100">
                      <FolderKanban className="h-3 w-3" aria-hidden="true" />
                      Caderno ativo
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  {examMeta.title} {examMeta.year} · {examMeta.course}
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

          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6">
            <div className="order-1 lg:sticky lg:top-[104px]">
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
                Questões comentadas elaboradas a partir de provas oficiais do ENADE. Use as setas ou
                a navegação lateral para revisar antes de finalizar.
              </p>
            </div>
          </div>
        </main>
      )}

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
