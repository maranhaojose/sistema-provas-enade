import type { AppUser } from "../types/user";

const TOKEN_STORAGE_KEY = "simula_enade_token";
const DEFAULT_API_BASE_URL = "http://localhost:3333/api";

function resolveApiBaseUrl(): string {
  const envUrl =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env.VITE_API_URL as string | undefined)
      : undefined;
  const rawUrl = envUrl?.trim() || DEFAULT_API_BASE_URL;
  return rawUrl.replace(/\/+$/, "");
}

export const API_BASE_URL = resolveApiBaseUrl();

export interface RegisterStudentPayload {
  name: string;
  email: string;
  password: string;
  registration: string;
  course: string;
  semester?: number;
}

export interface RegisterProfessorPayload {
  name: string;
  email: string;
  password: string;
  institutionalId: string;
  department: string;
  academicTitle?: string;
  specializationAreas: string[];
}

interface Session {
  token: string;
  user: AppUser;
}

interface AuthResponse {
  token: string;
  user: RawUser;
}

export interface RawUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  profileId?: string;
  role: AppUser["role"];
  isActive: boolean;
  registration?: string;
  course?: string;
  semester?: number | null;
  weeklyGoalTarget?: number;
  showTimerInExam?: boolean;
  instantFeedback?: boolean;
  institutionalId?: string;
  department?: string;
  academicTitle?: string | null;
  specializationAreas?: string[];
  isVerified?: boolean;
  employeeCode?: string;
  sector?: string;
  accessLevel?: "COORDINATOR" | "SUPER_ADMIN";
}

export class AuthError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "AuthError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function normalizeUser(raw: RawUser): AppUser {
  const base = {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    initials: raw.initials,
    isActive: raw.isActive,
    profileId: raw.profileId ?? "",
  };

  switch (raw.role) {
    case "STUDENT":
      return {
        ...base,
        role: "STUDENT",
        registration: raw.registration ?? "",
        course: raw.course ?? "",
        semester: raw.semester ?? undefined,
        weeklyGoalTarget: raw.weeklyGoalTarget ?? 20,
        showTimerInExam: raw.showTimerInExam ?? true,
        instantFeedback: raw.instantFeedback ?? true,
      };
    case "PROFESSOR":
      return {
        ...base,
        role: "PROFESSOR",
        institutionalId: raw.institutionalId ?? "",
        department: raw.department ?? "",
        academicTitle: raw.academicTitle ?? undefined,
        specializationAreas: raw.specializationAreas ?? [],
        isVerified: raw.isVerified ?? false,
      };
    case "ADMIN":
      return {
        ...base,
        role: "ADMIN",
        employeeCode: raw.employeeCode ?? "",
        sector: raw.sector ?? "",
        accessLevel: raw.accessLevel ?? "COORDINATOR",
      };
  }
}

function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Sessão permanece válida apenas enquanto a aba estiver aberta.
  }
}

function extractFieldErrors(payload: unknown): Record<string, string[]> | undefined {
  if (
    payload &&
    typeof payload === "object" &&
    "details" in payload &&
    payload.details &&
    typeof payload.details === "object" &&
    "fieldErrors" in payload.details &&
    payload.details.fieldErrors &&
    typeof payload.details.fieldErrors === "object"
  ) {
    return payload.details.fieldErrors as Record<string, string[]>;
  }
  return undefined;
}

function getFallbackHttpErrorMessage(status: number): string {
  if (status === 401) return "Sessão expirada ou credenciais inválidas.";
  if (status === 403) return "Você não tem permissão para realizar esta ação.";
  if (status >= 500) return "Erro interno no servidor. Tente novamente em instantes.";
  return "Não foi possível completar a solicitação.";
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new AuthError(
      "Não foi possível conectar ao servidor. Verifique se a API está em execução e tente novamente.",
      0,
    );
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message: unknown }).message)
        : getFallbackHttpErrorMessage(response.status);
    throw new AuthError(message, response.status, extractFieldErrors(payload));
  }

  return payload as T;
}

function saveSession(response: AuthResponse): Session {
  if (!response?.token || !response?.user) {
    throw new AuthError("Resposta de autenticação inválida recebida do servidor.", 500);
  }
  storeToken(response.token);
  return { token: response.token, user: normalizeUser(response.user) };
}

export const authService = {
  hasToken: () => Boolean(getToken()),

  readToken: getToken,

  clearToken(): void {
    try {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // Ignore storage access errors
    }
  },

  async login(email: string, password: string): Promise<Session> {
    const response = await apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return saveSession(response);
  },

  async registerStudent(payload: RegisterStudentPayload): Promise<Session> {
    const response = await apiRequest<AuthResponse>("/auth/register/student", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return saveSession(response);
  },

  async registerProfessor(payload: RegisterProfessorPayload): Promise<Session> {
    const response = await apiRequest<AuthResponse>("/auth/register/professor", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return saveSession(response);
  },

  async getMe(): Promise<AppUser> {
    const response = await apiRequest<{ user: RawUser }>("/auth/me");
    return normalizeUser(response.user);
  },
};
