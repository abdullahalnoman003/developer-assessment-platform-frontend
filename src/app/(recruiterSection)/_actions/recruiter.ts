"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/dashboard-session";
import { toOptionList } from "@/lib/format";
import { ACTION_MESSAGES, VALIDATION_MESSAGES } from "@/lib/messages";
import { safeExternalUrl } from "@/lib/redirect";
import type { ActionState, JsonValue } from "@/lib/types";
import {
  assessmentDetailsSchema,
  assessmentQuestionsSchema,
  assessmentStatusSchema,
  createAssessmentSchema,
  createQuestionSchema,
  evaluateAttemptSchema,
  initiatePaymentSchema,
  inviteSchema,
  upsertCompanySchema,
} from "@/lib/validations";
import { assessmentService } from "@/service/assessments";
import { attemptService } from "@/service/attempts";
import { companyService } from "@/service/company";
import { invitationService } from "@/service/invitations";
import { paymentService } from "@/service/payments";
import { questionService } from "@/service/questions";

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

// a blank box posts "", which the API reads as "clear this column"
function nullableField(
  formData: FormData,
  name: string,
): string | number | null | undefined {
  if (!formData.has(name)) {
    return undefined;
  }
  const value = formData.get(name);
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }
  return value;
}

// non-null Int, so a blank here means "leave it alone" and is dropped
function numericField(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }
  return value;
}

function parseJsonArray(value: FormDataEntryValue | null): unknown[] {
  if (typeof value !== "string" || value.trim() === "") {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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

function requireRecruiter() {
  return requireRole("RECRUITER");
}

export async function upsertCompanyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRecruiter();

  const parsed = upsertCompanySchema.safeParse({
    name: formData.get("name"),
    website: formData.get("website"),
    logoUrl: formData.get("logoUrl"),
  });

  if (!parsed.success) {
    return invalid(VALIDATION_MESSAGES.generic, fieldErrorsFrom(parsed.error));
  }

  if (
    parsed.data.name === undefined &&
    parsed.data.website == null &&
    parsed.data.logoUrl == null
  ) {
    return invalid("Nothing to save.", { name: ["Enter a name or a URL"] });
  }

  const res = await companyService.upsert(parsed.data);

  if (!res.success || !res.data) {
    return invalid(res.message || ACTION_MESSAGES.upsertCompany.failure, {});
  }

  revalidatePath("/dashboard/recruiter/company", "page");
  revalidatePath("/dashboard/recruiter", "page");
  revalidatePath("/dashboard/recruiter/questions", "page");
  revalidatePath("/dashboard/recruiter/assessments", "page");

  return ok(ACTION_MESSAGES.upsertCompany.success);
}

const questionIdSchema = z.object({
  questionId: z.string().trim().min(1, "Question id is required"),
});

function parseQuestionFields(formData: FormData) {
  const options = toOptionList(toRawJson(formData.get("options"))).map(
    (option) => option.trim(),
  );
  const correctAnswerRaw = toRawJson(formData.get("correctAnswer"));
  // the MCQ answer is stored as the option text, byte for byte
  const correctAnswer =
    typeof correctAnswerRaw === "string" ? correctAnswerRaw : null;
  const tags = toOptionList(toRawJson(formData.get("tags")))
    .map((tag) => tag.trim())
    .filter(Boolean);

  return { options: options.filter(Boolean), correctAnswer, tags };
}

function toRawJson(value: FormDataEntryValue | null): JsonValue | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  // a leading "[" means JSON; anything else stays a plain string
  if (trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed) as JsonValue;
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

export async function createQuestionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRecruiter();

  const type = formData.get("type");
  const fields = parseQuestionFields(formData);

  const parsed = createQuestionSchema.safeParse({
    type,
    difficulty: formData.get("difficulty"),
    title: formData.get("title"),
    body: formData.get("body"),
    options: type === "MCQ" ? fields.options : null,
    correctAnswer: fields.correctAnswer,
    tags: fields.tags,
  });

  if (!parsed.success) {
    return invalid(VALIDATION_MESSAGES.generic, fieldErrorsFrom(parsed.error));
  }

  const res = await questionService.create({
    ...parsed.data,
    options: type === "MCQ" ? fields.options : null,
    correctAnswer: fields.correctAnswer,
    tags: fields.tags,
  });

  if (!res.success || !res.data) {
    return invalid(res.message || ACTION_MESSAGES.createQuestion.failure, {});
  }

  revalidatePath("/dashboard/recruiter/questions", "page");

  return ok(ACTION_MESSAGES.createQuestion.success);
}

export async function updateQuestionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRecruiter();

  const id = questionIdSchema.safeParse({
    questionId: formData.get("questionId"),
  });
  if (!id.success) {
    return invalid(VALIDATION_MESSAGES.generic, fieldErrorsFrom(id.error));
  }

  const type = formData.get("type");
  const fields = parseQuestionFields(formData);

  const parsed = createQuestionSchema.safeParse({
    type,
    difficulty: formData.get("difficulty"),
    title: formData.get("title"),
    body: formData.get("body"),
    options: type === "MCQ" ? fields.options : null,
    correctAnswer: fields.correctAnswer,
    tags: fields.tags,
  });

  if (!parsed.success) {
    return invalid(VALIDATION_MESSAGES.generic, fieldErrorsFrom(parsed.error));
  }

  const res = await questionService.update(id.data.questionId, {
    type: parsed.data.type,
    difficulty: parsed.data.difficulty,
    title: parsed.data.title,
    body: parsed.data.body,
    options: type === "MCQ" ? fields.options : null,
    correctAnswer: fields.correctAnswer,
    tags: fields.tags,
  });

  if (!res.success || !res.data) {
    return invalid(res.message || ACTION_MESSAGES.updateQuestion.failure, {});
  }

  revalidatePath("/dashboard/recruiter/questions", "page");
  revalidatePath("/dashboard/recruiter/assessments", "page");

  return ok(ACTION_MESSAGES.updateQuestion.success);
}

export async function deleteQuestionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRecruiter();

  const parsed = questionIdSchema.safeParse({
    questionId: formData.get("questionId"),
  });
  if (!parsed.success) {
    return invalid(VALIDATION_MESSAGES.generic, fieldErrorsFrom(parsed.error));
  }

  const res = await questionService.remove(parsed.data.questionId);

  if (!res.success || !res.data) {
    return invalid(res.message || ACTION_MESSAGES.deleteQuestion.failure, {});
  }

  revalidatePath("/dashboard/recruiter/questions", "page");
  revalidatePath("/dashboard/recruiter/assessments", "page");

  return ok(ACTION_MESSAGES.deleteQuestion.success);
}

const wizardSubmitSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  description: z.string().trim().max(5000).nullable().optional(),
  durationMins: z.coerce
    .number("Enter a number of minutes")
    .int("Use whole minutes")
    .min(1, "Duration must be at least 1 minute")
    .max(600, "Duration cannot exceed 600 minutes"),
  passScore: z.coerce.number().int().min(0).max(10000).nullable().optional(),
  questionIds: z
    .array(z.string().trim().min(1))
    .min(1, "Pick at least one question")
    .max(200, "Too many questions"),
  publish: z.boolean(),
});

export async function wizardCreateAssessmentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRecruiter();

  const rawIds = toRawJson(formData.get("questionIds"));
  const parsed = wizardSubmitSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || null,
    durationMins: formData.get("durationMins"),
    passScore:
      formData.get("passScore") === "" || formData.get("passScore") === null
        ? null
        : formData.get("passScore"),
    questionIds: Array.isArray(rawIds)
      ? rawIds.filter((id): id is string => typeof id === "string")
      : [],
    publish: formData.get("publish") === "true",
  });

  if (!parsed.success) {
    return invalid(VALIDATION_MESSAGES.generic, fieldErrorsFrom(parsed.error));
  }

  const details = createAssessmentSchema.safeParse({
    title: parsed.data.title,
    description: parsed.data.description,
    durationMins: parsed.data.durationMins,
    passScore: parsed.data.passScore,
  });

  if (!details.success) {
    return invalid(VALIDATION_MESSAGES.generic, fieldErrorsFrom(details.error));
  }

  const created = await assessmentService.create(details.data);
  if (!created.success || !created.data) {
    return invalid(
      created.message || ACTION_MESSAGES.createAssessment.failure,
      {},
    );
  }

  const id = created.data.id;
  const detail = `/dashboard/recruiter/assessments/${id}`;

  const attached = await assessmentService.setQuestions(
    id,
    parsed.data.questionIds,
  );
  if (!attached.success) {
    return invalid(
      `${attached.message || ACTION_MESSAGES.updateAssessment.failure} A draft assessment was created — open it to fix the question list.`,
      {},
    );
  }

  if (!parsed.data.publish) {
    revalidatePath("/dashboard/recruiter/assessments", "page");
    revalidatePath("/dashboard/recruiter", "page");
    return ok(
      `${ACTION_MESSAGES.createAssessment.success} Add questions and publish when you are ready.`,
      detail,
    );
  }

  const published = await assessmentService.setStatus(id, "PUBLISHED");
  if (!published.success) {
    return invalid(
      `${published.message || ACTION_MESSAGES.updateAssessment.failure} The draft was created — open it to publish manually.`,
      {},
    );
  }

  revalidatePath("/dashboard/recruiter/assessments", "page");
  revalidatePath(detail, "page");
  revalidatePath("/dashboard/recruiter", "page");

  return ok(
    "Assessment published. Invite candidates when you are ready.",
    detail,
  );
}

const idSchema = z.string().trim().min(1, "Assessment id is required");

function assessmentSurfaces(id: string): string[] {
  const base = `/dashboard/recruiter/assessments/${id}`;
  return [
    base,
    `${base}/results`,
    `/dashboard/recruiter/assessments`,
    "/dashboard/recruiter",
  ];
}

export async function updateAssessmentStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRecruiter();

  const assessmentId = idSchema.safeParse(formData.get("assessmentId"));
  if (!assessmentId.success) {
    return invalid(VALIDATION_MESSAGES.generic, {
      assessmentId: ["Assessment id is required"],
    });
  }

  const parsed = assessmentStatusSchema.safeParse({
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return invalid(VALIDATION_MESSAGES.generic, fieldErrorsFrom(parsed.error));
  }

  const { status } = parsed.data;
  const res = await assessmentService.setStatus(assessmentId.data, status);

  if (!res.success) {
    return invalid(res.message || ACTION_MESSAGES.updateAssessment.failure, {});
  }

  for (const path of assessmentSurfaces(assessmentId.data)) {
    revalidatePath(path, "page");
  }

  return ok(
    status === "PUBLISHED"
      ? "Published. It can now be invited and run by candidates."
      : status === "CLOSED"
        ? "Closed. No new candidates can be invited, but grading still works."
        : "Archived. This is the final state — nothing further can be changed.",
  );
}

export async function updateAssessmentDetailsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRecruiter();

  const assessmentId = idSchema.safeParse(formData.get("assessmentId"));
  if (!assessmentId.success) {
    return invalid(VALIDATION_MESSAGES.generic, {
      assessmentId: ["Assessment id is required"],
    });
  }

  const parsed = assessmentDetailsSchema.safeParse({
    title: formData.get("title") ?? undefined,
    description: nullableField(formData, "description"),
    durationMins: numericField(formData, "durationMins"),
    passScore: nullableField(formData, "passScore"),
  });

  if (!parsed.success) {
    return invalid(VALIDATION_MESSAGES.generic, fieldErrorsFrom(parsed.error));
  }

  const res = await assessmentService.updateDetails(
    assessmentId.data,
    parsed.data,
  );

  if (!res.success) {
    return invalid(res.message || ACTION_MESSAGES.updateAssessment.failure, {});
  }

  for (const path of assessmentSurfaces(assessmentId.data)) {
    revalidatePath(path, "page");
  }

  return ok(ACTION_MESSAGES.updateAssessment.success);
}

export async function updateAssessmentQuestionsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRecruiter();

  const assessmentId = idSchema.safeParse(formData.get("assessmentId"));
  if (!assessmentId.success) {
    return invalid(VALIDATION_MESSAGES.generic, {
      assessmentId: ["Assessment id is required"],
    });
  }

  const parsed = assessmentQuestionsSchema.safeParse({
    questionIds: parseJsonArray(formData.get("questionIds")),
  });

  if (!parsed.success) {
    return invalid(VALIDATION_MESSAGES.generic, fieldErrorsFrom(parsed.error));
  }

  const res = await assessmentService.setQuestions(
    assessmentId.data,
    parsed.data.questionIds,
  );

  if (!res.success) {
    return invalid(res.message || ACTION_MESSAGES.updateAssessment.failure, {});
  }

  for (const path of assessmentSurfaces(assessmentId.data)) {
    revalidatePath(path, "page");
  }

  const count = parsed.data.questionIds.length;
  return ok(
    count === 0
      ? "Question list emptied. A draft needs at least one question before it can be published."
      : `Question list saved — ${count} question${count === 1 ? "" : "s"}, 1 point each.`,
  );
}

export async function deleteAssessmentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRecruiter();

  const assessmentId = idSchema.safeParse(formData.get("assessmentId"));
  if (!assessmentId.success) {
    return invalid(VALIDATION_MESSAGES.generic, {
      assessmentId: ["Assessment id is required"],
    });
  }

  const res = await assessmentService.remove(assessmentId.data);

  if (!res.success) {
    return invalid(res.message || ACTION_MESSAGES.deleteAssessment.failure, {});
  }

  for (const path of assessmentSurfaces(assessmentId.data)) {
    revalidatePath(path, "page");
  }
  revalidatePath("/dashboard/recruiter/assessments", "page");
  revalidatePath("/dashboard/recruiter", "page");

  return ok(
    ACTION_MESSAGES.deleteAssessment.success,
    "/dashboard/recruiter/assessments",
  );
}

export async function inviteCandidatesAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRecruiter();

  const assessmentId = idSchema.safeParse(formData.get("assessmentId"));
  if (!assessmentId.success) {
    return invalid(VALIDATION_MESSAGES.generic, {
      assessmentId: ["Assessment id is required"],
    });
  }

  const parsed = inviteSchema.safeParse({
    candidateEmails: parseJsonArray(formData.get("candidateEmails")),
  });

  if (!parsed.success) {
    return invalid(VALIDATION_MESSAGES.generic, fieldErrorsFrom(parsed.error));
  }

  const res = await invitationService.invite(assessmentId.data, {
    candidateEmails: parsed.data.candidateEmails,
  });

  if (!res.success) {
    return invalid(res.message || ACTION_MESSAGES.inviteCandidates.failure, {});
  }

  for (const path of assessmentSurfaces(assessmentId.data)) {
    revalidatePath(path, "page");
  }

  const sent = res.data?.length ?? 0;
  return ok(
    sent === 1
      ? "Invitation sent."
      : `${sent} invitations sent. They appear in the results table once each candidate starts the assessment.`,
  );
}

export async function evaluateAttemptAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRecruiter();

  const attemptId = idSchema.safeParse(formData.get("attemptId"));
  if (!attemptId.success) {
    return invalid(VALIDATION_MESSAGES.generic, {
      attemptId: ["Attempt id is required"],
    });
  }

  const parsed = evaluateAttemptSchema.safeParse({
    scores: parseJsonArray(formData.get("scores")).map((entry) =>
      entry && typeof entry === "object"
        ? {
            answerId: (entry as Record<string, JsonValue>).answerId,
            points: (entry as Record<string, JsonValue>).points,
          }
        : entry,
    ),
    releaseResult: formData.get("releaseResult") === "on",
  });

  if (!parsed.success) {
    return invalid(VALIDATION_MESSAGES.generic, fieldErrorsFrom(parsed.error));
  }

  const res = await attemptService.evaluate(attemptId.data, {
    scores: parsed.data.scores,
    releaseResult: parsed.data.releaseResult,
  });

  if (!res.success || !res.data) {
    return invalid(res.message || ACTION_MESSAGES.evaluateAttempt.failure, {});
  }

  for (const path of assessmentSurfaces(res.data.invitation.assessment.id)) {
    revalidatePath(path, "page");
  }

  return ok(
    `${ACTION_MESSAGES.evaluateAttempt.success} ${
      res.data.resultReleased
        ? "Results released — the candidate can see the score now."
        : "Results stay private. Releasing is a one-shot action, so this cannot be changed later."
    }`,
  );
}

export async function initiatePaymentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRecruiter();

  const parsed = initiatePaymentSchema.safeParse({
    plan: formData.get("plan"),
  });

  if (!parsed.success) {
    return invalid(VALIDATION_MESSAGES.generic, fieldErrorsFrom(parsed.error));
  }

  const res = await paymentService.initiate({ plan: parsed.data.plan });

  if (!res.success || !res.data?.checkoutUrl) {
    return invalid(res.message || ACTION_MESSAGES.initiatePayment.failure, {});
  }

  const checkoutUrl = safeExternalUrl(res.data.checkoutUrl);
  if (!checkoutUrl) {
    return invalid(VALIDATION_MESSAGES.unknown, {});
  }

  return {
    ...ok(ACTION_MESSAGES.initiatePayment.success),
    externalUrl: checkoutUrl,
  };
}
