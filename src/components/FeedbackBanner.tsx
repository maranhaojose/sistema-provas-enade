import { CheckCircle2, Lightbulb, XCircle } from "lucide-react";
import { cn } from "../lib/utils";

interface FeedbackBannerProps {
  readonly isCorrect: boolean;
  readonly selectedLetter: string;
  readonly correctLetter: string;
  readonly explanation: string;
}

export function FeedbackBanner({
  isCorrect,
  selectedLetter,
  correctLetter,
  explanation,
}: FeedbackBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "animate-fade-up overflow-hidden rounded-2xl border",
        isCorrect
          ? "border-emerald-200 bg-emerald-50/70"
          : "border-rose-200 bg-rose-50/60",
      )}
    >
      <div className="flex gap-3 p-4 sm:gap-3.5 sm:p-5">
        <span
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm",
            isCorrect ? "bg-emerald-500" : "bg-rose-500",
          )}
          aria-hidden="true"
        >
          {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
        </span>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-bold sm:text-[15px]",
              isCorrect ? "text-emerald-900" : "text-rose-900",
            )}
          >
            {isCorrect ? "Parabéns! Resposta correta." : "Resposta incorreta."}
          </p>
          <p
            className={cn(
              "mt-1 text-xs leading-relaxed sm:text-[13px]",
              isCorrect ? "text-emerald-700" : "text-rose-700",
            )}
          >
            {isCorrect ? (
              <>
                Você marcou a alternativa{" "}
                <strong className="font-bold">{selectedLetter}</strong> e acertou a questão.
              </>
            ) : (
              <>
                Você marcou a alternativa{" "}
                <strong className="font-bold">{selectedLetter}</strong>. A alternativa correta é a{" "}
                <strong className="font-bold">{correctLetter}</strong>. Veja o gabarito comentado
                abaixo.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="border-t border-white/60 bg-white/70 px-4 pb-4 pt-3.5 backdrop-blur-sm sm:px-5 sm:pb-5">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
          Resolução comentada
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-600 sm:text-sm">{explanation}</p>
      </div>
    </div>
  );
}
