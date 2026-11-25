import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Clock3,
  FolderKanban,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { AccessPortalScreen } from "./components/AccessPortalScreen";
import {
  AdminManagementModal,
  type AdminPanelTab,
} from "./components/AdminManagementModal";
import { AuthModal } from "./components/AuthModal";
import { Header, type AppView } from "./components/Header";
import { AppSidebar } from "./components/AppSidebar";
import { Dashboard } from "./components/Dashboard";
import { MetricsModal } from "./components/MetricsModal";
import { QuestionSidebar } from "./components/QuestionSidebar";
import { QuestionCard } from "./components/QuestionCard";
import { ResultsModal } from "./components/ResultsModal";
import { UserProfileModal, type UserModalTab } from "./components/UserProfileModal";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useSimulado } from "./hooks/useSimulado";
import { examMeta, filterQuestionsByContext, questions, student } from "./data/questions";
import { availableYears, studyAreas } from "./data/areas";
import { cn } from "./lib/utils";
import type { AuthRole } from "./types/auth";
import type { AppUser } from "./types/user";
import type { SimuladoNavigationContext, StudentProfile } from "./types/question";

const AUTH_ROLE_TO_USER_ROLE: Record<AuthRole, AppUser["role"]> = {
  student: "STUDENT",
  professor: "PROFESSOR",
  admin: "ADMIN",
};

function buildStudentProfile(user: AppUser): StudentProfile {
  if (user.role === "STUDENT") {
    return {
      ...student,
      name: user.name,
      initials: user.initials,
      registration: user.registration,
      course: user.course,
    };
  }

  return { ...student, name: user.name, initials: user.initials };
}

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
        areaSlug: areaSlug ?? (parsedYear ? `enade-${parsedYear}` : "simulado-geral"),
        year: parsedYear,
        areaTitle:
          matchedArea?.title ??
          (parsedYear
            ? `Prova ENADE ${parsedYear} · Todas as Questões`
            : searchQuery
              ? `Busca: "${searchQuery}"`
              : `${examMeta.title} · Todas as Edições`),
        searchQuery,
      },
    };
  }

  return { view: "dashboard", context: null };
}

function AppContent() {
  const { user, isLoading: isAuthLoading, logout, updateUser } = useAuth();
  const [authModalRole, setAuthModalRole] = useState<AppUser["role"] | null>(null);
  const [showLogoutNotice, setShowLogoutNotice] = useState(false);
  const [routeState, setRouteState] = useState(readInitialRouteFromUrl);
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(student);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalTab, setUserModalTab] = useState<UserModalTab>("menu");
  const [adminPanelTab, setAdminPanelTab] = useState<AdminPanelTab | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const activeView = routeState.view;
  const navContext = routeState.context;

  const activeQuestions = useMemo(
    () => filterQuestionsByContext(questions, navContext),
    [navContext],
  );

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
  } = useSimulado(activeQuestions);

  useEffect(() => {
    const handlePopState = () => {
      setRouteState(readInitialRouteFromUrl());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (user) setStudentProfile(buildStudentProfile(user));
  }, [user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex, activeView, navContext]);

  const handleNavigateToSimulado = useCallback((context?: SimuladoNavigationContext) => {
    const nextContext: SimuladoNavigationContext = context ?? {
      areaSlug: "simulado-geral",
      areaTitle: "Simulado Geral · Todas as Edições",
    };

    if (typeof window !== "undefined") {
      const params = new URLSearchParams();
      if (
        nextContext.areaSlug &&
        nextContext.areaSlug !== "simulado-geral" &&
        !nextContext.areaSlug.startsWith("enade-")
      ) {
        params.set("area", nextContext.areaSlug);
      }
      if (typeof nextContext.year === "number") {
        params.set("ano", String(nextContext.year));
      }
      if (nextContext.searchQuery) {
        params.set("q", nextContext.searchQuery);
      }
      if (!params.toString()) {
        params.set("view", "simulado");
      }
      const queryString = params.toString();
      const nextUrl = queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname;
      window.history.pushState({ view: "simulado", context: nextContext }, "", nextUrl);
    }

    setRouteState({ view: "simulado", context: nextContext });
  }, []);

  const handleFilterYearInSimulado = useCallback(
    (year?: number) => {
      const isSpecificTheme =
        Boolean(navContext?.areaSlug) &&
        navContext?.areaSlug !== "simulado-geral" &&
        !navContext?.areaSlug?.startsWith("enade-");

      if (isSpecificTheme && navContext?.areaSlug) {
        const matchedArea = studyAreas.find((a) => a.slug === navContext.areaSlug);
        handleNavigateToSimulado({
          ...navContext,
          year,
          areaTitle: matchedArea
            ? year
              ? `${matchedArea.title} · ENADE ${year}`
              : matchedArea.title
            : navContext.areaTitle,
        });
        return;
      }

      if (year) {
        handleNavigateToSimulado({
          areaSlug: `enade-${year}`,
          areaTitle: `Prova ENADE ${year} · Todas as Questões`,
          year,
        });
      } else {
        handleNavigateToSimulado({
          areaSlug: "simulado-geral",
          areaTitle: "Simulado Geral · Todas as Edições",
        });
      }
    },
    [handleNavigateToSimulado, navContext],
  );

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

  const handleOpenSettings = () => {
    setUserModalTab("settings");
    setIsUserModalOpen(true);
  };

  const handleSelectAuthRole = (role: AuthRole) => {
    setShowLogoutNotice(false);
    setAuthModalRole(AUTH_ROLE_TO_USER_ROLE[role]);
  };

  const handleLogout = () => {
    setIsUserModalOpen(false);
    setIsMetricsOpen(false);
    setIsResultsOpen(false);
    setIsMobileNavOpen(false);
    setAuthModalRole(null);
    setAdminPanelTab(null);
    logout();
    setShowLogoutNotice(true);
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-semibold text-slate-500">Carregando sua sessão...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AccessPortalScreen
          logoutNotice={showLogoutNotice}
          onSelectRole={handleSelectAuthRole}
        />
        {authModalRole && (
          <AuthModal
            initialRole={authModalRole}
            onClose={() => setAuthModalRole(null)}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Navegação Lateral Expansível */}
      <AppSidebar
        isExpanded={isSidebarExpanded}
        isMobileOpen={isMobileNavOpen}
        activeView={activeView}
        activeYear={navContext?.year}
        activeAreaSlug={navContext?.areaSlug}
        user={user}
        onToggleExpand={() => setIsSidebarExpanded((value) => !value)}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onNavigateHome={handleNavigateHome}
        onStartSimulado={handleNavigateToSimulado}
        onOpenMetrics={() => setIsMetricsOpen(true)}
        onOpenAdminPanel={(tab) => setAdminPanelTab(tab)}
      />

      {/* Área Principal (Header limpo + Conteúdo) */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          exam={examMeta}
          user={user}
          student={studentProfile}
          stats={stats}
          activeView={activeView}
          activeAreaTitle={navContext?.areaTitle}
          onOpenResults={() => setIsResultsOpen(true)}
          onOpenMetrics={() => setIsMetricsOpen(true)}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onOpenSettings={handleOpenSettings}
          onLogout={handleLogout}
        />

        {activeView === "dashboard" ? (
          <Dashboard user={user} answers={answers} onStartSimulado={handleNavigateToSimulado} />
        ) : (
          <main className="mx-auto w-full max-w-[1360px] px-4 pb-16 pt-5 sm:px-6">
            {/* Linha de contexto, filtro rápido por ano e retorno */}
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
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
                      {activeQuestions.length}{" "}
                      {activeQuestions.length === 1 ? "questão" : "questões"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {examMeta.title} · {examMeta.course}
                    {typeof navContext?.year === "number" ? ` · Edição ${navContext.year}` : ""}
                    {navContext?.searchQuery ? ` · Busca: "${navContext.searchQuery}"` : ""}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
                {/* Filtro rápido de ano dentro do Simulado */}
                <div
                  className="flex flex-wrap items-center gap-1"
                  role="group"
                  aria-label="Filtrar questões por ano do ENADE"
                >
                  <button
                    type="button"
                    onClick={() => handleFilterYearInSimulado(undefined)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-[11px] font-bold transition",
                      typeof navContext?.year !== "number"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900",
                    )}
                  >
                    Todos os anos
                  </button>
                  {availableYears.map((year) => {
                    const isSelected = navContext?.year === year;
                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleFilterYearInSimulado(year)}
                        className={cn(
                          "rounded-lg px-2.5 py-1 text-[11px] font-bold tabular-nums transition",
                          isSelected
                            ? "bg-brand-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900",
                        )}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>

                <div className="hidden items-center gap-3 border-l border-slate-200 pl-3 text-[11px] font-semibold text-slate-400 xl:flex">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    {examMeta.durationMinutes} min
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                    Salvo automaticamente
                  </span>
                </div>
              </div>
            </div>

            {activeQuestions.length > 0 && currentQuestion ? (
              <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-6">
                <div className="order-1 lg:sticky lg:top-[84px]">
                  <QuestionSidebar
                    questions={activeQuestions}
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
                    total={activeQuestions.length}
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
            ) : (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-card">
                <p className="text-base font-bold text-slate-900">
                  Nenhuma questão encontrada para o filtro selecionado
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Experimente remover o filtro de busca ou selecionar todas as edições do ENADE.
                </p>
                <div className="mt-4 flex justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleNavigateToSimulado({
                        areaSlug: "simulado-geral",
                        areaTitle: "Simulado Geral · Todas as Edições",
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Ver todas as {questions.length} questões
                  </button>
                </div>
              </div>
            )}
          </main>
        )}
      </div>

      {/* Popup de Métricas de Estudo */}
      <MetricsModal
        isOpen={isMetricsOpen}
        student={studentProfile}
        stats={stats}
        onClose={() => setIsMetricsOpen(false)}
        onStartSimulado={() => handleNavigateToSimulado()}
      />

      {/* Modal de Resultados do Simulado */}
      <ResultsModal
        isOpen={isResultsOpen}
        stats={stats}
        questions={activeQuestions}
        answers={answers}
        onClose={() => setIsResultsOpen(false)}
        onRestart={handleRestart}
        onReview={handleReview}
      />

      {/* Modal do Perfil (Configurações e Sair) */}
      <UserProfileModal
        isOpen={isUserModalOpen}
        initialTab={userModalTab}
        user={user}
        onClose={() => setIsUserModalOpen(false)}
        onUpdateUser={updateUser}
        onLogout={handleLogout}
      />

      {/* Painel Administrativo (aprovação de docentes e gestão de contas) */}
      <AdminManagementModal
        isOpen={adminPanelTab !== null}
        initialTab={adminPanelTab ?? "professors"}
        onClose={() => setAdminPanelTab(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
