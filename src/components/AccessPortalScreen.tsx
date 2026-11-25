import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  GraduationCap,
  Layers,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { AuthRole } from "../types/auth";
import { availableYears, studyAreas } from "../data/areas";
import { questions } from "../data/questions";

interface AccessPortalScreenProps {
  readonly logoutNotice?: boolean;
  readonly onSelectRole: (role: AuthRole) => void;
}

export function AccessPortalScreen({
  logoutNotice = false,
  onSelectRole,
}: AccessPortalScreenProps) {
  const latestYear = availableYears[0];
  const oldestYear = availableYears[availableYears.length - 1];
  const yearsRange =
    oldestYear && latestYear && oldestYear !== latestYear
      ? `${oldestYear}–${latestYear}`
      : String(latestYear ?? "");

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50">
      {/* Textura e iluminação ambiente sutis */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-dot-grid opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-brand-300/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-indigo-300/20 blur-3xl"
      />

      {/* Barra superior limpa */}
      <header className="relative z-10 border-b border-slate-200/70 bg-white/75 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm shadow-brand-600/30">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-extrabold tracking-tight text-slate-900">
                Simula<span className="text-brand-600">ENADE</span>
              </p>
              <p className="text-[11px] font-medium text-slate-500">
                Sistemas de Computação
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Banco oficial · {availableYears.length} edições
            </span>
            <button
              type="button"
              onClick={() => onSelectRole("student")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Entrar
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {logoutNotice && (
          <div
            role="status"
            className="mb-6 flex items-center gap-2.5 self-start rounded-2xl border border-emerald-200/90 bg-emerald-50/90 px-4 py-2.5 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur-sm sm:text-sm"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <span>Sessão encerrada com segurança. Selecione seu perfil para entrar novamente.</span>
          </div>
        )}

        <div className="grid items-center gap-10 lg:grid-cols-[1.12fr_0.95fr] lg:gap-12">
          {/* Coluna esquerda: Hero editorial + indicadores */}
          <section className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-white/90 px-3.5 py-1.5 text-xs font-bold text-brand-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
              <span>Plataforma de Simulados do ENADE</span>
            </div>

            <h1 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
              Estude com provas reais e{" "}
              <span className="bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">
                acompanhe sua evolução
              </span>
              .
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Resolva questões oficiais de Computação comentadas passo a passo, filtre por
              disciplina ou edição da prova e identifique os temas prioritários para o exame.
            </p>

            {/* Ações rápidas do Hero */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onSelectRole("student")}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <span>Começar como Aluno</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                onClick={() => onSelectRole("professor")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <Users className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                <span>Sou Professor</span>
              </button>
            </div>

            {/* Indicadores do banco */}
            <div className="mt-9 grid max-w-lg grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-3.5 shadow-sm backdrop-blur-sm">
                <p className="text-xl font-extrabold tabular-nums tracking-tight text-slate-900 sm:text-2xl">
                  {questions.length}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                  Questões oficiais
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-3.5 shadow-sm backdrop-blur-sm">
                <p className="text-xl font-extrabold tabular-nums tracking-tight text-slate-900 sm:text-2xl">
                  {studyAreas.length}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                  Disciplinas
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-3.5 shadow-sm backdrop-blur-sm">
                <p className="text-xl font-extrabold tabular-nums tracking-tight text-slate-900 sm:text-2xl">
                  {yearsRange}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                  Edições ENADE
                </p>
              </div>
            </div>

            {/* Preview discreto de disciplinas */}
            <div className="mt-6 hidden max-w-lg items-center gap-2.5 sm:flex">
              <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <Layers className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
                Temas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {studyAreas.slice(0, 4).map((area) => (
                  <span
                    key={area.id}
                    className="rounded-lg border border-slate-200/70 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                  >
                    {area.title}
                  </span>
                ))}
                {studyAreas.length > 4 && (
                  <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">
                    +{studyAreas.length - 4}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Coluna direita: Painel moderno de seleção de perfil */}
          <section
            aria-label="Seleção de perfil de acesso"
            className="animate-scale-in rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-xl shadow-slate-900/[0.05] backdrop-blur-xl sm:p-7"
          >
            <div className="mb-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                Portal de acesso
              </p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">
                Como você deseja entrar?
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Escolha o seu perfil para acessar ou criar uma conta na plataforma.
              </p>
            </div>

            <div className="space-y-3">
              {/* Perfil Principal: Aluno */}
              <button
                type="button"
                onClick={() => onSelectRole("student")}
                className="group relative flex w-full flex-col gap-4 rounded-2xl border border-brand-200/80 bg-gradient-to-br from-brand-50/80 via-white to-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/25 transition-transform duration-200 group-hover:scale-105">
                      <GraduationCap className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-brand-700">
                          Sou Aluno
                        </h3>
                        <span className="rounded-full bg-brand-100/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700">
                          Principal
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-600">
                        Resolva simulados, consulte gabaritos comentados e veja suas métricas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-brand-100/80 pt-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <BookOpenCheck className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                    Login ou cadastro rápido
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 transition-transform duration-200 group-hover:translate-x-0.5">
                    Continuar
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </button>

              {/* Perfil Secundário: Professor */}
              <button
                type="button"
                onClick={() => onSelectRole("professor")}
                className="group flex w-full items-center justify-between gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100 transition-colors duration-200 group-hover:bg-indigo-600 group-hover:text-white">
                    <Users className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-700">
                        Sou Professor
                      </h3>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                        Docente
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                      Revise questões, crie listas e acompanhe turmas.
                    </p>
                  </div>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-indigo-600"
                  aria-hidden="true"
                />
              </button>

              {/* Perfil Secundário: Administrador */}
              <button
                type="button"
                onClick={() => onSelectRole("admin")}
                className="group flex w-full items-center justify-between gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50/80 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200/80 transition-colors duration-200 group-hover:bg-slate-900 group-hover:text-white">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Administrador
                      </h3>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                        Gestão
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                      Gerencie provas, contas e aprovação de docentes.
                    </p>
                  </div>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-slate-800"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="mt-5 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-4 text-[11px] font-medium text-slate-400">
              <Lock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <span>Ambiente acadêmico seguro com controle de acesso por perfil</span>
            </div>
          </section>
        </div>
      </main>

      {/* Rodapé discreto */}
      <footer className="relative z-10 border-t border-slate-200/60 bg-white/50 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 text-xs font-medium text-slate-400 sm:px-6 lg:px-8">
          <span>SimulaENADE · Preparação para Sistemas de Computação</span>
          <span>
            {questions.length} questões · {studyAreas.length} disciplinas · {availableYears.length}{" "}
            edições
          </span>
        </div>
      </footer>
    </div>
  );
}
