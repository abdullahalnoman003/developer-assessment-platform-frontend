import { api } from "@/lib/api";
import type { ApiResponse, Company, CompanyDashboard } from "@/lib/types";
import type { UpsertCompanyInput } from "@/lib/validations";

export const companyService = {
  get: (): Promise<ApiResponse<Company>> => api("/companies/me"),

  upsert: (payload: UpsertCompanyInput): Promise<ApiResponse<Company>> =>
    api("/companies/me", { method: "PUT", body: payload }),

  dashboard: (): Promise<ApiResponse<CompanyDashboard>> =>
    api("/companies/me/dashboard"),
};
