import { api, buildQuery } from "@/lib/api";
import type {
  ApiResponse,
  AssessmentDetail,
  AssessmentListItem,
  Paginated,
  ResultRow,
} from "@/lib/types";

export interface AssessmentFilters {
  status?: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  sortBy?: "createdAt" | "title";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const assessmentService = {
  list: (
    filters: AssessmentFilters = {},
  ): Promise<ApiResponse<Paginated<AssessmentListItem>>> =>
    api(`/assessments${buildQuery(filters)}`, { tags: ["assessments"] }),

  create: (payload: unknown): Promise<ApiResponse<AssessmentListItem>> =>
    api("/assessments", { method: "POST", body: payload }),

  detail: (id: string): Promise<ApiResponse<AssessmentDetail>> =>
    api(`/assessments/${id}`, { tags: [`assessment:${id}`] }),

  /** The backend accepts only one variant per call. */
  setStatus: (
    id: string,
    status: "PUBLISHED" | "CLOSED" | "ARCHIVED",
  ): Promise<ApiResponse<AssessmentDetail>> =>
    api(`/assessments/${id}`, { method: "PATCH", body: { status } }),

  setQuestions: (
    id: string,
    questionIds: string[],
  ): Promise<ApiResponse<AssessmentDetail>> =>
    api(`/assessments/${id}`, { method: "PATCH", body: { questionIds } }),

  updateDetails: (
    id: string,
    payload: {
      title?: string;
      description?: string | null;
      durationMins?: number;
      passScore?: number | null;
    },
  ): Promise<ApiResponse<AssessmentDetail>> =>
    api(`/assessments/${id}`, { method: "PATCH", body: payload }),

  remove: (id: string): Promise<ApiResponse<AssessmentDetail>> =>
    api(`/assessments/${id}`, { method: "PATCH", body: { deletedAt: "now" } }),

  results: (
    id: string,
    page = 1,
    limit = 10,
  ): Promise<ApiResponse<Paginated<ResultRow>>> =>
    api(`/assessments/${id}/results${buildQuery({ page, limit })}`, {
      tags: [`assessment:${id}`, "results"],
    }),
};
