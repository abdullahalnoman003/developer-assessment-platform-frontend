import { api, buildQuery } from "@/lib/api";
import type { ApiResponse, Paginated, Question } from "@/lib/types";

export interface QuestionFilters {
  q?: string;
  type?: "MCQ" | "WRITTEN" | "CODING";
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  page?: number;
  limit?: number;
}

export const questionService = {
  list: (
    filters: QuestionFilters = {},
  ): Promise<ApiResponse<Paginated<Question>>> =>
    api(`/questions${buildQuery(filters)}`, { tags: ["questions"] }),

  create: (payload: unknown): Promise<ApiResponse<Question>> =>
    api("/questions", { method: "POST", body: payload }),

  update: (id: string, payload: unknown): Promise<ApiResponse<Question>> =>
    api(`/questions/${id}`, { method: "PATCH", body: payload }),

  /** The backend performs a soft delete when `deletedAt: "now"` is sent. */
  remove: (id: string): Promise<ApiResponse<Question>> =>
    api(`/questions/${id}`, { method: "PATCH", body: { deletedAt: "now" } }),
};
