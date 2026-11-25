import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppUser } from "../types/user";
import {
  authService,
  type RegisterProfessorPayload,
  type RegisterStudentPayload,
} from "../services/auth.service";

interface AuthContextValue {
  readonly user: AppUser | null;
  readonly token: string | null;
  readonly isAuthenticated: boolean;
  readonly isInitializing: boolean;
  readonly isLoading: boolean;
  readonly error: string | null;
  login: (email: string, password: string) => Promise<void>;
  registerStudent: (payload: RegisterStudentPayload) => Promise<void>;
  registerProfessor: (payload: RegisterProfessorPayload) => Promise<void>;
  updateUser: (user: AppUser) => void;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Erro inesperado. Tente novamente.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!authService.hasToken()) {
        setIsInitializing(false);
        return;
      }

      try {
        const currentUser = await authService.getMe();
        if (cancelled) return;
        setUser(currentUser);
        setToken(authService.readToken());
      } catch {
        authService.clearToken();
        if (!cancelled) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    }

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const session = await authService.login(email, password);
      setUser(session.user);
      setToken(session.token);
    } catch (error) {
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerStudent = useCallback(async (payload: RegisterStudentPayload) => {
    setError(null);
    setIsLoading(true);
    try {
      const session = await authService.registerStudent(payload);
      setUser(session.user);
      setToken(session.token);
    } catch (error) {
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerProfessor = useCallback(async (payload: RegisterProfessorPayload) => {
    setError(null);
    setIsLoading(true);
    try {
      const session = await authService.registerProfessor(payload);
      setUser(session.user);
      setToken(session.token);
    } catch (error) {
      setError(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((nextUser: AppUser) => {
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    authService.clearToken();
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user),
      isInitializing,
      isLoading,
      error,
      login,
      registerStudent,
      registerProfessor,
      updateUser,
      logout,
      clearError,
    }),
    [
      user,
      token,
      isInitializing,
      isLoading,
      error,
      login,
      registerStudent,
      registerProfessor,
      updateUser,
      logout,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return context;
}
