import { api, buildQuery } from "@/lib/api";
import type { ApiResponse, Paginated, Question } from "@/lib/types";
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
} from "@/lib/validations";

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

  create: (payload: CreateQuestionInput): Promise<ApiResponse<Question>> =>
    api("/questions", { method: "POST", body: payload }),

  update: (
    id: string,
    payload: UpdateQuestionInput,
  ): Promise<ApiResponse<Question>> =>
    api(`/questions/${id}`, { method: "PATCH", body: payload }),

  remove: (id: string): Promise<ApiResponse<Question>> =>
    api(`/questions/${id}`, { method: "PATCH", body: { deletedAt: "now" } }),
};
