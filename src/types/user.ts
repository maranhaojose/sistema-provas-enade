export type UserRole = "STUDENT" | "PROFESSOR" | "ADMIN";
export type AdminAccessLevel = "COORDINATOR" | "SUPER_ADMIN";

export interface BaseUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly initials: string;
  readonly role: UserRole;
  readonly isActive: boolean;
}

export interface StudentUserProfile extends BaseUser {
  readonly role: "STUDENT";
  readonly registration: string;
  readonly course: string;
  readonly semester?: number;
  readonly weeklyGoalTarget: number;
  readonly showTimerInExam: boolean;
  readonly instantFeedback: boolean;
}

export interface ProfessorUserProfile extends BaseUser {
  readonly role: "PROFESSOR";
  readonly institutionalId: string;
  readonly department: string;
  readonly academicTitle?: string;
  readonly specializationAreas: readonly string[];
  readonly isVerified: boolean;
}

export interface AdminUserProfile extends BaseUser {
  readonly role: "ADMIN";
  readonly employeeCode: string;
  readonly sector: string;
  readonly accessLevel: AdminAccessLevel;
}

export type AppUser =
  | StudentUserProfile
  | ProfessorUserProfile
  | AdminUserProfile;
