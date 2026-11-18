import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Layers,
  Play,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import type { AnswerMap, SimuladoNavigationContext } from "../types/question";
import { availableYears, studyAreas, yearQuestionsCount } from "../data/areas";
import { questions } from "../data/questions";

interface DashboardProps {
  readonly answers?: AnswerMap;
  readonly onStartSimulado: (context?: SimuladoNavigationContext) => void;
}

export function Dashboard({ onStartSimulado }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onStartSimulado({
      searchQuery: searchQuery.trim() || undefined,
      areaTitle: searchQuery.trim()
        ? `Busca: "${searchQuery.trim()}"`
        : "Simulado Geral ENADE",
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
    <main className="mx-auto w-full max-w-[1160px] px-4 pb-16 pt-6 sm:px-6">
      {/* 1. Apresentação do Sistema (Clean Hero) */}
      <section
        aria-labelledby="heading-presentation"
        className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card"
      >
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700 ring-1 ring-inset ring-brand-100">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
              Plataforma de Preparação · ENADE Computação
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
              <GraduationCap className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              {questions.length} questões oficiais · {studyAreas.length} disciplinas
            </span>
          </div>

          <h1
            id="heading-presentation"
            className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl"
          >
            O que é o Simula<span className="text-brand-600">ENADE</span>?
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            O <strong>SimulaENADE</strong> é um sistema interativo de treinamento desenvolvido para
            auxiliar estudantes de Computação na preparação para o{" "}
            <strong>Exame Nacional de Desempenho dos Estudantes (ENADE)</strong>. Aqui você resolve
            questões reais de provas anteriores, recebe feedback imediato com gabarito comentado e
            acompanha sua evolução por tema ou edição da prova.
          </p>

          {/* Como funciona / Pilares do Sistema */}
          <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
              </div>
              <h2 className="mt-3 text-xs font-bold text-slate-900 sm:text-sm">
                Questões Comentadas
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Cada questão conta com explicação detalhada da alternativa correta para fixar os
                conceitos cobrados na prova.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100">
                <Layers className="h-4 w-4" aria-hidden="true" />
              </div>
              <h2 className="mt-3 text-xs font-bold text-slate-900 sm:text-sm">
                Estudo por Disciplina ou Ano
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Escolha uma disciplina específica diretamente na <strong>barra lateral</strong> ou
                resolva um caderno de prova por ano abaixo.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100">
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
              </div>
              <h2 className="mt-3 text-xs font-bold text-slate-900 sm:text-sm">
                Métricas de Desempenho
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Monitore seu percentual de acertos, metas semanais e identifique os conteúdos que
                precisam de revisão.
              </p>
            </div>
          </div>

          {/* Busca Rápida + Ação Principal */}
          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 lg:flex-row lg:items-center">
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
                  placeholder="Pesquisar questões por palavra-chave ou assunto..."
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
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:text-sm"
              >
                <Search className="h-4 w-4 text-slate-500" aria-hidden="true" />
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
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-xs font-bold text-white shadow-sm shadow-brand-600/25 transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:text-sm"
            >
              <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              Iniciar Simulado Geral
            </button>
          </div>
        </div>
      </section>

      {/* 2. Provas do ENADE por Ano (abaixo da apresentação) */}
      <section aria-labelledby="heading-years" className="mt-8">
        <div className="mb-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-600" aria-hidden="true" />
            <h2
              id="heading-years"
              className="text-sm font-bold tracking-tight text-slate-900 sm:text-base"
            >
              Provas do ENADE por Ano
            </h2>
          </div>
          <span className="hidden text-xs font-medium text-slate-400 sm:inline">
            Selecione uma edição para resolver todas as questões
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {availableYears.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => handleSelectYear(year)}
              className="group flex items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <div>
                <span className="block text-[15px] font-extrabold tabular-nums text-slate-900 group-hover:text-brand-600">
                  ENADE {year}
                </span>
                <span className="mt-0.5 block text-[11px] font-medium text-slate-400">
                  {yearQuestionsCount[year] ?? 0} questões
                </span>
              </div>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
                aria-hidden="true"
              />
            </button>
          ))}

          {/* Botão Simulado Geral */}
          <button
            type="button"
            onClick={() =>
              onStartSimulado({
                areaSlug: "simulado-geral",
                areaTitle: "Simulado Geral · Todas as Edições",
              })
            }
            className="group flex items-center justify-between gap-2 rounded-2xl bg-brand-600 px-4 py-3.5 text-left text-white shadow-sm shadow-brand-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <div>
              <span className="block text-sm font-extrabold tracking-tight text-white">
                Simulado Geral
              </span>
              <span className="mt-0.5 block text-[11px] font-medium text-brand-100">
                {questions.length} questões · Todas
              </span>
            </div>
            <ClipboardCheck className="h-4 w-4 shrink-0 text-brand-100" aria-hidden="true" />
          </button>
        </div>
      </section>
    </main>
  );
}
