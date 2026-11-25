import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Layers,
  Play,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import type {
  AnswerMap,
  AreaCategory,
  SimuladoNavigationContext,
  StudyArea,
} from "../types/question";
import type { AppUser } from "../types/user";
import {
  areaCategories,
  availableYears,
  globalStudySummary,
  studyAreas,
  yearQuestionsCount,
} from "../data/areas";
import { questions } from "../data/questions";
import { cn } from "../lib/utils";
import { AreaCard } from "./AreaCard";

interface DashboardProps {
  readonly user?: AppUser;
  readonly answers?: AnswerMap;
  readonly onStartSimulado: (context?: SimuladoNavigationContext) => void;
}

export function Dashboard({ user, answers = {}, onStartSimulado }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AreaCategory>("Todas as Áreas");

  const firstName = user?.name.trim().split(/\s+/)[0] ?? "Estudante";

  const sessionStats = useMemo(() => {
    let sessionAnswered = 0;
    let sessionCorrect = 0;

    for (const question of questions) {
      const answer = answers[question.id];
      if (answer?.confirmed) {
        sessionAnswered += 1;
        if (answer.selectedIndex === question.correctIndex) {
          sessionCorrect += 1;
        }
      }
    }

    const totalAnswered = globalStudySummary.baseAnswered + sessionAnswered;
    const totalCorrect = globalStudySummary.baseCorrect + sessionCorrect;
    const accuracyPercent =
      totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    const weeklyTarget =
      user?.role === "STUDENT"
        ? user.weeklyGoalTarget
        : globalStudySummary.weeklyGoalTarget;
    const weeklyCurrent = globalStudySummary.weeklyGoalCurrent + sessionAnswered;
    const weeklyProgressPercent = Math.min(
      100,
      weeklyTarget > 0 ? Math.round((weeklyCurrent / weeklyTarget) * 100) : 0,
    );

    return {
      sessionAnswered,
      sessionCorrect,
      totalAnswered,
      accuracyPercent,
      weeklyTarget,
      weeklyCurrent,
      weeklyProgressPercent,
    };
  }, [answers, user]);

  const enrichedAreas = useMemo<StudyArea[]>(() => {
    const answeredByAreaSlug: Record<string, number> = {};

    for (const question of questions) {
      if (answers[question.id]?.confirmed && question.areaSlug) {
        answeredByAreaSlug[question.areaSlug] =
          (answeredByAreaSlug[question.areaSlug] ?? 0) + 1;
      }
    }

    return studyAreas.map((area) => ({
      ...area,
      answeredQuestions: Math.min(
        area.totalQuestions,
        area.answeredQuestions + (answeredByAreaSlug[area.slug] ?? 0),
      ),
    }));
  }, [answers]);

  const filteredAreas = useMemo(() => {
    if (selectedCategory === "Todas as Áreas") {
      return enrichedAreas;
    }
    return enrichedAreas.filter((area) => area.category === selectedCategory);
  }, [enrichedAreas, selectedCategory]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    onStartSimulado({
      searchQuery: trimmed || undefined,
      areaTitle: trimmed ? `Busca: "${trimmed}"` : "Simulado Geral ENADE",
    });
  };

  const handleSelectYear = (year: number) => {
    onStartSimulado({
      areaSlug: `enade-${year}`,
      areaTitle: `Prova ENADE ${year} · Todas as Questões`,
      year,
    });
  };

  const handleSelectArea = (area: StudyArea) => {
    onStartSimulado({
      areaSlug: area.slug,
      areaTitle: area.title,
    });
  };

  return (
    <main className="mx-auto w-full max-w-[1200px] space-y-8 px-4 pb-16 pt-6 sm:px-6">
      {/* 1. Hero Moderno com Busca Integrada + Card de Progresso */}
      <section
        aria-labelledby="heading-presentation"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-brand-900 p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8 lg:p-9"
      >
        {/* Brilhos decorativos sutis */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-indigo-400/15 blur-3xl"
        />

        <div className="relative grid gap-7 lg:grid-cols-[1.35fr_0.85fr] lg:items-center">
          {/* Esquerda: Saudação + Busca + CTA */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-200 ring-1 ring-inset ring-white/15">
                <Sparkles className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
                Olá, {firstName}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-300 ring-1 ring-inset ring-white/10">
                <BookOpenCheck className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
                {questions.length} questões · {studyAreas.length} disciplinas
              </span>
            </div>

            <h1
              id="heading-presentation"
              className="mt-4 text-balance text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-[34px] lg:leading-tight"
            >
              Pronto para evoluir na preparação para o{" "}
              <span className="text-brand-300">ENADE</span>?
            </h1>

            <p className="mt-2.5 max-w-xl text-xs leading-relaxed text-slate-300 sm:text-sm">
              Pesquise um assunto específico, resolva provas oficiais por edição ou pratique por
              disciplina com gabarito comentado.
            </p>

            {/* Barra de busca + Ação principal */}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Buscar por assunto, disciplina ou palavra-chave..."
                    aria-label="Pesquisar questões"
                    className="h-11 w-full rounded-xl border border-white/15 bg-white pl-10 pr-9 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40 sm:text-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Limpar busca"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white/15 px-4 text-xs font-bold text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 sm:text-sm"
                >
                  Buscar
                </button>
              </form>

              <button
                type="button"
                onClick={() =>
                  onStartSimulado({
                    areaSlug: "simulado-geral",
                    areaTitle: "Simulado Geral · Todas as Edições",
                  })
                }
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 text-xs font-bold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 sm:text-sm"
              >
                <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                Simulado Geral
              </button>
            </div>
          </div>

          {/* Direita: Card de progresso e meta semanal */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-md">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white">
                <Target className="h-4 w-4 text-brand-300" aria-hidden="true" />
                Resumo dos estudos
              </span>
              <span className="rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 ring-1 ring-inset ring-emerald-400/20">
                {sessionStats.accuracyPercent}% acertos
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.06] p-3 ring-1 ring-inset ring-white/10">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                  Resolvidas
                </div>
                <p className="mt-1 text-xl font-extrabold tabular-nums text-white">
                  {sessionStats.totalAnswered}
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.06] p-3 ring-1 ring-inset ring-white/10">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
                  <TrendingUp className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
                  Nesta sessão
                </div>
                <p className="mt-1 text-xl font-extrabold tabular-nums text-white">
                  {sessionStats.sessionAnswered}
                  <span className="ml-1 text-xs font-semibold text-slate-400">
                    ({sessionStats.sessionCorrect} ok)
                  </span>
                </p>
              </div>
            </div>

            {/* Meta semanal */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-slate-300">Meta semanal</span>
                <span className="tabular-nums text-brand-200">
                  {sessionStats.weeklyCurrent} / {sessionStats.weeklyTarget} questões
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${sessionStats.weeklyProgressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Provas Oficiais por Ano */}
      <section aria-labelledby="heading-years">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                <Calendar className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2
                id="heading-years"
                className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg"
              >
                Provas Oficiais por Edição
              </h2>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Escolha um caderno de prova completo do ENADE ou pratique com todas as edições.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
            {availableYears.length} edições disponíveis
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {availableYears.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => handleSelectYear(year)}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-colors group-hover:bg-brand-50 group-hover:text-brand-700">
                  ENADE
                </span>
                <ArrowRight
                  className="h-4 w-4 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-brand-600"
                  aria-hidden="true"
                />
              </div>

              <div className="mt-3">
                <span className="block text-xl font-extrabold tabular-nums tracking-tight text-slate-900 group-hover:text-brand-600">
                  {year}
                </span>
                <span className="mt-0.5 block text-[11px] font-semibold text-slate-400">
                  {yearQuestionsCount[year] ?? 0} questões
                </span>
              </div>
            </button>
          ))}

          {/* Card destaque: Simulado Geral */}
          <button
            type="button"
            onClick={() =>
              onStartSimulado({
                areaSlug: "simulado-geral",
                areaTitle: "Simulado Geral · Todas as Edições",
              })
            }
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 p-4 text-left text-white shadow-md shadow-brand-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-brand-500 hover:to-indigo-600 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-50">
                Completo
              </span>
              <ClipboardCheck
                className="h-4 w-4 text-brand-100 transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              />
            </div>

            <div className="mt-3">
              <span className="block text-base font-extrabold tracking-tight text-white">
                Simulado Geral
              </span>
              <span className="mt-0.5 block text-[11px] font-medium text-brand-100">
                {questions.length} questões · Todas
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* 3. Catálogo de Disciplinas com Filtro por Categoria */}
      <section aria-labelledby="heading-areas">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100">
                <Layers className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2
                id="heading-areas"
                className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg"
              >
                Estudar por Disciplina
              </h2>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Foque nas matérias com maior peso ou revise conteúdos específicos do curso.
            </p>
          </div>

          {/* Filtros de categoria */}
          <div
            role="tablist"
            aria-label="Filtrar disciplinas por categoria"
            className="flex flex-wrap gap-1.5"
          >
            {areaCategories.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                    isSelected
                      ? "bg-slate-900 text-white shadow-sm"
                      : "border border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAreas.map((area) => (
            <AreaCard key={area.id} area={area} onSelectArea={handleSelectArea} />
          ))}
        </div>
      </section>
    </main>
  );
}
