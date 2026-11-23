export type AuthRole = "student" | "admin";

export type AuthScreenStep = "select-role" | "student-login" | "admin-login";

export interface StudentLoginCredentials {
  readonly identifier: string;
  readonly password: string;
  readonly rememberMe: boolean;
}

export interface AuthSession {
  readonly role: AuthRole;
  readonly identifier: string;
  readonly studentName: string;
  readonly studentInitials: string;
  readonly authenticatedAt: string;
}
