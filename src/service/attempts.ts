import { api } from "@/lib/api";
import type {
  ApiResponse,
  AttemptDetail,
  EvaluatedAttempt,
  SavedAttempt,
  StartedAttempt,
} from "@/lib/types";
import type { EvaluateAttemptInput, SaveAnswersInput } from "@/lib/validations";

export const attemptService = {
  start: (invitationId: string): Promise<ApiResponse<StartedAttempt>> =>
    api(`/invitations/${invitationId}/start`, { method: "POST", body: {} }),

  detail: (id: string): Promise<ApiResponse<AttemptDetail>> =>
    api(`/attempts/${id}`, { tags: [`attempt:${id}`] }),

  save: (
    id: string,
    answers: SaveAnswersInput["answers"],
  ): Promise<ApiResponse<SavedAttempt>> =>
    api(`/attempts/${id}`, { method: "PATCH", body: { answers } }),

  submit: (id: string): Promise<ApiResponse<SavedAttempt>> =>
    api(`/attempts/${id}`, { method: "PATCH", body: { status: "SUBMITTED" } }),

  evaluate: (
    id: string,
    payload: EvaluateAttemptInput,
  ): Promise<ApiResponse<EvaluatedAttempt>> =>
    api(`/attempts/${id}/evaluate`, { method: "POST", body: payload }),
};
