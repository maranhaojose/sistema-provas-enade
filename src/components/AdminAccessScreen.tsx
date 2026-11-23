import { ArrowLeft, GraduationCap, ShieldCheck, Wrench } from "lucide-react";

interface AdminAccessScreenProps {
  readonly onBack: () => void;
  readonly onSwitchToStudent: () => void;
}

export function AdminAccessScreen({
  onBack,
  onSwitchToStudent,
}: AdminAccessScreenProps) {
  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-slate-200/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-brand-200/35 blur-3xl"
      />

      <main className="relative mx-auto w-full max-w-md animate-scale-in">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-brand-900 px-6 py-7 text-white sm:px-8">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Voltar
              </button>

              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-200 ring-1 ring-inset ring-white/15">
                Em breve
              </span>
            </div>

            <div className="mt-6 flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-inset ring-white/20">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-white sm:text-xl">
                  Acesso Administrativo
                </h1>
                <p className="mt-0.5 text-xs text-slate-300">
                  SimulaENADE · Gestão Acadêmica
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Wrench className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900 sm:text-sm">
                    Módulo administrativo em desenvolvimento
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    A tela de autenticação e o painel de gestão do administrador serão disponibilizados
                    na próxima etapa. Enquanto isso, você pode acessar o portal do aluno.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={onSwitchToStudent}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-xs font-bold text-white shadow-sm shadow-brand-600/25 transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:text-sm"
              >
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
                Ir para Login do Aluno
              </button>

              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Voltar à seleção de perfil
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
