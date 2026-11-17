import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Code2,
  Cpu,
  Database,
  Flame,
  GitFork,
  Layers,
  Network,
  Sparkles,
  Terminal,
  TrendingUp,
} from "lucide-react";
import type { StudyArea, StudyStatus } from "../types/question";
import { cn } from "../lib/utils";

interface AreaCardProps {
  readonly area: StudyArea;
  readonly onSelectArea: (area: StudyArea) => void;
}

const iconMap = {
  Code2,
  Database,
  GitFork,
  Network,
  Terminal,
  Cpu,
  BrainCircuit,
  Layers,
} as const;

const statusBadgeStyles: Record<StudyStatus, string> = {
  "Alta incidência": "bg-amber-50 text-amber-700 ring-amber-200/70",
  "Em andamento": "bg-brand-50 text-brand-700 ring-brand-200/70",
  Recomendado: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  "Não iniciado": "bg-slate-100 text-slate-600 ring-slate-200",
};

const categoryIconAccent: Record<StudyArea["category"], string> = {
  Fundamentos: "bg-brand-50 text-brand-600 ring-brand-100 group-hover:bg-brand-600 group-hover:text-white",
  Desenvolvimento:
    "bg-indigo-50 text-indigo-600 ring-indigo-100 group-hover:bg-brand-600 group-hover:text-white",
  Infraestrutura:
    "bg-slate-100 text-slate-700 ring-slate-200/80 group-hover:bg-brand-600 group-hover:text-white",
  "Matemática e Teoria":
    "bg-emerald-50 text-emerald-600 ring-emerald-100 group-hover:bg-brand-600 group-hover:text-white",
};

export function AreaCard({ area, onSelectArea }: AreaCardProps) {
  const IconComponent = iconMap[area.iconName];
  const progressPercent =
    area.totalQuestions > 0
      ? Math.round((area.answeredQuestions / area.totalQuestions) * 100)
      : 0;

  return (
    <button
      type="button"
      onClick={() => onSelectArea(area)}
      aria-label={`Praticar questões de ${area.title} (${area.totalQuestions} questões disponíveis)`}
      className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:p-5"
    >
      {/* Barra superior decorativa no hover */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-brand-600 to-emerald-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        aria-hidden="true"
      />

      <div>
        {/* Cabeçalho do Card: Ícone + Badges */}
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-colors duration-200",
              categoryIconAccent[area.category],
            )}
            aria-hidden="true"
          >
            <IconComponent className="h-5 w-5" />
          </span>

          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <span className="rounded-lg bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 ring-1 ring-inset ring-slate-200/70">
              {area.category}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-inset",
                statusBadgeStyles[area.status],
              )}
            >
              {area.status === "Alta incidência" ? (
                <Flame className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Sparkles className="h-3 w-3" aria-hidden="true" />
              )}
              {area.status}
            </span>
          </div>
        </div>

        {/* Título e descrição */}
        <div className="mt-4">
          <h3 className="text-[15.5px] font-bold tracking-tight text-slate-900 transition-colors group-hover:text-brand-600">
            {area.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-slate-500">
            {area.description}
          </p>
        </div>

        {/* Tags de subtemas principais */}
        <div className="mt-3.5 flex flex-wrap gap-1.5" aria-label="Subtemas principais">
          {area.subtopics.map((subtopic) => (
            <span
              key={subtopic}
              className="rounded-lg bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200/70 transition-colors group-hover:bg-brand-50/50 group-hover:text-slate-700"
            >
              {subtopic}
            </span>
          ))}
        </div>
      </div>

      {/* Rodapé com metadados e barra de progresso */}
      <div className="mt-5 border-t border-slate-100 pt-3.5">
        <div className="flex items-center justify-between text-[11.5px]">
          <span className="font-semibold text-slate-600">
            Progresso:{" "}
            <strong className="tabular-nums font-bold text-slate-800">
              {area.answeredQuestions}/{area.totalQuestions}
            </strong>
          </span>
          <span className="inline-flex items-center gap-1 font-bold tabular-nums text-emerald-600">
            <TrendingUp className="h-3 w-3" aria-hidden="true" />
            {area.accuracyPercent}% acerto
          </span>
        </div>

        <div
          className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={area.totalQuestions}
          aria-valuenow={area.answeredQuestions}
          aria-label={`Progresso em ${area.title}`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
            <BookOpen className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span className="tabular-nums">{area.totalQuestions}</span> questões disponíveis
          </span>

          <span className="inline-flex items-center gap-1 font-bold text-brand-600 transition-transform duration-200 group-hover:translate-x-0.5">
            Resolver
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </button>
  );
}
