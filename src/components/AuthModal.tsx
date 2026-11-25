import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  hasValidationErrors,
  MIN_REGISTER_PASSWORD_LENGTH,
  validateCourse,
  validateDepartment,
  validateEmail,
  validateInstitutionalId,
  validateLoginForm,
  validateName,
  validatePassword,
  validateProfessorRegisterForm,
  validateRegistration,
  validateSemester,
  validateStudentRegisterForm,
  type AuthFieldErrors,
  type AuthFieldName,
} from "../lib/authValidation";
import { cn } from "../lib/utils";
import { AuthError } from "../services/auth.service";
import type { AppUser } from "../types/user";

interface AuthModalProps {
  readonly initialRole: AppUser["role"];
  readonly onClose: () => void;
  readonly onAuthSuccess?: () => void;
}

const ROLE_LABELS: Record<AppUser["role"], string> = {
  STUDENT: "Aluno",
  PROFESSOR: "Professor",
  ADMIN: "Administrador",
};

const FIELD_INPUT_IDS: Record<AuthFieldName, string> = {
  name: "auth-name",
  email: "auth-email",
  password: "auth-password",
  registration: "auth-registration",
  course: "auth-course",
  semester: "auth-semester",
  institutionalId: "auth-institutional-id",
  department: "auth-department",
};

const FIELD_ORDER: readonly AuthFieldName[] = [
  "name",
  "email",
  "password",
  "registration",
  "course",
  "semester",
  "institutionalId",
  "department",
];

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Não foi possível concluir a operação.";
}

function mapServerFieldErrors(
  serverErrors?: Record<string, string[]>,
): AuthFieldErrors {
  if (!serverErrors) return {};

  const mapped: AuthFieldErrors = {};
  for (const field of FIELD_ORDER) {
    const firstMessage = serverErrors[field]?.[0];
    if (firstMessage) {
      mapped[field] = firstMessage;
    }
  }
  return mapped;
}

function RequiredMark() {
  return (
    <span className="ml-0.5 text-rose-500" aria-hidden="true">
      *
    </span>
  );
}

function FieldErrorMessage({ id, message }: { readonly id: string; readonly message?: string }) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-600"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

export function AuthModal({ initialRole, onClose, onAuthSuccess }: AuthModalProps) {
  const { login, registerStudent, registerProfessor, error, clearError, isLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"STUDENT" | "PROFESSOR">(
    initialRole === "PROFESSOR" ? "PROFESSOR" : "STUDENT",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registration, setRegistration] = useState("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [institutionalId, setInstitutionalId] = useState("");
  const [department, setDepartment] = useState("");
  const [academicTitle, setAcademicTitle] = useState("");
  const [specializationAreas, setSpecializationAreas] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const isAdmin = initialRole === "ADMIN";
  const isSubmitting = isLoading;

  function resetFeedback() {
    clearError();
    setFormError(null);
    setFieldErrors({});
  }

  function handleClose() {
    resetFeedback();
    onClose();
  }

  function switchMode(nextMode: "login" | "register") {
    resetFeedback();
    setMode(nextMode);
  }

  function validateSingleField(field: AuthFieldName, value: string): string | undefined {
    switch (field) {
      case "name":
        return validateName(value);
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value, mode);
      case "registration":
        return validateRegistration(value);
      case "course":
        return validateCourse(value);
      case "semester":
        return validateSemester(value);
      case "institutionalId":
        return validateInstitutionalId(value);
      case "department":
        return validateDepartment(value);
    }
  }

  function updateFieldError(field: AuthFieldName, nextError?: string) {
    setFieldErrors((prev) => {
      if (prev[field] === nextError) return prev;
      return { ...prev, [field]: nextError };
    });
  }

  function handleFieldChange(field: AuthFieldName, value: string, setter: (v: string) => void) {
    setter(value);
    if (formError) setFormError(null);
    if (error) clearError();
    if (fieldErrors[field]) {
      updateFieldError(field, validateSingleField(field, value));
    }
  }

  function handleFieldBlur(field: AuthFieldName, value: string) {
    updateFieldError(field, validateSingleField(field, value));
  }

  function focusFirstInvalidField(errors: AuthFieldErrors) {
    for (const field of FIELD_ORDER) {
      if (errors[field]) {
        const element = document.getElementById(FIELD_INPUT_IDS[field]);
        element?.focus();
        break;
      }
    }
  }

  function validateCurrentForm(): AuthFieldErrors {
    if (mode === "login") {
      return validateLoginForm({ email, password });
    }

    if (role === "STUDENT") {
      return validateStudentRegisterForm({
        name,
        email,
        password,
        registration,
        course,
        semester,
      });
    }

    return validateProfessorRegisterForm({
      name,
      email,
      password,
      institutionalId,
      department,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setFormError(null);

    const validationErrors = validateCurrentForm();
    setFieldErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      setFormError("Verifique os campos destacados antes de continuar.");
      focusFirstInvalidField(validationErrors);
      return;
    }

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
          semester: semester.trim() ? Number(semester.trim()) : undefined,
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
      if (onAuthSuccess) {
        onAuthSuccess();
      } else {
        onClose();
      }
    } catch (submitError) {
      if (submitError instanceof AuthError && submitError.fieldErrors) {
        const mappedServerErrors = mapServerFieldErrors(submitError.fieldErrors);
        if (hasValidationErrors(mappedServerErrors)) {
          setFieldErrors((prev) => ({ ...prev, ...mappedServerErrors }));
          focusFirstInvalidField(mappedServerErrors);
        }
      }
      setFormError(getErrorMessage(submitError));
    }
  }

  const getFieldClass = (hasError: boolean, extraPaddingRight = false) =>
    cn(
      "h-11 w-full rounded-xl border bg-slate-50/70 pl-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:outline-none focus:ring-2",
      extraPaddingRight ? "pr-11" : "pr-3.5",
      hasError
        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
        : "border-slate-200 focus:border-brand-500 focus:ring-brand-500/20",
    );

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
              {isAdmin ? (
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              ) : role === "STUDENT" ? (
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Users className="h-5 w-5" aria-hidden="true" />
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
                    resetFeedback();
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

          <p className="mb-4 text-[11px] font-medium text-slate-500">
            Campos marcados com <span className="font-bold text-rose-500">*</span> são obrigatórios.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {mode === "register" && (
              <div>
                <label htmlFor="auth-name" className={labelClass}>
                  Nome completo
                  <RequiredMark />
                </label>
                <input
                  id="auth-name"
                  name="name"
                  required
                  aria-required="true"
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? "auth-name-error" : undefined}
                  autoComplete="name"
                  value={name}
                  onChange={(event) => handleFieldChange("name", event.target.value, setName)}
                  onBlur={() => handleFieldBlur("name", name)}
                  placeholder="Como seu nome aparecerá na plataforma"
                  className={getFieldClass(Boolean(fieldErrors.name))}
                />
                <FieldErrorMessage id="auth-name-error" message={fieldErrors.name} />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className={labelClass}>
                E-mail institucional
                <RequiredMark />
              </label>
              <input
                id="auth-email"
                name="email"
                type="email"
                required
                aria-required="true"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "auth-email-error" : undefined}
                autoComplete="email"
                value={email}
                onChange={(event) => handleFieldChange("email", event.target.value, setEmail)}
                onBlur={() => handleFieldBlur("email", email)}
                placeholder="nome@enade.edu.br"
                className={getFieldClass(Boolean(fieldErrors.email))}
              />
              <FieldErrorMessage id="auth-email-error" message={fieldErrors.email} />
            </div>

            <div>
              <label htmlFor="auth-password" className={labelClass}>
                Senha
                <RequiredMark />
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  aria-required="true"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "auth-password-error" : undefined}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(event) =>
                    handleFieldChange("password", event.target.value, setPassword)
                  }
                  onBlur={() => handleFieldBlur("password", password)}
                  placeholder={
                    mode === "register"
                      ? `Mínimo de ${MIN_REGISTER_PASSWORD_LENGTH} caracteres`
                      : "Sua senha"
                  }
                  className={getFieldClass(Boolean(fieldErrors.password), true)}
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
              <FieldErrorMessage id="auth-password-error" message={fieldErrors.password} />
            </div>

            {mode === "register" && role === "STUDENT" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="auth-registration" className={labelClass}>
                    Matrícula
                    <RequiredMark />
                  </label>
                  <input
                    id="auth-registration"
                    name="registration"
                    required
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.registration)}
                    aria-describedby={
                      fieldErrors.registration ? "auth-registration-error" : undefined
                    }
                    value={registration}
                    onChange={(event) =>
                      handleFieldChange("registration", event.target.value, setRegistration)
                    }
                    onBlur={() => handleFieldBlur("registration", registration)}
                    placeholder="2021.1.04512"
                    className={getFieldClass(Boolean(fieldErrors.registration))}
                  />
                  <FieldErrorMessage
                    id="auth-registration-error"
                    message={fieldErrors.registration}
                  />
                </div>
                <div>
                  <label htmlFor="auth-course" className={labelClass}>
                    Curso
                    <RequiredMark />
                  </label>
                  <input
                    id="auth-course"
                    name="course"
                    required
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.course)}
                    aria-describedby={fieldErrors.course ? "auth-course-error" : undefined}
                    value={course}
                    onChange={(event) => handleFieldChange("course", event.target.value, setCourse)}
                    onBlur={() => handleFieldBlur("course", course)}
                    placeholder="Sistemas de Computação"
                    className={getFieldClass(Boolean(fieldErrors.course))}
                  />
                  <FieldErrorMessage id="auth-course-error" message={fieldErrors.course} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="auth-semester" className={labelClass}>
                    Período (opcional)
                  </label>
                  <input
                    id="auth-semester"
                    name="semester"
                    type="number"
                    min={1}
                    max={14}
                    aria-invalid={Boolean(fieldErrors.semester)}
                    aria-describedby={fieldErrors.semester ? "auth-semester-error" : undefined}
                    value={semester}
                    onChange={(event) =>
                      handleFieldChange("semester", event.target.value, setSemester)
                    }
                    onBlur={() => handleFieldBlur("semester", semester)}
                    placeholder="Ex.: 5"
                    className={getFieldClass(Boolean(fieldErrors.semester))}
                  />
                  <FieldErrorMessage id="auth-semester-error" message={fieldErrors.semester} />
                </div>
              </div>
            )}

            {mode === "register" && role === "PROFESSOR" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="auth-institutional-id" className={labelClass}>
                    Matrícula funcional
                    <RequiredMark />
                  </label>
                  <input
                    id="auth-institutional-id"
                    name="institutionalId"
                    required
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.institutionalId)}
                    aria-describedby={
                      fieldErrors.institutionalId ? "auth-institutional-id-error" : undefined
                    }
                    value={institutionalId}
                    onChange={(event) =>
                      handleFieldChange(
                        "institutionalId",
                        event.target.value,
                        setInstitutionalId,
                      )
                    }
                    onBlur={() => handleFieldBlur("institutionalId", institutionalId)}
                    placeholder="SIAPE-1234567"
                    className={getFieldClass(Boolean(fieldErrors.institutionalId))}
                  />
                  <FieldErrorMessage
                    id="auth-institutional-id-error"
                    message={fieldErrors.institutionalId}
                  />
                </div>
                <div>
                  <label htmlFor="auth-department" className={labelClass}>
                    Departamento
                    <RequiredMark />
                  </label>
                  <input
                    id="auth-department"
                    name="department"
                    required
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.department)}
                    aria-describedby={
                      fieldErrors.department ? "auth-department-error" : undefined
                    }
                    value={department}
                    onChange={(event) =>
                      handleFieldChange("department", event.target.value, setDepartment)
                    }
                    onBlur={() => handleFieldBlur("department", department)}
                    placeholder="Departamento de Computação"
                    className={getFieldClass(Boolean(fieldErrors.department))}
                  />
                  <FieldErrorMessage
                    id="auth-department-error"
                    message={fieldErrors.department}
                  />
                </div>
                <div>
                  <label htmlFor="auth-title" className={labelClass}>
                    Titulação (opcional)
                  </label>
                  <input
                    id="auth-title"
                    name="academicTitle"
                    value={academicTitle}
                    onChange={(event) => setAcademicTitle(event.target.value)}
                    placeholder="Doutor"
                    className={getFieldClass(false)}
                  />
                </div>
                <div>
                  <label htmlFor="auth-areas" className={labelClass}>
                    Áreas de atuação (opcional)
                  </label>
                  <input
                    id="auth-areas"
                    name="specializationAreas"
                    value={specializationAreas}
                    onChange={(event) => setSpecializationAreas(event.target.value)}
                    placeholder="redes, banco-de-dados"
                    className={getFieldClass(false)}
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
