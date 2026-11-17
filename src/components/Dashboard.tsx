import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Calendar,
  Layers,
  Play,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import type {
  AreaCategory,
  SimuladoNavigationContext,
  StudyArea,
} from "../types/question";
import { areaCategories, availableYears, studyAreas } from "../data/areas";
import { cn } from "../lib/utils";
import { AreaCard } from "./AreaCard";

interface DashboardProps {
  readonly onStartSimulado: (context?: SimuladoNavigationContext) => void;
}

const yearQuestionsCount: Readonly<Record<number, number>> = {
  2023: 35,
  2022: 35,
  2021: 35,
  2019: 35,
  2017: 35,
};

export function Dashboard({ onStartSimulado }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AreaCategory>("Todas as Áreas");

  // Filtra os cards de áreas conforme busca e categoria selecionada
  const filteredAreas = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return studyAreas.filter((area) => {
      if (selectedCategory !== "Todas as Áreas" && area.category !== selectedCategory) {
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
  }, [searchQuery, selectedCategory]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onStartSimulado({
      searchQuery: searchQuery.trim() || undefined,
      category: selectedCategory !== "Todas as Áreas" ? selectedCategory : undefined,
      areaTitle: searchQuery.trim()
        ? `Busca: "${searchQuery.trim()}"`
        : selectedCategory !== "Todas as Áreas"
          ? selectedCategory
          : "Simulado Geral ENADE",
    });
  };

  const handleSelectArea = (area: StudyArea) => {
    onStartSimulado({
      areaSlug: area.slug,
      areaTitle: area.title,
      category: area.category,
    });
  };

  const handleSelectYear = (year: number) => {
    onStartSimulado({
      areaSlug: `enade-${year}`,
      areaTitle: `Prova ENADE ${year} · Todas as Questões`,
      year,
    });
  };

  return (
    <main className="mx-auto w-full max-w-[1360px] px-4 pb-14 pt-5 sm:px-6">
      {/* 1. Seção de Busca e Filtro Rápido (Limpa e Compacta) */}
      <section
        aria-label="Busca e filtro por área"
        className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5"
      >
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
              placeholder="Buscar questões por tema, palavra-chave ou disciplina (ex: Banco de Dados, 3FN, Grafos)..."
              aria-label="Pesquisar questões"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-9 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:text-sm"
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
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-xs font-bold text-white shadow-sm shadow-brand-600/25 transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:text-sm"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Buscar Questões
          </button>
        </form>

        {/* Chips de Macroárea */}
        <div
          className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3.5"
          role="group"
          aria-label="Filtrar disciplinas por categoria"
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
                  "rounded-xl px-3 py-1.5 text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
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
      </section>

      {/* 2. Botões Claros por Ano do ENADE (Todas as questões daquele ano independente do tema) */}
      <section aria-labelledby="heading-years" className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-600" aria-hidden="true" />
            <h2
              id="heading-years"
              className="text-sm font-bold tracking-tight text-slate-900 sm:text-base"
            >
              Provas do ENADE por Ano
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-400">
            Todas as questões da edição (independente do tema)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {availableYears.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => handleSelectYear(year)}
              className="group flex items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50/30 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-600">
                  Prova Oficial
                </span>
                <span className="mt-0.5 block text-base font-extrabold tabular-nums text-slate-900 group-hover:text-brand-700">
                  ENADE {year}
                </span>
                <span className="mt-0.5 block text-[11px] font-medium text-slate-400">
                  {yearQuestionsCount[year] ?? 35} questões
                </span>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </button>
          ))}

          {/* Botão de Simulado Geral (Todas as edições) */}
          <button
            type="button"
            onClick={() =>
              onStartSimulado({
                areaSlug: "simulado-geral",
                areaTitle: "Simulado Geral · Todas as Edições",
              })
            }
            className="group flex items-center justify-between gap-2 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-600 to-brand-700 px-4 py-3.5 text-left text-white shadow-sm shadow-brand-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-brand-500 hover:to-brand-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-100">
                Completo
              </span>
              <span className="mt-0.5 block text-sm font-extrabold tracking-tight text-white">
                Iniciar Simulado
              </span>
              <span className="mt-0.5 block text-[11px] font-medium text-brand-100/90">
                Todas as edições
              </span>
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white transition-transform group-hover:translate-x-0.5">
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
            </span>
          </button>
        </div>
      </section>

      {/* 3. Grade de Seleção de Áreas / Disciplinas */}
      <section aria-labelledby="heading-areas" className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand-600" aria-hidden="true" />
            <h2
              id="heading-areas"
              className="text-sm font-bold tracking-tight text-slate-900 sm:text-base"
            >
              Disciplinas de Computação
            </h2>
            <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] font-bold tabular-nums text-slate-700">
              {filteredAreas.length}
            </span>
          </div>

          {(searchQuery.trim() !== "" || selectedCategory !== "Todas as Áreas") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Todas as Áreas");
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              Limpar filtro
            </button>
          )}
        </div>

        {filteredAreas.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAreas.map((area) => (
              <AreaCard key={area.id} area={area} onSelectArea={handleSelectArea} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-7 text-center shadow-card">
            <p className="text-sm font-bold text-slate-900">
              Nenhuma disciplina encontrada para &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Você pode buscar esse termo diretamente nas questões da prova.
            </p>
            <div className="mt-4 flex justify-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  onStartSimulado({
                    searchQuery: searchQuery.trim() || undefined,
                    areaTitle: `Busca: "${searchQuery.trim()}"`,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700"
              >
                <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                Buscar nas questões
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Todas as Áreas");
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Limpar
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
