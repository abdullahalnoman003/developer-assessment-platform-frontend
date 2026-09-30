import { api } from "@/lib/api";
import type { ApiResponse, Company, CompanyDashboard } from "@/lib/types";

export const companyService = {
  get: (): Promise<ApiResponse<Company>> => api("/companies/me"),

  upsert: (payload: unknown): Promise<ApiResponse<Company>> =>
    api("/companies/me", { method: "PUT", body: payload }),

  dashboard: (): Promise<ApiResponse<CompanyDashboard>> =>
    api("/companies/me/dashboard"),
};
