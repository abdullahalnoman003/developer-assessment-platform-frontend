"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/dashboard-session";
import { toOptionList } from "@/lib/format";
import { ACTION_MESSAGES, VALIDATION_MESSAGES } from "@/lib/messages";
import type { ActionState, JsonValue } from "@/lib/types";
import {
  assessmentDetailsSchema,
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
  return { status: "error", message, fieldErrors, redirectTo: null, externalUrl: null };
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

/**
 * An empty `<input>` posts `""`, not `undefined`, and for the two nullable
 * fields `""` is a real instruction — *clear it*. The backend stores
 * `description` and `passScore` as `String?`/`Int?`, so they are sent as `null`
 * rather than dropped, otherwise clearing the description would silently do
 * nothing.
 *
 * `durationMins` is a non-null `Int`, so a blank there can only mean "leave it
 * alone" and is dropped instead.
 */
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

function numericField(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }
  return value;
}

/**
 * React cannot post a real array through `FormData` without a stringifying step,
 * so the client components JSON-encode their list fields into a single hidden
 * input. A malformed payload yields `[]` and fails the schema with a real
 * message instead of throwing inside the action.
 */
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

/**
 * Every mutation re-checks the role server-side. `requireRole` is the same
 * helper the role layouts use, so an action gate can never drift from the page
 * gate (AGENTS.md rule 7). It throws `UnauthenticatedError` on a dead session,
 * which `proxy.ts` turns into a login redirect, and redirects a wrong-role
 * caller to their own dashboard.
 */
function requireRecruiter() {
  return requireRole("RECRUITER");
}

/* -------------------------------------------------------------------------- */
/* Company                                                                    */
/* -------------------------------------------------------------------------- */

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

  // `optionalUrl` transforms an empty box to `null`, not `undefined`, so an
  // all-blank submit would otherwise be sent as a no-op PUT that clears the
  // existing name. Reject it before it reaches the API.
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

/* -------------------------------------------------------------------------- */
/* Questions                                                                  */
/* -------------------------------------------------------------------------- */

const questionIdSchema = z.object({
  questionId: z.string().trim().min(1, "Question id is required"),
});

/**
 * MCQ option lists and the correct answer are Prisma `Json`, so they arrive as
 * `unknown` and are validated here rather than trusted from the client. The
 * correct answer is stored as the **option text** byte-identical to the option,
 * because the backend auto-grades MCQs with
 * `JSON.stringify(response) === JSON.stringify(correctAnswer)` (§1.1 X1).
 */
function parseQuestionFields(formData: FormData) {
  const options = toOptionList(toRawJson(formData.get("options"))).map(
    (option) => option.trim(),
  );
  const correctAnswerRaw = toRawJson(formData.get("correctAnswer"));
  const correctAnswer =
    typeof correctAnswerRaw === "string" ? correctAnswerRaw : null;
  const tags = toOptionList(toRawJson(formData.get("tags")))
    .map((tag) => tag.trim())
    .filter(Boolean);

  return { options: options.filter(Boolean), correctAnswer, tags };
}

/**
 * Reads a form field that carries a JSON-encoded list (options, tags) or a
 * bare string (the correct MCQ answer). Returning `JsonValue` rather than
 * `unknown` keeps the payload typed all the way to `lib/format.ts`.
 *
 * A value that starts with `[` is treated as JSON, because that is exactly what
 * `TagInput` and the option builder submit. Anything else stays a plain string,
 * so an MCQ option whose text legitimately begins with a bracket round-trips
 * unchanged.
 */
function toRawJson(value: FormDataEntryValue | null): JsonValue | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
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
    // Only an MCQ carries a pick-one option list. A written or coding question
    // still stores `correctAnswer` — the backend keeps it, and the grading
    // workspace in Phase 5 shows it to the evaluator as a reference — so it is
    // deliberately not nulled here.
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

  // The edit dialog always submits the full record, so one create-schema parse
  // covers both verbs — a PATCH carrying the whole body is a single concern,
  // unlike the four overloaded variants `PATCH /assessments/:id` accepts.
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

/* -------------------------------------------------------------------------- */
/* Assessments                                                                */
/* -------------------------------------------------------------------------- */

export async function createAssessmentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRecruiter();

  const parsed = createAssessmentSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || null,
    durationMins: formData.get("durationMins"),
    passScore:
      formData.get("passScore") === "" || formData.get("passScore") === null
        ? null
        : formData.get("passScore"),
  });

  if (!parsed.success) {
    return invalid(VALIDATION_MESSAGES.generic, fieldErrorsFrom(parsed.error));
  }

  const res = await assessmentService.create(parsed.data);

  if (!res.success || !res.data) {
    return invalid(res.message || ACTION_MESSAGES.createAssessment.failure, {});
  }

  revalidatePath("/dashboard/recruiter/assessments", "page");
  revalidatePath("/dashboard/recruiter", "page");

  return ok(
    ACTION_MESSAGES.createAssessment.success,
    `/dashboard/recruiter/assessments/${res.data.id}`,
  );
}

/**
 * The wizard's single commit (Flow A, step 3). The backend has no
 * "create-with-questions" endpoint, so this is three sequential calls on one
 * freshly created draft:
 *
 *   POST /assessments            -> draft id
 *   PATCH /assessments/:id       -> { questionIds }
 *   PATCH /assessments/:id       -> { status: "PUBLISHED" }
 *
 * They cannot be batched: every step needs the previous id, and the backend
 * refuses to publish a draft with no questions (verified — §0.7).
 *
 * The draft is left in place if a later step fails, so the user can recover on
 * the detail page rather than retyping the wizard. `publish` is optional: a
 * "Save as draft" submit skips step 3 and lands on the detail page.
 */
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
    // The draft exists and is reachable; tell the user where rather than
    // pretending nothing happened.
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

/* -------------------------------------------------------------------------- */
/* Assessment detail — lifecycle, draft edits, invites, delete                 */
/* -------------------------------------------------------------------------- */

const idSchema = z.string().trim().min(1, "Assessment id is required");

/**
 * Lists the ids whose rendered output a given assessment can appear in, so one
 * mutation revalidates every page that shows the number it changes. The detail
 * page is dynamic and cannot be targeted by a static path, hence the explicit
 * list rather than `revalidatePath("/dashboard/recruiter/assessments/[id]")`.
 */
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

  const parsed = z
    .object({ assessmentId: idSchema, status: z.enum(["PUBLISHED", "CLOSED", "ARCHIVED"]) })
    .safeParse({
      assessmentId: formData.get("assessmentId"),
      status: formData.get("status"),
    });

  if (!parsed.success) {
    return invalid(VALIDATION_MESSAGES.generic, fieldErrorsFrom(parsed.error));
  }

  const { assessmentId, status } = parsed.data;
  const res = await assessmentService.setStatus(assessmentId, status);

  if (!res.success) {
    return invalid(
      res.message || ACTION_MESSAGES.updateAssessment.failure,
      {},
    );
  }

  for (const path of assessmentSurfaces(assessmentId)) {
    revalidatePath(path, "page");
  }

  // `PATCH` answers with the bare assessment row, so the new state is named here
  // rather than read back off the response.
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

  // `assessmentDetailsSchema`, not the four-way `updateAssessmentSchema` union:
  // the union would happily accept a `{ status }` body here.
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
    return invalid(
      res.message || ACTION_MESSAGES.updateAssessment.failure,
      {},
    );
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

  const questionIds = parseJsonArray(formData.get("questionIds"));
  const parsed = z
    .object({ questionIds: z.array(z.string().trim().min(1)).max(200) })
    .safeParse({ questionIds });

  if (!parsed.success) {
    return invalid(VALIDATION_MESSAGES.generic, fieldErrorsFrom(parsed.error));
  }

  const res = await assessmentService.setQuestions(
    assessmentId.data,
    parsed.data.questionIds,
  );

  if (!res.success) {
    return invalid(
      res.message || ACTION_MESSAGES.updateAssessment.failure,
      {},
    );
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
    return invalid(
      res.message || ACTION_MESSAGES.deleteAssessment.failure,
      {},
    );
  }

  for (const path of assessmentSurfaces(assessmentId.data)) {
    revalidatePath(path, "page");
  }
  revalidatePath("/dashboard/recruiter/assessments", "page");
  revalidatePath("/dashboard/recruiter", "page");

  return ok(ACTION_MESSAGES.deleteAssessment.success, "/dashboard/recruiter/assessments");
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

/* -------------------------------------------------------------------------- */
/* Grading                                                                     */
/* -------------------------------------------------------------------------- */

export async function evaluateAttemptAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRecruiter();

  const attemptId = idSchema.safeParse(formData.get("attemptId"));
  if (!attemptId.success) {
    return invalid(VALIDATION_MESSAGES.generic, { attemptId: ["Attempt id is required"] });
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

  // Grading moves the attempt to EVALUATED, which changes the results table and
  // the release column, so both are revalidated. An attempt carries no
  // `assessmentId` of its own — the link runs through the invitation.
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

/* -------------------------------------------------------------------------- */
/* Billing                                                                     */
/* -------------------------------------------------------------------------- */

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
    return invalid(
      res.message || ACTION_MESSAGES.initiatePayment.failure,
      {},
    );
  }

  // No revalidation: nothing is stored until Stripe's webhook confirms the
  // payment. The PENDING row it just created is read on the billing page.
  return {
    ...ok(ACTION_MESSAGES.initiatePayment.success),
    externalUrl: res.data.checkoutUrl,
  };
}
