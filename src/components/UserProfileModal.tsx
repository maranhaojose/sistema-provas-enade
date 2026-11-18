import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  GraduationCap,
  LogOut,
  Settings,
  Sliders,
  User,
  X,
} from "lucide-react";
import type { StudentProfile } from "../types/question";
import { cn } from "../lib/utils";

export type UserModalTab = "menu" | "settings";

interface UserProfileModalProps {
  readonly isOpen: boolean;
  readonly initialTab?: UserModalTab;
  readonly student: StudentProfile;
  readonly onClose: () => void;
  readonly onUpdateStudent: (updated: StudentProfile) => void;
  readonly onLogout: () => void;
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "AL";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function UserProfileModal({
  isOpen,
  initialTab = "menu",
  student,
  onClose,
  onUpdateStudent,
  onLogout,
}: UserProfileModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [activeTab, setActiveTab] = useState<UserModalTab>(initialTab);
  const [name, setName] = useState(student.name);
  const [registration, setRegistration] = useState(student.registration);
  const [course, setCourse] = useState(student.course);
  const [showTimerInExam, setShowTimerInExam] = useState(true);
  const [instantFeedback, setInstantFeedback] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setName(student.name);
      setRegistration(student.registration);
      setCourse(student.course);
      setSavedSuccess(false);
    }
  }, [isOpen, initialTab, student]);

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

  const handleSaveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim() || student.name;
    const trimmedRegistration = registration.trim() || student.registration;
    const trimmedCourse = course.trim() || student.course;

    onUpdateStudent({
      name: trimmedName,
      registration: trimmedRegistration,
      course: trimmedCourse,
      initials: getInitials(trimmedName),
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2000);
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
              {student.initials}
            </span>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-200 ring-1 ring-inset ring-white/15">
                Conta do Estudante
              </span>
              <h2
                id="user-profile-modal-title"
                className="mt-1.5 truncate text-base font-bold tracking-tight text-white sm:text-lg"
              >
                {student.name}
              </h2>
              <p className="truncate text-xs text-slate-300">
                {student.course} · {student.registration}
              </p>
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
              {/* Opção: Configurações */}
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
                      Editar perfil, curso e preferências do simulado
                    </span>
                  </div>
                </div>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
                  aria-hidden="true"
                />
              </button>

              {/* Opção: Sair */}
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
                    <span className="block text-sm font-bold text-rose-700">
                      Sair
                    </span>
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
                  htmlFor="student-name-input"
                  className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-700"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  Nome completo
                </label>
                <input
                  id="student-name-input"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs font-medium text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:text-sm"
                  required
                />
              </div>

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
                    htmlFor="student-reg-input"
                    className="mb-1 block text-xs font-bold text-slate-700"
                  >
                    Matrícula
                  </label>
                  <input
                    id="student-reg-input"
                    type="text"
                    value={registration}
                    onChange={(event) => setRegistration(event.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs font-medium text-slate-900 transition focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Preferências de estudo */}
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
            </div>

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
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/60 px-3.5 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100",
                )}
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
                  className="flex-1 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-700 sm:flex-initial"
                >
                  Salvar
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
