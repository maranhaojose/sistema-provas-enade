import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, Check, RefreshCw, ShieldCheck, UserCheck, Users, X } from "lucide-react";
import { adminService } from "../services/admin.service";
import { useAuth } from "../contexts/AuthContext";
import type { AdminAccessLevel, AppUser, UserRole } from "../types/user";
import { cn } from "../lib/utils";

export type AdminPanelTab = "professors" | "users" | "create-admin";

interface AdminManagementModalProps {
  readonly isOpen: boolean;
  readonly initialTab?: AdminPanelTab;
  readonly onClose: () => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: "Aluno",
  PROFESSOR: "Professor",
  ADMIN: "Administração",
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Não foi possível concluir a operação.";
}

function UserRow({
  user,
  children,
}: {
  readonly user: AppUser;
  readonly children?: ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-slate-800">{user.name}</p>
        <p className="truncate text-[11px] text-slate-500">
          {user.email} · {ROLE_LABELS[user.role]}
          {!user.isActive ? " · inativo" : ""}
        </p>
      </div>
      {children}
    </li>
  );
}

export function AdminManagementModal({
  isOpen,
  initialTab = "professors",
  onClose,
}: AdminManagementModalProps) {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminPanelTab>(initialTab);
  const [pendingProfessors, setPendingProfessors] = useState<AppUser[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    employeeCode: "",
    sector: "",
    accessLevel: "COORDINATOR" as AdminAccessLevel,
  });

  const loadData = useCallback(async () => {
    if (activeTab === "create-admin") return;

    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === "professors") {
        setPendingProfessors(await adminService.listUsers({ pendingProfessors: true }));
      } else {
        setUsers(
          await adminService.listUsers({
            role: roleFilter || undefined,
            isActive: activeFilter === "" ? undefined : activeFilter === "true",
          }),
        );
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, activeFilter, roleFilter]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setError(null);
      setNotice(null);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (isOpen) void loadData();
  }, [isOpen, loadData]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleVerify = async (professor: AppUser) => {
    setError(null);
    setNotice(null);
    try {
      await adminService.verifyProfessor(professor.profileId);
      setNotice(`Cadastro de ${professor.name} aprovado.`);
      await loadData();
    } catch (verifyError) {
      setError(getErrorMessage(verifyError));
    }
  };

  const handleToggleStatus = async (target: AppUser) => {
    setError(null);
    setNotice(null);
    try {
      await adminService.updateUserStatus(target.id, !target.isActive);
      setNotice(
        `${target.name} ${target.isActive ? "desativado" : "ativado"} com sucesso.`,
      );
      await loadData();
    } catch (statusError) {
      setError(getErrorMessage(statusError));
    }
  };

  const handleCreateAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsCreating(true);
    try {
      const created = await adminService.createAdmin(newAdmin);
      setNotice(`Administrador ${created.name} criado com sucesso.`);
      setNewAdmin({
        name: "",
        email: "",
        password: "",
        employeeCode: "",
        sector: "",
        accessLevel: "COORDINATOR",
      });
    } catch (createError) {
      setError(getErrorMessage(createError));
    } finally {
      setIsCreating(false);
    }
  };

  const tabs: { id: AdminPanelTab; label: string; icon: typeof UserCheck }[] = [
    { id: "professors", label: "Aprovar professores", icon: UserCheck },
    { id: "users", label: "Gerenciar contas", icon: Users },
    ...(currentUser?.role === "ADMIN" && currentUser.accessLevel === "SUPER_ADMIN"
      ? [{ id: "create-admin" as const, label: "Novo administrador", icon: ShieldCheck }]
      : []),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 id="admin-modal-title" className="text-base font-bold text-slate-900">
              Administração
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Gestão de acesso e validação de perfis da plataforma
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar painel administrativo"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-4 pt-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-t-xl px-3 py-2 text-xs font-bold transition",
                  activeTab === tab.id
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          {notice && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
              {notice}
            </div>
          )}

          {activeTab === "professors" && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Cadastros aguardando validação
                </p>
                <button
                  type="button"
                  onClick={() => void loadData()}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 transition hover:text-brand-700"
                >
                  <RefreshCw className="h-3 w-3" aria-hidden="true" />
                  Atualizar
                </button>
              </div>

              {isLoading ? (
                <p className="py-6 text-center text-xs text-slate-400">Carregando...</p>
              ) : pendingProfessors.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-500">
                  Nenhum docente aguardando validação.
                </p>
              ) : (
                <ul className="space-y-2">
                  {pendingProfessors.map((professor) => (
                    <UserRow key={professor.id} user={professor}>
                      <button
                        type="button"
                        onClick={() => void handleVerify(professor)}
                        className="shrink-0 rounded-lg bg-brand-600 px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-brand-700"
                      >
                        Aprovar
                      </button>
                    </UserRow>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <select
                  aria-label="Filtrar por perfil"
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value as UserRole | "")}
                  className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-700"
                >
                  <option value="">Todos os perfis</option>
                  <option value="STUDENT">Alunos</option>
                  <option value="PROFESSOR">Professores</option>
                  <option value="ADMIN">Administração</option>
                </select>
                <select
                  aria-label="Filtrar por status"
                  value={activeFilter}
                  onChange={(event) => setActiveFilter(event.target.value as "" | "true" | "false")}
                  className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-700"
                >
                  <option value="">Todos os status</option>
                  <option value="true">Ativos</option>
                  <option value="false">Inativos</option>
                </select>
              </div>

              {isLoading ? (
                <p className="py-6 text-center text-xs text-slate-400">Carregando...</p>
              ) : users.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-500">
                  Nenhum usuário encontrado para os filtros selecionados.
                </p>
              ) : (
                <ul className="space-y-2">
                  {users.map((target) => (
                    <UserRow key={target.id} user={target}>
                      <button
                        type="button"
                        disabled={target.id === currentUser?.id}
                        onClick={() => void handleToggleStatus(target)}
                        className={cn(
                          "shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition",
                          target.id === currentUser?.id
                            ? "cursor-not-allowed bg-slate-100 text-slate-400"
                            : target.isActive
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                        )}
                      >
                        {target.isActive ? "Desativar" : "Ativar"}
                      </button>
                    </UserRow>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "create-admin" && (
            <form onSubmit={handleCreateAdmin} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-xs font-bold text-slate-700">
                  Nome
                  <input
                    type="text"
                    required
                    minLength={3}
                    value={newAdmin.name}
                    onChange={(event) => setNewAdmin({ ...newAdmin, name: event.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-medium text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </label>
                <label className="block text-xs font-bold text-slate-700">
                  E-mail
                  <input
                    type="email"
                    required
                    value={newAdmin.email}
                    onChange={(event) => setNewAdmin({ ...newAdmin, email: event.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-medium text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </label>
                <label className="block text-xs font-bold text-slate-700">
                  Código funcional
                  <input
                    type="text"
                    required
                    minLength={3}
                    value={newAdmin.employeeCode}
                    onChange={(event) =>
                      setNewAdmin({ ...newAdmin, employeeCode: event.target.value })
                    }
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-medium text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </label>
                <label className="block text-xs font-bold text-slate-700">
                  Setor
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={newAdmin.sector}
                    onChange={(event) => setNewAdmin({ ...newAdmin, sector: event.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-medium text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </label>
                <label className="block text-xs font-bold text-slate-700">
                  Senha provisória
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newAdmin.password}
                    onChange={(event) => setNewAdmin({ ...newAdmin, password: event.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-medium text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                  />
                </label>
                <label className="block text-xs font-bold text-slate-700">
                  Nível de acesso
                  <select
                    value={newAdmin.accessLevel}
                    onChange={(event) =>
                      setNewAdmin({
                        ...newAdmin,
                        accessLevel: event.target.value as AdminAccessLevel,
                      })
                    }
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs font-medium text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none"
                  >
                    <option value="COORDINATOR">Coordenação</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </label>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-4">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreating ? "Criando..." : "Criar administrador"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
