import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Info,
  Layers,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Sparkles,
} from "lucide-react";
import type { StudentLoginCredentials } from "../types/auth";
import { availableYears, studyAreas } from "../data/areas";
import { questions } from "../data/questions";
import {
  hasValidationErrors,
  validateEmail,
  validateLoginForm,
  validatePassword,
} from "../lib/authValidation";
import { cn } from "../lib/utils";

const DEMO_STUDENT_IDENTIFIER = "ana.moraes@enade.edu.br";
const DEMO_STUDENT_PASSWORD = "enade2026";

interface StudentLoginScreenProps {
  readonly onBack: () => void;
  readonly onSwitchToAdmin: () => void;
  readonly onSubmitLogin: (credentials: StudentLoginCredentials) => void;
}

interface FormErrors {
  identifier?: string;
  password?: string;
}

export function StudentLoginScreen({
  onBack,
  onSwitchToAdmin,
  onSubmitLogin,
}: StudentLoginScreenProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecoveryHint, setShowRecoveryHint] = useState(false);

  const validateForm = (): FormErrors => {
    const validation = validateLoginForm({ email: identifier, password });
    const nextErrors: FormErrors = {};

    if (validation.email) {
      nextErrors.identifier = validation.email;
    }

    if (validation.password) {
      nextErrors.password = validation.password;
    }

    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (
      hasValidationErrors({
        email: validationErrors.identifier,
        password: validationErrors.password,
      })
    ) {
      setFormError("Verifique os campos destacados antes de continuar.");
      const firstInvalidId = validationErrors.identifier
        ? "student-identifier"
        : "student-password";
      document.getElementById(firstInvalidId)?.focus();
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    window.setTimeout(() => {
      onSubmitLogin({
        identifier: identifier.trim(),
        password,
        rememberMe,
      });
      setIsSubmitting(false);
    }, 320);
  };

  const handleFillDemoCredentials = () => {
    setIdentifier(DEMO_STUDENT_IDENTIFIER);
    setPassword(DEMO_STUDENT_PASSWORD);
    setErrors({});
    setFormError(null);
    setShowRecoveryHint(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      {/* Detalhes decorativos sutis de fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl"
      />

      <main className="relative mx-auto w-full max-w-5xl animate-scale-in">
        <div className="grid overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card lg:grid-cols-[1.05fr_1fr]">
          {/* Painel Esquerdo: Identidade Visual e Benefícios */}
          <aside className="relative flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-900 to-brand-900 p-7 text-white sm:p-10">
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-inset ring-white/15">
                    <GraduationCap className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-base font-extrabold tracking-tight text-white">
                      Simula<span className="text-brand-300">ENADE</span>
                    </p>
                    <p className="text-[11px] font-medium text-slate-300">
                      Sistemas de Computação
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-200 ring-1 ring-inset ring-white/15">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  Portal do Aluno
                </span>
              </div>

              <h1 className="mt-8 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
                Sua preparação para o ENADE começa aqui.
              </h1>
              <p className="mt-3 text-xs leading-relaxed text-slate-300 sm:text-sm">
                Entre com sua conta de estudante para resolver provas anteriores, revisar questões
                comentadas e acompanhar sua evolução em cada disciplina.
              </p>

              {/* Destaques da plataforma */}
              <div className="mt-8 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 ring-1 ring-inset ring-white/10">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 text-brand-200">
                    <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Banco com {questions.length} questões oficiais
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-300">
                      Questões reais organizadas com gabarito comentado passo a passo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 ring-1 ring-inset ring-white/10">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-200">
                    <Layers className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {studyAreas.length} disciplinas e {availableYears.length} edições
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-300">
                      Filtre por assunto, palavra-chave ou ano da prova para estudar com foco.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 ring-1 ring-inset ring-white/10">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-200">
                    <BarChart3 className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">Métricas de desempenho</p>
                    <p className="mt-0.5 text-[11px] text-slate-300">
                      Visualize sua taxa de acertos e identifique os temas prioritários.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-5 text-[11px] font-medium text-slate-400">
              Ambiente acadêmico seguro · Progresso salvo automaticamente durante o simulado
            </div>
          </aside>

          {/* Painel Direito: Formulário de Autenticação do Aluno */}
          <section aria-labelledby="student-login-heading" className="flex flex-col justify-between p-7 sm:p-10">
            <div>
              {/* Barra superior de retorno */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  Trocar perfil
                </button>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700 ring-1 ring-inset ring-brand-100">
                  <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                  Login do Aluno
                </span>
              </div>

              {/* Título do formulário */}
              <div className="mt-7">
                <h2
                  id="student-login-heading"
                  className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl"
                >
                  Acesse sua conta
                </h2>
                <p className="mt-1.5 text-xs font-medium text-slate-500 sm:text-sm">
                  Informe seu e-mail e sua senha para entrar na plataforma.
                </p>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              )}

              <p className="mt-4 text-[11px] font-medium text-slate-500">
                Campos marcados com <span className="font-bold text-rose-500">*</span> são
                obrigatórios.
              </p>

              {/* Formulário de autenticação */}
              <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
                {/* Campo: E-mail */}
                <div>
                  <label
                    htmlFor="student-identifier"
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    E-mail
                    <span className="ml-0.5 text-rose-500" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <div className="relative">
                    <Mail
                      className={cn(
                        "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors",
                        errors.identifier ? "text-rose-500" : "text-slate-400",
                      )}
                      aria-hidden="true"
                    />
                    <input
                      id="student-identifier"
                      name="identifier"
                      type="email"
                      required
                      aria-required="true"
                      autoComplete="email"
                      value={identifier}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setIdentifier(nextValue);
                        if (formError) setFormError(null);
                        if (errors.identifier) {
                          setErrors((prev) => ({
                            ...prev,
                            identifier: validateEmail(nextValue),
                          }));
                        }
                      }}
                      onBlur={() =>
                        setErrors((prev) => ({
                          ...prev,
                          identifier: validateEmail(identifier),
                        }))
                      }
                      placeholder="aluno@enade.edu.br"
                      aria-invalid={Boolean(errors.identifier)}
                      aria-describedby={errors.identifier ? "student-identifier-error" : undefined}
                      className={cn(
                        "h-11 w-full rounded-xl border bg-slate-50/70 pl-10 pr-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:outline-none focus:ring-2",
                        errors.identifier
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                          : "border-slate-200 focus:border-brand-500 focus:ring-brand-500/20",
                      )}
                    />
                  </div>
                  {errors.identifier && (
                    <p
                      id="student-identifier-error"
                      role="alert"
                      className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-600"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {errors.identifier}
                    </p>
                  )}
                </div>

                {/* Campo: Senha */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label
                      htmlFor="student-password"
                      className="block text-xs font-bold text-slate-700"
                    >
                      Senha
                      <span className="ml-0.5 text-rose-500" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowRecoveryHint((prev) => !prev)}
                      className="text-xs font-semibold text-brand-600 transition hover:text-brand-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock
                      className={cn(
                        "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors",
                        errors.password ? "text-rose-500" : "text-slate-400",
                      )}
                      aria-hidden="true"
                    />
                    <input
                      id="student-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      aria-required="true"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setPassword(nextValue);
                        if (formError) setFormError(null);
                        if (errors.password) {
                          setErrors((prev) => ({
                            ...prev,
                            password: validatePassword(nextValue, "login"),
                          }));
                        }
                      }}
                      onBlur={() =>
                        setErrors((prev) => ({
                          ...prev,
                          password: validatePassword(password, "login"),
                        }))
                      }
                      placeholder="Digite sua senha"
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={errors.password ? "student-password-error" : undefined}
                      className={cn(
                        "h-11 w-full rounded-xl border bg-slate-50/70 pl-10 pr-11 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:outline-none focus:ring-2",
                        errors.password
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                          : "border-slate-200 focus:border-brand-500 focus:ring-brand-500/20",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p
                      id="student-password-error"
                      role="alert"
                      className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-600"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Aviso de recuperação de senha */}
                {showRecoveryHint && (
                  <div
                    role="status"
                    className="flex items-start gap-2.5 rounded-xl border border-brand-200/80 bg-brand-50/70 p-3 text-xs leading-relaxed text-brand-900"
                  >
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                    <p>
                      Caso tenha esquecido sua senha institucional, procure a coordenação do curso ou
                      utilize o botão <strong>Preencher acesso de demonstração</strong> abaixo.
                    </p>
                  </div>
                )}

                {/* Manter conectado */}
                <label className="flex cursor-pointer items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-xs font-semibold text-slate-600">
                    Manter conectado neste dispositivo
                  </span>
                </label>

                {/* Botão de acesso */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white shadow-sm shadow-brand-600/25 transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Acessando plataforma...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" aria-hidden="true" />
                      Entrar na plataforma
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Acesso de demonstração + atalho para Admin */}
            <div className="mt-7 space-y-4 border-t border-slate-100 pt-5">
              <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                    Acesso de demonstração
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-slate-600">
                    {DEMO_STUDENT_IDENTIFIER} · {DEMO_STUDENT_PASSWORD}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemoCredentials}
                  className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  Preencher
                </button>
              </div>

              <p className="text-center text-xs font-medium text-slate-500">
                É administrador da plataforma?{" "}
                <button
                  type="button"
                  onClick={onSwitchToAdmin}
                  className="font-bold text-brand-600 transition hover:text-brand-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  Acessar área administrativa
                </button>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
