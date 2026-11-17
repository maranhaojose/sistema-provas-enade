import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Code2,
  Cpu,
  Database,
  GitFork,
  Layers,
  Network,
  Terminal,
} from "lucide-react";
import type { StudyArea } from "../types/question";
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

const categoryIconAccent: Record<StudyArea["category"], string> = {
  Fundamentos:
    "bg-brand-50 text-brand-600 ring-brand-100 group-hover:bg-brand-600 group-hover:text-white",
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
      className="group flex h-full w-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:p-5"
    >
      <div>
        {/* Cabeçalho do Card: Ícone + Categoria */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-colors duration-200",
              categoryIconAccent[area.category],
            )}
            aria-hidden="true"
          >
            <IconComponent className="h-5 w-5" />
          </span>

          <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 ring-1 ring-inset ring-slate-200/70">
            {area.category}
          </span>
        </div>

        {/* Título e descrição */}
        <div className="mt-3.5">
          <h3 className="text-[15px] font-bold tracking-tight text-slate-900 transition-colors group-hover:text-brand-600">
            {area.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {area.description}
          </p>
        </div>

        {/* Tags de subtemas principais */}
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Subtemas principais">
          {area.subtopics.slice(0, 3).map((subtopic) => (
            <span
              key={subtopic}
              className="rounded-md bg-slate-50 px-2 py-0.5 text-[10.5px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200/60"
            >
              {subtopic}
            </span>
          ))}
        </div>
      </div>

      {/* Rodapé enxuto com barra de progresso e contagem */}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
            <BookOpen className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span className="tabular-nums">{area.totalQuestions}</span> questões
          </span>

          <span className="inline-flex items-center gap-1 font-bold text-brand-600 transition-transform duration-200 group-hover:translate-x-0.5">
            Praticar
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </button>
  );
}
