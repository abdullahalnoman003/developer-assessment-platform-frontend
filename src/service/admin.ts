import { api, buildQuery } from "@/lib/api";
import type {
  AdminStats,
  AdminUser,
  ApiResponse,
  AuditLog,
  Paginated,
} from "@/lib/types";

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
    payload: { status?: "ACTIVE" | "SUSPENDED"; deletedAt?: "now" },
  ): Promise<ApiResponse<AdminUser>> =>
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
