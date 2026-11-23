import type { AdminAccessLevel, AppUser, UserRole } from "../types/user";
import { apiRequest, normalizeUser, type RawUser } from "./auth.service";

export interface CreateAdminPayload {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly employeeCode: string;
  readonly sector: string;
  readonly accessLevel: AdminAccessLevel;
}

export interface ListUsersFilters {
  readonly role?: UserRole;
  readonly isActive?: boolean;
  readonly pendingProfessors?: boolean;
}

export interface AdminProfileSummary {
  readonly id: string;
  readonly userId: string;
  readonly isVerified: boolean;
}

export interface UserStatusSummary {
  readonly id: string;
  readonly isActive: boolean;
}

export const adminService = {
  async createAdmin(payload: CreateAdminPayload): Promise<AppUser> {
    const response = await apiRequest<{ user: RawUser }>("/admin/users/admin", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeUser(response.user);
  },

  async listUsers(filters: ListUsersFilters = {}): Promise<AppUser[]> {
    const params = new URLSearchParams();
    if (filters.role) params.set("role", filters.role);
    if (filters.isActive !== undefined) params.set("isActive", String(filters.isActive));
    if (filters.pendingProfessors !== undefined) {
      params.set("pendingProfessors", String(filters.pendingProfessors));
    }

    const query = params.toString();
    const response = await apiRequest<{ users: RawUser[] }>(
      `/admin/users${query ? `?${query}` : ""}`,
    );
    return response.users.map(normalizeUser);
  },

  async verifyProfessor(profileId: string): Promise<AdminProfileSummary> {
    const response = await apiRequest<{ profile: AdminProfileSummary }>(
      `/admin/professors/${encodeURIComponent(profileId)}/verify`,
      { method: "PATCH" },
    );
    return response.profile;
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<UserStatusSummary> {
    const response = await apiRequest<{ user: UserStatusSummary }>(
      `/admin/users/${encodeURIComponent(userId)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      },
    );
    return response.user;
  },
};
