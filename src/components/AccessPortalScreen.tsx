import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  ShieldCheck,
  Users,
  Sparkles,
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
  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      {/* Detalhes decorativos sutis de fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl"
      />

      <main className="relative mx-auto w-full max-w-4xl animate-fade-up">
        {/* Cabeçalho da Plataforma */}
        <header className="text-center">
          <div className="mx-auto inline-flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-2 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm shadow-brand-600/30">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="text-left">
              <p className="text-sm font-extrabold tracking-tight text-slate-900">
                Simula<span className="text-brand-600">ENADE</span>
              </p>
              <p className="text-[11px] font-semibold text-slate-400">
                Sistemas de Computação
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700 ring-1 ring-inset ring-brand-100">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
              Portal de Acesso
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Como você deseja acessar o sistema?
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-relaxed text-slate-500">
            Selecione o seu perfil abaixo para entrar na plataforma de preparação e gestão de
            simulados do ENADE.
          </p>
        </header>

        {/* Aviso após encerramento de sessão */}
        {logoutNotice && (
          <div
            role="status"
            className="mx-auto mt-6 flex max-w-xl items-center justify-center gap-2 rounded-2xl border border-emerald-200/90 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-sm sm:text-sm"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <span>Sua sessão foi encerrada com segurança. Escolha um perfil para entrar novamente.</span>
          </div>
        )}

        {/* Cards de Seleção: Aluno vs Admin */}
        <section
          aria-label="Seleção de perfil de acesso"
          className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3"
        >
          {/* Card: Aluno */}
          <button
            type="button"
            onClick={() => onSelectRole("student")}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 text-left shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:p-7"
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm shadow-brand-600/25 transition-transform duration-200 group-hover:scale-105">
                  <GraduationCap className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold text-brand-700 ring-1 ring-inset ring-brand-100">
                  Área do Estudante
                </span>
              </div>

              <h2 className="mt-5 text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-brand-700">
                Entrar como Aluno
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500 sm:text-sm">
                Acesse os simulados oficiais do ENADE, resolva questões por disciplina ou ano e
                acompanhe seu desempenho em tempo real.
              </p>

              <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600">
                <li className="flex items-center gap-2">
                  <BookOpenCheck className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                  <span>{questions.length} questões com gabarito comentado</span>
                </li>
                <li className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                  <span>Simulados completos por disciplina e edição</span>
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                  <span>Métricas de acertos e acompanhamento de metas</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl bg-brand-600 px-4 py-3 text-xs font-bold text-white shadow-sm shadow-brand-600/25 transition group-hover:bg-brand-700 sm:text-sm">
              <span>Continuar como Aluno</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
          </button>

          {/* Card: Professor */}
          <button
            type="button"
            onClick={() => onSelectRole("professor")}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 text-left shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:p-7"
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-sm shadow-indigo-600/25 transition-transform duration-200 group-hover:scale-105">
                  <Users className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                  Corpo Docente
                </span>
              </div>

              <h2 className="mt-5 text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-700">
                Entrar como Professor
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500 sm:text-sm">
                Autorie e revise questões, acompanhe o desempenho das turmas e monte listas de
                estudos para suas disciplinas.
              </p>

              <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600">
                <li className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
                  <span>Autoria e revisão de questões</span>
                </li>
                <li className="flex items-center gap-2">
                  <BookOpenCheck className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
                  <span>Listas por turma e disciplina</span>
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
                  <span>Métricas agregadas de desempenho</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-sm shadow-indigo-600/25 transition group-hover:bg-indigo-700 sm:text-sm">
              <span>Continuar como Professor</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
          </button>

          {/* Card: Administrador */}
          <button
            type="button"
            onClick={() => onSelectRole("admin")}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 text-left shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 sm:p-7"
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                  <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-inset ring-slate-200/80">
                  Gestão Acadêmica
                </span>
              </div>

              <h2 className="mt-5 text-lg font-extrabold tracking-tight text-slate-900">
                Entrar como Administrador
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500 sm:text-sm">
                Ambiente destinado a coordenadores e administradores para gerenciar provas, banco de
                questões e indicadores institucionais.
              </p>

              <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-slate-700" aria-hidden="true" />
                  <span>Cadastro e revisão do banco de questões</span>
                </li>
                <li className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 shrink-0 text-slate-700" aria-hidden="true" />
                  <span>Organização de edições e disciplinas do ENADE</span>
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 shrink-0 text-slate-700" aria-hidden="true" />
                  <span>Relatórios consolidados de desempenho</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-sm transition group-hover:bg-slate-800 sm:text-sm">
              <span>Continuar como Admin</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
          </button>
        </section>

        {/* Rodapé informativo */}
        <footer className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-400">
          <span>{questions.length} questões oficiais</span>
          <span aria-hidden="true">·</span>
          <span>{studyAreas.length} disciplinas de Computação</span>
          <span aria-hidden="true">·</span>
          <span>{availableYears.length} edições do ENADE</span>
        </footer>
      </main>
    </div>
  );
}
