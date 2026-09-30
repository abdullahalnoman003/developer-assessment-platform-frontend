import { api, buildQuery } from "@/lib/api";
import type {
  AdminStats,
  AdminUser,
  AdminUserPatch,
  ApiResponse,
  AuditLog,
  Paginated,
} from "@/lib/types";
import type { UpdateUserStatusInput } from "@/lib/validations";

export interface AdminUserFilters {
  q?: string;
  role?: "CANDIDATE" | "RECRUITER" | "ADMIN";
  status?: "ACTIVE" | "SUSPENDED";
  page?: number;
  limit?: number;
}

export const adminService = {
  users: (
    filters: AdminUserFilters = {},
  ): Promise<ApiResponse<Paginated<AdminUser>>> =>
    api(`/admin/users${buildQuery(filters)}`, { tags: ["admin:users"] }),

  updateUser: (
    id: string,
    payload: UpdateUserStatusInput,
  ): Promise<ApiResponse<AdminUserPatch>> =>
    api(`/admin/users/${id}`, { method: "PATCH", body: payload }),

  stats: (): Promise<ApiResponse<AdminStats>> =>
    api("/admin/stats", { tags: ["admin:stats"] }),

  auditLogs: (
    filters: {
      entity?: string;
      action?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<ApiResponse<Paginated<AuditLog>>> =>
    api(`/admin/audit-logs${buildQuery(filters)}`, {
      tags: ["admin:audit-logs"],
    }),
};
