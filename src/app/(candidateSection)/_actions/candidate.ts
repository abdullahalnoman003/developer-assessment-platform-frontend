"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/dashboard-session";
import { ACTION_MESSAGES, VALIDATION_MESSAGES } from "@/lib/messages";
import type { ActionState } from "@/lib/types";
import { respondInvitationSchema, saveAnswersSchema } from "@/lib/validations";
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

function requireCandidate() {
  return requireRole("CANDIDATE");
}

const idSchema = z.string().trim().min(1, "Invitation id is required");

function candidateSurfaces(): string[] {
  return [
    "/dashboard/candidate",
    "/dashboard/candidate/invitations",
    "/dashboard/candidate/results",
  ];
}

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
      ? "Invitation accepted. Starting the assessment…"
      : "Invitation declined. The recruiter is not told, and it stays on your list as declined.",
    parsed.data.status === "ACCEPTED"
      ? "/dashboard/candidate/invitations"
      : null,
  );
}

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

export async function saveAnswersAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireCandidate();

  const attemptId = formData.get("attemptId")?.toString() ?? "";
  const parsedId = idSchema.safeParse(attemptId);
  if (!parsedId.success) {
    return invalid(VALIDATION_MESSAGES.generic, {
      attemptId: ["Attempt id is required"],
    });
  }

  const raw = formData.get("answers")?.toString() ?? "[]";
  let answers: unknown;
  try {
    answers = JSON.parse(raw);
  } catch {
    return invalid(VALIDATION_MESSAGES.generic, {});
  }

  const parsed = saveAnswersSchema.safeParse({ answers });
  if (!parsed.success) {
    return invalid(VALIDATION_MESSAGES.generic, fieldErrorsFrom(parsed.error));
  }

  const res = await attemptService.save(parsedId.data, parsed.data.answers);

  if (!res.success) {
    return invalid(res.message || ACTION_MESSAGES.saveAnswers.failure, {});
  }

  return ok(ACTION_MESSAGES.saveAnswers.success);
}

export async function submitAttemptAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireCandidate();

  const attemptId = formData.get("attemptId")?.toString() ?? "";
  const parsedId = idSchema.safeParse(attemptId);
  if (!parsedId.success) {
    return invalid(VALIDATION_MESSAGES.generic, {
      attemptId: ["Attempt id is required"],
    });
  }

  const res = await attemptService.submit(parsedId.data);

  if (!res.success) {
    const expired = /attempt has expired/i.test(res.message ?? "");
    if (expired) {
      return ok(
        ACTION_MESSAGES.submitAttempt.failure,
        `/dashboard/candidate/attempts/${parsedId.data}/result`,
      );
    }
    return invalid(res.message || ACTION_MESSAGES.submitAttempt.failure, {});
  }

  return ok(
    ACTION_MESSAGES.submitAttempt.success,
    `/dashboard/candidate/attempts/${parsedId.data}/result`,
  );
}
