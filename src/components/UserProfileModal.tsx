import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronRight,
  GraduationCap,
  LogOut,
  Settings,
  ShieldCheck,
  Sliders,
  User,
  X,
} from "lucide-react";
import { profileService } from "../services/profile.service";
import type { AppUser } from "../types/user";
import { cn } from "../lib/utils";

export type UserModalTab = "menu" | "settings";

interface UserProfileModalProps {
  readonly isOpen: boolean;
  readonly initialTab?: UserModalTab;
  readonly user: AppUser;
  readonly onClose: () => void;
  readonly onUpdateUser: (user: AppUser) => Promise<void> | void;
  readonly onLogout: () => void;
}

function getRoleLabel(user: AppUser): string {
  switch (user.role) {
    case "STUDENT":
      return "Conta do Estudante";
    case "PROFESSOR":
      return user.isVerified ? "Conta do Professor" : "Professor · validação pendente";
    case "ADMIN":
      return user.accessLevel === "SUPER_ADMIN"
        ? "Administração · Super Admin"
        : "Administração · Coordenação";
  }
}

function getRoleSubtitle(user: AppUser): string {
  switch (user.role) {
    case "STUDENT":
      return `${user.course} · ${user.registration}`;
    case "PROFESSOR":
      return `${user.department}${user.academicTitle ? ` · ${user.academicTitle}` : ""}`;
    case "ADMIN":
      return `${user.sector} · ${user.employeeCode}`;
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Não foi possível salvar as alterações.";
}

export function UserProfileModal({
  isOpen,
  initialTab = "menu",
  user,
  onClose,
  onUpdateUser,
  onLogout,
}: UserProfileModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [activeTab, setActiveTab] = useState<UserModalTab>(initialTab);
  const [name, setName] = useState(user.name);
  const [course, setCourse] = useState(user.role === "STUDENT" ? user.course : "");
  const [semester, setSemester] = useState(
    user.role === "STUDENT" ? (user.semester ?? "") : "",
  );
  const [weeklyGoalTarget, setWeeklyGoalTarget] = useState(
    user.role === "STUDENT" ? user.weeklyGoalTarget : 20,
  );
  const [showTimerInExam, setShowTimerInExam] = useState(
    user.role === "STUDENT" ? user.showTimerInExam : true,
  );
  const [instantFeedback, setInstantFeedback] = useState(
    user.role === "STUDENT" ? user.instantFeedback : true,
  );
  const [department, setDepartment] = useState(
    user.role === "PROFESSOR" ? user.department : "",
  );
  const [academicTitle, setAcademicTitle] = useState(
    user.role === "PROFESSOR" ? (user.academicTitle ?? "") : "",
  );
  const [specializationAreas, setSpecializationAreas] = useState(
    user.role === "PROFESSOR" ? user.specializationAreas.join(", ") : "",
  );
  const [sector, setSector] = useState(user.role === "ADMIN" ? user.sector : "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setActiveTab(initialTab);
    setName(user.name);
    setError(null);
    setSavedSuccess(false);

    if (user.role === "STUDENT") {
      setCourse(user.course);
      setSemester(user.semester ?? "");
      setWeeklyGoalTarget(user.weeklyGoalTarget);
      setShowTimerInExam(user.showTimerInExam);
      setInstantFeedback(user.instantFeedback);
    } else if (user.role === "PROFESSOR") {
      setDepartment(user.department);
      setAcademicTitle(user.academicTitle ?? "");
      setSpecializationAreas(user.specializationAreas.join(", "));
    } else {
      setSector(user.sector);
    }
  }, [isOpen, initialTab, user]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      let updated: AppUser;

      if (user.role === "STUDENT") {
        updated = await profileService.updateStudentProfile({
          name: name.trim(),
          course: course.trim(),
          semester: semester === "" ? null : Number(semester),
          weeklyGoalTarget: Number(weeklyGoalTarget),
          showTimerInExam,
          instantFeedback,
        });
      } else if (user.role === "PROFESSOR") {
        updated = await profileService.updateProfessorProfile({
          name: name.trim(),
          department: department.trim(),
          academicTitle: academicTitle.trim() || null,
          specializationAreas: specializationAreas
            .split(",")
            .map((area) => area.trim())
            .filter(Boolean),
        });
      } else {
        updated = await profileService.updateAdminProfile({
          name: name.trim(),
          sector: sector.trim(),
        });
      }

      await onUpdateUser(updated);
      setSavedSuccess(true);
      window.setTimeout(() => setSavedSuccess(false), 2000);
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-profile-modal-title"
        className="w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl transition-all sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Cabeçalho do Modal com dados do usuário */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-brand-900 px-6 pb-6 pt-6 text-white">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar modal da conta"
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lg font-extrabold text-white ring-2 ring-white/20">
              {user.initials}
            </span>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-200 ring-1 ring-inset ring-white/15">
                {getRoleLabel(user)}
              </span>
              <h2
                id="user-profile-modal-title"
                className="mt-1.5 truncate text-base font-bold tracking-tight text-white sm:text-lg"
              >
                {user.name}
              </h2>
              <p className="truncate text-xs text-slate-300">{getRoleSubtitle(user)}</p>
            </div>
          </div>
        </div>

        {/* Conteúdo: Menu Principal ("Configurações" e "Sair") ou Tela de Configurações */}
        {activeTab === "menu" ? (
          <div className="p-6">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Opções da Conta
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-sm transition hover:border-brand-300 hover:bg-brand-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <div className="flex items-center gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                    <Settings className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <span className="block text-sm font-bold text-slate-900 group-hover:text-brand-700">
                      Configurações
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Editar perfil, preferências e dados do seu papel
                    </span>
                  </div>
                </div>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-rose-200/80 bg-rose-50/40 p-4 text-left shadow-sm transition hover:border-rose-300 hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                <div className="flex items-center gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 transition group-hover:bg-rose-600 group-hover:text-white">
                    <LogOut className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <span className="block text-sm font-bold text-rose-700">Sair</span>
                    <span className="mt-0.5 block text-xs text-rose-600/80">
                      Encerrar sessão atual e sair do sistema
                    </span>
                  </div>
                </div>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-rose-400 transition-transform group-hover:translate-x-0.5 group-hover:text-rose-600"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveSettings} className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab("menu")}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Voltar
              </button>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Sliders className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                Configurações
              </span>
            </div>

            <div className="space-y-3.5">
              <div>
                <label
                  htmlFor="profile-name-input"
                  className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-700"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  Nome completo
                </label>
                <input
                  id="profile-name-input"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs font-medium text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:text-sm"
                  required
                />
              </div>

              {user.role === "STUDENT" && (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="student-course-input"
                        className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-700"
                      >
                        <GraduationCap className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                        Curso
                      </label>
                      <input
                        id="student-course-input"
                        type="text"
                        value={course}
                        onChange={(event) => setCourse(event.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs font-medium text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="student-semester-input"
                        className="mb-1 block text-xs font-bold text-slate-700"
                      >
                        Período atual
                      </label>
                      <input
                        id="student-semester-input"
                        type="number"
                        min={1}
                        max={14}
                        value={semester}
                        onChange={(event) => setSemester(event.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs font-medium text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="student-weekly-goal-input"
                      className="mb-1 block text-xs font-bold text-slate-700"
                    >
                      Meta semanal de questões
                    </label>
                    <input
                      id="student-weekly-goal-input"
                      type="number"
                      min={5}
                      max={200}
                      value={weeklyGoalTarget}
                      onChange={(event) => setWeeklyGoalTarget(Number(event.target.value))}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs font-medium text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Preferências do Sistema
                    </p>

                    <label className="flex cursor-pointer items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-700">
                        Exibir tempo estimado na prova
                      </span>
                      <input
                        type="checkbox"
                        checked={showTimerInExam}
                        onChange={(event) => setShowTimerInExam(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                    </label>

                    <label className="flex cursor-pointer items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-700">
                        Mostrar resolução comentada após responder
                      </span>
                      <input
                        type="checkbox"
                        checked={instantFeedback}
                        onChange={(event) => setInstantFeedback(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                    </label>
                  </div>
                </>
              )}

              {user.role === "PROFESSOR" && (
                <>
                  <div>
                    <label
                      htmlFor="professor-department-input"
                      className="mb-1 block text-xs font-bold text-slate-700"
                    >
                      Departamento
                    </label>
                    <input
                      id="professor-department-input"
                      type="text"
                      value={department}
                      onChange={(event) => setDepartment(event.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs font-medium text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="professor-title-input"
                      className="mb-1 block text-xs font-bold text-slate-700"
                    >
                      Título acadêmico
                    </label>
                    <input
                      id="professor-title-input"
                      type="text"
                      value={academicTitle}
                      onChange={(event) => setAcademicTitle(event.target.value)}
                      placeholder="Ex.: Mestre, Doutor, Especialista"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs font-medium text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="professor-areas-input"
                      className="mb-1 block text-xs font-bold text-slate-700"
                    >
                      Áreas de especialização
                    </label>
                    <input
                      id="professor-areas-input"
                      type="text"
                      value={specializationAreas}
                      onChange={(event) => setSpecializationAreas(event.target.value)}
                      placeholder="Separe as áreas por vírgula"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs font-medium text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:text-sm"
                    />
                  </div>

                  <div
                    className={cn(
                      "flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold ring-1 ring-inset",
                      user.isVerified
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-amber-50 text-amber-700 ring-amber-200",
                    )}
                  >
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      {user.isVerified
                        ? "Cadastro docente validado. Você pode atuar na autoria de questões."
                        : "Seu cadastro docente aguarda validação da Administração para publicar questões."}
                    </span>
                  </div>
                </>
              )}

              {user.role === "ADMIN" && (
                <>
                  <div>
                    <label
                      htmlFor="admin-sector-input"
                      className="mb-1 block text-xs font-bold text-slate-700"
                    >
                      Setor
                    </label>
                    <input
                      id="admin-sector-input"
                      type="text"
                      value={sector}
                      onChange={(event) => setSector(event.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs font-medium text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 ring-1 ring-inset ring-slate-200">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Nível de acesso
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-slate-800">
                      {user.accessLevel === "SUPER_ADMIN" ? "Super Administrador" : "Coordenação"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Código funcional: {user.employeeCode}
                    </p>
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {error}
              </div>
            )}

            {savedSuccess && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                Configurações salvas com sucesso!
              </div>
            )}

            <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/60 px-3.5 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sair do sistema
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:flex-initial"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-initial"
                >
                  {isSaving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
