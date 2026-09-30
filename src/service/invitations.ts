import { api, buildQuery } from "@/lib/api";
import type {
  ApiResponse,
  Invitation,
  InvitationWithAssessment,
  InvitationWithCandidate,
  Paginated,
} from "@/lib/types";

export interface InvitationFilters {
  status?: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  page?: number;
  limit?: number;
}

export const invitationService = {
  /** Recruiter: invite one or more candidate emails to a published assessment. */
  invite: (
    assessmentId: string,
    candidateEmails: string[],
  ): Promise<ApiResponse<Invitation[]>> =>
    api(`/assessments/${assessmentId}/invitations`, {
      method: "POST",
      body: { candidateEmails },
    }),

  /** Recruiter: the invite list for one of their assessments. */
  listForAssessment: (
    assessmentId: string,
    filters: InvitationFilters = {},
  ): Promise<ApiResponse<Paginated<InvitationWithCandidate>>> =>
    api(`/assessments/${assessmentId}/invitations${buildQuery(filters)}`, {
      tags: [`invitations:${assessmentId}`],
    }),

  /** Candidate: invitations addressed to the signed-in candidate. */
  listForCandidate: (
    filters: InvitationFilters = {},
  ): Promise<ApiResponse<InvitationWithAssessment[]>> =>
    api(`/invitations/me${buildQuery(filters)}`, { tags: ["my-invitations"] }),

  /** Candidate accepts/declines; recruiter revokes with `"REVOKED"`. */
  respond: (
    id: string,
    status: "ACCEPTED" | "DECLINED" | "REVOKED",
  ): Promise<ApiResponse<Invitation>> =>
    api(`/invitations/${id}`, { method: "PATCH", body: { status } }),
};
