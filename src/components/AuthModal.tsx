import { useState, type FormEvent } from "react";
import { AlertCircle, GraduationCap, Loader2, ShieldCheck, Users, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import type { AppUser } from "../types/user";

interface AuthModalProps {
  readonly initialRole: AppUser["role"];
  readonly onClose: () => void;
}

const ROLE_LABELS: Record<AppUser["role"], string> = {
  STUDENT: "Aluno",
  PROFESSOR: "Professor",
  ADMIN: "Administrador",
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Não foi possível concluir a operação.";
}

export function AuthModal({ initialRole, onClose }: AuthModalProps) {
  const { login, registerStudent, registerProfessor, error, clearError, isLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"STUDENT" | "PROFESSOR">(
    initialRole === "PROFESSOR" ? "PROFESSOR" : "STUDENT",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registration, setRegistration] = useState("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [institutionalId, setInstitutionalId] = useState("");
  const [department, setDepartment] = useState("");
  const [academicTitle, setAcademicTitle] = useState("");
  const [specializationAreas, setSpecializationAreas] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const isAdmin = initialRole === "ADMIN";
  const isSubmitting = isLoading;

  function handleClose() {
    clearError();
    setFormError(null);
    onClose();
  }

  function switchMode(nextMode: "login" | "register") {
    clearError();
    setFormError(null);
    setMode(nextMode);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setFormError(null);

    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else if (role === "STUDENT") {
        await registerStudent({
          name: name.trim(),
          email: email.trim(),
          password,
          registration: registration.trim(),
          course: course.trim(),
          semester: semester ? Number(semester) : undefined,
        });
      } else {
        await registerProfessor({
          name: name.trim(),
          email: email.trim(),
          password,
          institutionalId: institutionalId.trim(),
          department: department.trim(),
          academicTitle: academicTitle.trim() || undefined,
          specializationAreas: specializationAreas
            .split(",")
            .map((area) => area.trim())
            .filter(Boolean),
        });
      }
      onClose();
    } catch (submitError) {
      setFormError(getErrorMessage(submitError));
    }
  }

  const fieldClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20";
  const labelClass = "mb-1.5 block text-xs font-bold text-slate-700";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 px-4 py-8 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative my-auto w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              {role === "STUDENT" ? (
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
              ) : role === "PROFESSOR" ? (
                <Users className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              )}
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                {isAdmin ? "Acesso administrativo" : "Portal SimulaENADE"}
              </p>
              <h2 id="auth-modal-title" className="text-lg font-extrabold text-slate-900">
                Perfil: {ROLE_LABELS[isAdmin ? "ADMIN" : role]}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-6 sm:px-8">
          {!isAdmin && (
            <div className="mb-5 flex gap-2 rounded-xl bg-slate-100 p-1" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                onClick={() => switchMode("login")}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${
                  mode === "login"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "register"}
                onClick={() => switchMode("register")}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${
                  mode === "register"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Criar conta
              </button>
            </div>
          )}

          {mode === "register" && !isAdmin && (
            <div className="mb-5 flex gap-2" role="group" aria-label="Tipo de cadastro">
              {(["STUDENT", "PROFESSOR"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    clearError();
                    setFormError(null);
                    setRole(option);
                  }}
                  className={`flex-1 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                    role === option
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {option === "STUDENT" ? "Aluno" : "Professor"}
                </button>
              ))}
            </div>
          )}

          {(error || formError) && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{formError ?? error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label htmlFor="auth-name" className={labelClass}>
                  Nome completo
                </label>
                <input
                  id="auth-name"
                  required
                  minLength={3}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Como seu nome aparecerá na plataforma"
                  className={fieldClass}
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className={labelClass}>
                E-mail institucional
              </label>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nome@enade.edu.br"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="auth-password" className={labelClass}>
                Senha
              </label>
              <input
                id="auth-password"
                type="password"
                required
                minLength={mode === "register" ? 8 : 1}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={mode === "register" ? "Mínimo de 8 caracteres" : "Sua senha"}
                className={fieldClass}
              />
            </div>

            {mode === "register" && role === "STUDENT" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="auth-registration" className={labelClass}>
                    Matrícula
                  </label>
                  <input
                    id="auth-registration"
                    required
                    minLength={4}
                    value={registration}
                    onChange={(event) => setRegistration(event.target.value)}
                    placeholder="2021.1.04512"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="auth-course" className={labelClass}>
                    Curso
                  </label>
                  <input
                    id="auth-course"
                    required
                    minLength={3}
                    value={course}
                    onChange={(event) => setCourse(event.target.value)}
                    placeholder="Sistemas de Computação"
                    className={fieldClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="auth-semester" className={labelClass}>
                    Período (opcional)
                  </label>
                  <input
                    id="auth-semester"
                    type="number"
                    min={1}
                    max={14}
                    value={semester}
                    onChange={(event) => setSemester(event.target.value)}
                    placeholder="Ex.: 5"
                    className={fieldClass}
                  />
                </div>
              </div>
            )}

            {mode === "register" && role === "PROFESSOR" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="auth-institutional-id" className={labelClass}>
                    Matrícula funcional
                  </label>
                  <input
                    id="auth-institutional-id"
                    required
                    minLength={4}
                    value={institutionalId}
                    onChange={(event) => setInstitutionalId(event.target.value)}
                    placeholder="SIAPE-1234567"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="auth-department" className={labelClass}>
                    Departamento
                  </label>
                  <input
                    id="auth-department"
                    required
                    minLength={3}
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    placeholder="Departamento de Computação"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="auth-title" className={labelClass}>
                    Titulação (opcional)
                  </label>
                  <input
                    id="auth-title"
                    value={academicTitle}
                    onChange={(event) => setAcademicTitle(event.target.value)}
                    placeholder="Doutor"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="auth-areas" className={labelClass}>
                    Áreas de atuação (opcional)
                  </label>
                  <input
                    id="auth-areas"
                    value={specializationAreas}
                    onChange={(event) => setSpecializationAreas(event.target.value)}
                    placeholder="redes, banco-de-dados"
                    className={fieldClass}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Aguarde...
                </>
              ) : mode === "login" ? (
                "Entrar na plataforma"
              ) : (
                "Criar conta e entrar"
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] font-medium leading-relaxed text-slate-500">
            Ao continuar, você concorda com o uso das suas informações acadêmicas para personalizar
            a experiência de estudo.
          </p>
        </div>
      </div>
    </div>
  );
}
