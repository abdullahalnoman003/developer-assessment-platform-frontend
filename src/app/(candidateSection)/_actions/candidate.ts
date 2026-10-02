"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/dashboard-session";
import { ACTION_MESSAGES, VALIDATION_MESSAGES } from "@/lib/messages";
import type { ActionState } from "@/lib/types";
import { respondInvitationSchema } from "@/lib/validations";
import { attemptService } from "@/service/attempts";
import { invitationService } from "@/service/invitations";

function invalid(
  message: string,
  fieldErrors: Record<string, string[]>,
): ActionState {
  return {
    status: "error",
    message,
    fieldErrors,
    redirectTo: null,
    externalUrl: null,
  };
}

function ok(message: string, redirectTo: string | null = null): ActionState {
  return {
    status: "success",
    message,
    fieldErrors: {},
    redirectTo,
    externalUrl: null,
  };
}

function fieldErrorsFrom(error: z.ZodError): Record<string, string[]> {
  return Object.fromEntries(
    error.issues.map((issue) => {
      const key =
        issue.path.length > 0
          ? issue.path.map((part) => String(part)).join(".")
          : "form";
      return [key, [issue.message]];
    }),
  );
}

/**
 * Every mutation re-checks the role server-side. `requireRole` is the same
 * helper the candidate layout uses, so an action gate can never drift from the
 * page gate (AGENTS.md rule 7).
 */
function requireCandidate() {
  return requireRole("CANDIDATE");
}

const idSchema = z.string().trim().min(1, "Invitation id is required");

/**
 * The three candidate surfaces an invitation or attempt can appear on. Written
 * out rather than using `revalidatePath("/dashboard/candidate", "layout")`
 * because the attempt pages are dynamic segments: a layout revalidation would
 * also throw away the candidate section's shell on every accept/decline.
 */
function candidateSurfaces(): string[] {
  return [
    "/dashboard/candidate",
    "/dashboard/candidate/invitations",
    "/dashboard/candidate/results",
  ];
}

/* -------------------------------------------------------------------------- */
/* Invitations                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * `PATCH /invitations/:id` accepts exactly `ACCEPTED | DECLINED` (§1.1 H4) and
 * only while the invitation is still `PENDING` — anything else is the backend's
 * `400 "This invitation is no longer pending"`, which is surfaced verbatim.
 */
export async function respondInvitationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireCandidate();

  const invitationId = idSchema.safeParse(formData.get("invitationId"));
  if (!invitationId.success) {
    return invalid(VALIDATION_MESSAGES.generic, {
      invitationId: ["Invitation id is required"],
    });
  }

  const parsed = respondInvitationSchema.safeParse({
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return invalid(VALIDATION_MESSAGES.generic, fieldErrorsFrom(parsed.error));
  }

  const res = await invitationService.respond(invitationId.data, {
    status: parsed.data.status,
  });

  if (!res.success) {
    return invalid(
      res.message || ACTION_MESSAGES.respondInvitation.failure,
      {},
    );
  }

  for (const path of candidateSurfaces()) {
    revalidatePath(path, "page");
  }

  return ok(
    parsed.data.status === "ACCEPTED"
      ? "Invitation accepted. Open it again to start the assessment."
      : "Invitation declined. The recruiter is not told, and it stays on your list as declined.",
  );
}

/* -------------------------------------------------------------------------- */
/* Attempts                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * `POST /invitations/:id/start` is the only way to create an attempt. It is
 * **not** idempotent: calling it twice for the same invitation answers
 * `400 "An attempt already exists for this invitation"` (§1.1 H6), which is why
 * resuming is a link to `GET /attempts/:id` and never a second start.
 *
 * On success the browser is sent to the attempt runner, which re-reads the
 * attempt from the API — so the page can never show a stale attempt id.
 */
export async function startAttemptAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireCandidate();

  const invitationId = idSchema.safeParse(formData.get("invitationId"));
  if (!invitationId.success) {
    return invalid(VALIDATION_MESSAGES.generic, {
      invitationId: ["Invitation id is required"],
    });
  }

  const res = await attemptService.start(invitationId.data);

  if (!res.success || !res.data) {
    return invalid(res.message || ACTION_MESSAGES.startAttempt.failure, {});
  }

  for (const path of candidateSurfaces()) {
    revalidatePath(path, "page");
  }

  return ok(
    ACTION_MESSAGES.startAttempt.success,
    `/dashboard/candidate/attempts/${res.data.id}`,
  );
}
