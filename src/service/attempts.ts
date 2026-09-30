import { api } from "@/lib/api";
import type {
  Answer,
  ApiResponse,
  AttemptDetail,
  AttemptStatus,
  StartedAttempt,
} from "@/lib/types";

export interface StartResult {
  attempt: StartedAttempt;
  savedAnswers: Answer[];
}

export const attemptService = {
  /** Candidate starts (or resumes) the attempt for an accepted invitation. */
  start: (invitationId: string): Promise<ApiResponse<StartResult>> =>
    api(`/invitations/${invitationId}/start`, { method: "POST", body: {} }),

  detail: (id: string): Promise<ApiResponse<AttemptDetail>> =>
    api(`/attempts/${id}`, { tags: [`attempt:${id}`] }),

  /** Autosave — sends only the answers that changed. */
  save: (
    id: string,
    answers: { questionId: string; response: unknown }[],
  ): Promise<ApiResponse<AttemptDetail>> =>
    api(`/attempts/${id}`, { method: "PATCH", body: { answers } }),

  submit: (id: string): Promise<ApiResponse<AttemptDetail>> =>
    api(`/attempts/${id}`, {
      method: "PATCH",
      body: { status: "SUBMITTED" satisfies AttemptStatus },
    }),

  /** Recruiter scores the written/coding answers; `releaseResult` is optional. */
  evaluate: (
    id: string,
    scores: { answerId: string; points: number }[],
    releaseResult?: boolean,
  ): Promise<ApiResponse<AttemptDetail>> =>
    api(`/attempts/${id}/evaluate`, {
      method: "POST",
      body: {
        scores,
        ...(releaseResult === undefined ? {} : { releaseResult }),
      },
    }),
};
