import type { AppUser } from "../types/user";
import { apiRequest, normalizeUser, type RawUser } from "./auth.service";

export interface UpdateStudentProfilePayload {
  readonly name?: string;
  readonly course?: string;
  readonly semester?: number | null;
  readonly weeklyGoalTarget?: number;
  readonly showTimerInExam?: boolean;
  readonly instantFeedback?: boolean;
}

export interface UpdateProfessorProfilePayload {
  readonly name?: string;
  readonly department?: string;
  readonly academicTitle?: string | null;
  readonly specializationAreas?: readonly string[];
}

export interface UpdateAdminProfilePayload {
  readonly name?: string;
  readonly sector?: string;
}

async function patchProfile(path: string, payload: object): Promise<AppUser> {
  const response = await apiRequest<{ user: RawUser }>(path, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return normalizeUser(response.user);
}

export const profileService = {
  updateStudentProfile(payload: UpdateStudentProfilePayload): Promise<AppUser> {
    return patchProfile("/profiles/student/me", payload);
  },

  updateProfessorProfile(payload: UpdateProfessorProfilePayload): Promise<AppUser> {
    return patchProfile("/profiles/professor/me", payload);
  },

  updateAdminProfile(payload: UpdateAdminProfilePayload): Promise<AppUser> {
    return patchProfile("/profiles/admin/me", payload);
  },
};
