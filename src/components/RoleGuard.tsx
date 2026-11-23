import type { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { UserRole } from "../types/user";

interface RoleGuardProps {
  readonly allowedRoles: readonly UserRole[];
  readonly requireVerifiedProfessor?: boolean;
  readonly fallback?: ReactNode;
  readonly children: ReactNode;
}

export function RoleGuard({
  allowedRoles,
  requireVerifiedProfessor = false,
  fallback = null,
  children,
}: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  if (
    requireVerifiedProfessor &&
    user.role === "PROFESSOR" &&
    !user.isVerified
  ) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
