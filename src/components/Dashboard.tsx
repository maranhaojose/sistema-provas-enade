import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Award,
  BookOpenCheck,
  Calendar,
  CheckCircle2,
  Filter,
  Flame,
  Layers,
  Play,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import type {
  AreaCategory,
  Difficulty,
  ExamMeta,
  SimuladoNavigationContext,
  StudentProfile,
  StudyArea,
} from "../types/question";
import type { SimuladoStats } from "../hooks/useSimulado";
import {
  areaCategories,
  availableYears,
  difficultyOptions,
  globalStudySummary,
  studyAreas,
} from "../data/areas";
import { cn } from "../lib/utils";
import { AreaCard } from "./AreaCard";

interface DashboardProps {
  readonly exam: ExamMeta;
  readonly student: StudentProfile;
  readonly stats: SimuladoStats;
  readonly onStartSimulado: (context?: SimuladoNavigationContext) => void;
}

const quickSearchTags: readonly string[] = [
  "Busca Binária",
  "Normalização 3FN",
  "TCP Slow Start",
  "Padrão Strategy",
  "Memória Cache AMAT",
];

export function Dashboard({ exam, student, stats, onStartSimulado }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AreaCategory>("Todas as Áreas");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "Todas">("Todas");
  const [selectedYear, setSelectedYear] = useState<number | "Todos">("Todos");

  const firstName = student.name.split(" ")[0] ?? student.name;

  // Métricas combinadas (histórico + sessão atual)
  const totalAnsweredOverall = globalStudySummary.baseAnswered + stats.answered;
  const totalCorrectOverall = globalStudySummary.baseCorrect + stats.correct;
  const overallAccuracy =
    totalAnsweredOverall > 0 ? Math.round((totalCorrectOverall / totalAnsweredOverall) * 100) : 0;
  const weeklyCurrent = globalStudySummary.weeklyGoalCurrent + stats.answered;
  const weeklyPercent = Math.min(
    100,
    Math.round((weeklyCurrent / globalStudySummary.weeklyGoalTarget) * 100),
  );

  // Filtra os cards de áreas conforme busca e filtros rápidos selecionados
  const filteredAreas = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return studyAreas.filter((area) => {
      if (selectedCategory !== "Todas as Áreas" && area.category !== selectedCategory) {
        return false;
      }

      if (selectedDifficulty !== "Todas" && area.defaultDifficulty !== selectedDifficulty) {
        return false;
      }

      if (selectedYear !== "Todos" && !area.years.includes(selectedYear)) {
        return false;
      }

      if (!normalizedQuery) return true;

      const matchesTitle = area.title.toLowerCase().includes(normalizedQuery);
      const matchesDescription = area.description.toLowerCase().includes(normalizedQuery);
      const matchesCategory = area.category.toLowerCase().includes(normalizedQuery);
      const matchesSubtopics = area.subtopics.some((topic) =>
        topic.toLowerCase().includes(normalizedQuery),
      );

      return matchesTitle || matchesDescription || matchesCategory || matchesSubtopics;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedYear]);

  const totalFilteredQuestions = useMemo(
    () => filteredAreas.reduce((sum, area) => sum + area.totalQuestions, 0),
    [filteredAreas],
  );

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCategory !== "Todas as Áreas" ||
    selectedDifficulty !== "Todas" ||
    selectedYear !== "Todos";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Todas as Áreas");
    setSelectedDifficulty("Todas");
    setSelectedYear("Todos");
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onStartSimulado({
      searchQuery: searchQuery.trim() || undefined,
      category: selectedCategory !== "Todas as Áreas" ? selectedCategory : undefined,
      difficulty: selectedDifficulty !== "Todas" ? selectedDifficulty : undefined,
      year: selectedYear !== "Todos" ? selectedYear : undefined,
      areaTitle: searchQuery.trim()
        ? `Busca: "${searchQuery.trim()}"`
        : selectedCategory !== "Todas as Áreas"
          ? selectedCategory
          : undefined,
    });
  };

  const handleSelectArea = (area: StudyArea) => {
    onStartSimulado({
      areaSlug: area.slug,
      areaTitle: area.title,
      category: area.category,
      difficulty: selectedDifficulty !== "Todas" ? selectedDifficulty : undefined,
      year: selectedYear !== "Todos" ? selectedYear : undefined,
    });
  };

  const handleQuickTagClick = (tag: string) => {
    setSearchQuery(tag);
    onStartSimulado({
      searchQuery: tag,
      areaTitle: `Tema: ${tag}`,
    });
  };

  return (
    <main className="mx-auto max-w-[1360px] px-4 pb-16 pt-5 sm:px-6 sm:pt-6">
      {/* Banner Principal / Resumo Pós-Login */}
      <section
        aria-label="Resumo de preparação e acesso rápido"
        className="relative overflow-hidden rounded-2xl border border-slate-800/10 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-900 p-5 text-white shadow-card sm:p-7"
      >
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-200 ring-1 ring-inset ring-white/15">
                <Sparkles className="h-3 w-3 text-brand-300" aria-hidden="true" />
                Painel de Estudos · {exam.course}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-inset ring-emerald-400/25">
                <Flame className="h-3 w-3" aria-hidden="true" />
                Ciclo ENADE {exam.year}
              </span>
            </div>

            <h1 className="mt-3.5 text-xl font-extrabold tracking-tight text-white sm:text-2xl lg:text-[26px]">
              Olá, {firstName}! Continue sua preparação para o ENADE.
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
              Explore questões comentadas organizadas por disciplina, filtre por nível de
              dificuldade ou inicie um simulado completo no formato oficial da prova.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  onStartSimulado({
                    areaSlug: "simulado-geral",
                    areaTitle: `${exam.title} ${exam.year}`,
                  })
                }
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/30 transition-all hover:bg-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 sm:text-sm"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                {stats.answered > 0 && !stats.isFinished
                  ? `Continuar Simulado (${stats.answered}/${stats.total})`
                  : "Iniciar Simulado Oficial"}
              </button>

              <button
                type="button"
                onClick={() =>
                  onStartSimulado({
                    areaSlug: "caderno-inteligente",
                    areaTitle: "Caderno de Alta Incidência",
                  })
                }
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-sm"
              >
                <BookOpenCheck className="h-4 w-4 text-brand-300" aria-hidden="true" />
                Caderno Recomendado
              </button>
            </div>
          </div>

          {/* Indicadores rápidos no Hero */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[480px] lg:shrink-0 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-[10px] font-bold uppercase tracking-wider">Respondidas</span>
                <CheckCircle2 className="h-4 w-4 text-brand-300" aria-hidden="true" />
              </div>
              <p className="mt-1.5 text-2xl font-extrabold tabular-nums text-white">
                {totalAnsweredOverall}
                <span className="ml-1 text-xs font-semibold text-slate-400">
                  /{globalStudySummary.totalBankQuestions}
                </span>
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-400">Questões concluídas</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-[10px] font-bold uppercase tracking-wider">Aproveitamento</span>
                <Target className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              </div>
              <p className="mt-1.5 text-2xl font-extrabold tabular-nums text-emerald-400">
                {overallAccuracy}%
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                {totalCorrectOverall} acertos no total
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-[10px] font-bold uppercase tracking-wider">Simulados</span>
                <Award className="h-4 w-4 text-amber-300" aria-hidden="true" />
              </div>
              <p className="mt-1.5 text-2xl font-extrabold tabular-nums text-white">
                {globalStudySummary.completedExams + (stats.isFinished ? 1 : 0)}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-400">Provas finalizadas</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-[10px] font-bold uppercase tracking-wider">Meta Semanal</span>
                <TrendingUp className="h-4 w-4 text-brand-300" aria-hidden="true" />
              </div>
              <p className="mt-1.5 text-2xl font-extrabold tabular-nums text-white">
                {weeklyPercent}%
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                {weeklyCurrent} de {globalStudySummary.weeklyGoalTarget} questões
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Busca e Filtros (Estilo QConcursos) */}
      <section
        aria-label="Busca e filtros de questões"
        className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                Explorador de Questões e Disciplinas
              </h2>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Pressione <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">Enter</kbd> para buscar e iniciar a resolução
          </span>
        </div>

        {/* Barra de busca proeminente */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2.5 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Pesquisar questões por palavra-chave, tema ou subtema (ex: Banco de Dados, 3FN, Grafos, Cache)..."
              aria-label="Pesquisar questões por palavras-chave, temas ou subtemas"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-9 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Limpar termo de busca"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-xs font-bold text-white shadow-sm shadow-brand-600/25 transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:text-sm"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Buscar Questões
          </button>
        </form>

        {/* Sugestões de busca rápida */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Temas em alta:
          </span>
          {quickSearchTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleQuickTagClick(tag)}
              className="rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-brand-300 hover:bg-brand-50/60 hover:text-brand-700"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Linha divisória + Filtros rápidos (Chips de Macroárea + Seletores de Dificuldade e Ano) */}
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Chips de Macroárea */}
          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Filtrar por grande área de conhecimento"
          >
            {areaCategories.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={isSelected}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                    isSelected
                      ? "bg-slate-900 text-white shadow-sm"
                      : "border border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Dropdowns / Seletores de Dificuldade e Ano */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro de Dificuldade */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 px-2.5 py-1">
              <Filter className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <label htmlFor="filter-difficulty" className="text-[11px] font-semibold text-slate-500">
                Dificuldade:
              </label>
              <select
                id="filter-difficulty"
                value={selectedDifficulty}
                onChange={(event) =>
                  setSelectedDifficulty(event.target.value as Difficulty | "Todas")
                }
                className="bg-transparent py-0.5 pr-1 text-xs font-bold text-slate-800 focus:outline-none"
              >
                {difficultyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "Todas" ? "Todas" : option}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Ano ENADE */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 px-2.5 py-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <label htmlFor="filter-year" className="text-[11px] font-semibold text-slate-500">
                Edição:
              </label>
              <select
                id="filter-year"
                value={selectedYear}
                onChange={(event) => {
                  const value = event.target.value;
                  setSelectedYear(value === "Todos" ? "Todos" : Number(value));
                }}
                className="bg-transparent py-0.5 pr-1 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="Todos">Todos os anos</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    ENADE {year}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                Limpar
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Cabeçalho da Grade de Seleção de Áreas / Disciplinas */}
      <section aria-labelledby="heading-areas" className="mt-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-600" aria-hidden="true" />
              <h2
                id="heading-areas"
                className="text-base font-bold tracking-tight text-slate-900 sm:text-lg"
              >
                Áreas de Conhecimento e Disciplinas
              </h2>
              <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] font-bold tabular-nums text-slate-700">
                {filteredAreas.length}
              </span>
            </div>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Selecione uma disciplina abaixo para resolver o caderno de questões comentadas (
              <span className="tabular-nums font-semibold text-slate-700">
                {totalFilteredQuestions} questões
              </span>{" "}
              disponíveis nesta seleção).
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              onStartSimulado({
                category: selectedCategory !== "Todas as Áreas" ? selectedCategory : undefined,
                difficulty: selectedDifficulty !== "Todas" ? selectedDifficulty : undefined,
                year: selectedYear !== "Todos" ? selectedYear : undefined,
                areaTitle:
                  selectedCategory !== "Todas as Áreas"
                    ? `Caderno · ${selectedCategory}`
                    : `${exam.title} ${exam.year}`,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50/70 px-3.5 py-2 text-xs font-bold text-brand-700 transition hover:border-brand-300 hover:bg-brand-100/70"
          >
            <span>Praticar seleção atual</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Grade responsiva de Cards */}
        {filteredAreas.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5">
            {filteredAreas.map((area) => (
              <AreaCard key={area.id} area={area} onSelectArea={handleSelectArea} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-card">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Search className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900">
              Nenhuma disciplina filtrada diretamente para &ldquo;{searchQuery}&rdquo;
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500 sm:text-sm">
              Você pode pesquisar esse termo diretamente no enunciado das questões do simulado ou
              redefinir os filtros selecionados.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  onStartSimulado({
                    searchQuery: searchQuery.trim() || undefined,
                    areaTitle: searchQuery.trim() ? `Busca: "${searchQuery.trim()}"` : undefined,
                  })
                }
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-brand-600/25 transition hover:bg-brand-700 sm:text-sm"
              >
                <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                Resolver questões sobre &ldquo;{searchQuery.trim()}&rdquo;
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:text-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Limpar filtros
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
