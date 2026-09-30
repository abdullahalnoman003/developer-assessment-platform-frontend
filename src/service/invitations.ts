import { api, buildQuery } from "@/lib/api";
import type {
  ApiResponse,
  Invitation,
  InvitationWithAssessment,
  InvitationWithCandidate,
  Paginated,
} from "@/lib/types";
import type { InviteInput, RespondInvitationInput } from "@/lib/validations";

export interface InvitationFilters {
  status?: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  page?: number;
  limit?: number;
}

export const invitationService = {
  invite: (
    assessmentId: string,
    payload: InviteInput,
  ): Promise<ApiResponse<InvitationWithCandidate[]>> =>
    api(`/assessments/${assessmentId}/invitations`, {
      method: "POST",
      body: payload,
    }),

  listForCandidate: (
    filters: InvitationFilters = {},
  ): Promise<ApiResponse<Paginated<InvitationWithAssessment>>> =>
    api(`/invitations/me${buildQuery(filters)}`, { tags: ["my-invitations"] }),

  respond: (
    id: string,
    payload: RespondInvitationInput,
  ): Promise<ApiResponse<Invitation>> =>
    api(`/invitations/${id}`, { method: "PATCH", body: payload }),

  revoke: (id: string): Promise<ApiResponse<Invitation>> =>
    api(`/invitations/${id}`, {
      method: "PATCH",
      body: { status: "DECLINED" },
    }),
};
