import { useEffect, useState } from "react";
import { Clock3, ShieldCheck } from "lucide-react";
import { Header } from "./components/Header";
import { QuestionSidebar } from "./components/QuestionSidebar";
import { QuestionCard } from "./components/QuestionCard";
import { ResultsModal } from "./components/ResultsModal";
import { useSimulado } from "./hooks/useSimulado";
import { examMeta, questions, student } from "./data/questions";

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

  const [isResultsOpen, setIsResultsOpen] = useState(false);

  // Volta ao topo ao trocar de questão (exceto no primeiro render).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex]);

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
        onOpenResults={() => setIsResultsOpen(true)}
      />

      <main className="mx-auto max-w-[1360px] px-4 pb-16 pt-5 sm:px-6 sm:pt-6">
        {/* Linha de contexto */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              Resolução de prova
            </h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {examMeta.title} {examMeta.year} · {examMeta.course}
            </p>
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
              Questões comentadas elaboradas a partir de provas oficiais do ENADE. Use as setas ou a
              navegação lateral para revisar antes de finalizar.
            </p>
          </div>
        </div>
      </main>

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
