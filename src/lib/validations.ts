import { z } from "zod";

const httpUrl = z.url({ protocol: /^https?$/ });
const optionalUrl = (max = 500) =>
  z
    .string()
    .trim()
    .max(max, `Must be at most ${max} characters`)
    .refine(
      (value) => value === "" || httpUrl.safeParse(value).success,
      "Enter a valid URL",
    )
    .transform((value) => (value === "" ? null : value));

const nullableHttpUrl = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((value) => value === "" || httpUrl.safeParse(value).success, {
      message: "Enter a valid URL",
    })
    .nullable();

export const loginSchema = z.object({
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// bound to a "use server" argument, so the role needs a runtime check
export const googleLoginSchema = z.object({
  idToken: z.string().min(1, "Google sign-in returned no credential"),
  role: z.enum(["CANDIDATE", "RECRUITER"]).optional(),
});
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password is too long"),
  role: z.enum(["CANDIDATE", "RECRUITER"]),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name cannot be empty")
    .max(100, "Name is too long")
    .optional(),
  avatarUrl: nullableHttpUrl(1000).optional(),
  phone: z.string().trim().max(500, "Phone is too long").nullable().optional(),
  bio: z.string().trim().max(500, "Bio is too long").nullable().optional(),
  skills: z
    .array(z.string().trim().min(1).max(50))
    .max(50, "At most 50 skills")
    .optional(),
  resumeUrl: nullableHttpUrl(500).optional(),
  githubUrl: nullableHttpUrl(500).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const upsertCompanySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Company name cannot be empty")
    .max(150, "Name is too long")
    .optional(),
  website: optionalUrl(500).optional(),
  logoUrl: optionalUrl(1000).optional(),
});
export type UpsertCompanyInput = z.infer<typeof upsertCompanySchema>;

const questionBase = {
  type: z.enum(["MCQ", "WRITTEN", "CODING"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(300, "Title is too long"),
  body: z
    .string()
    .trim()
    .min(1, "Question body is required")
    .max(10000, "Body is too long"),
  options: z.unknown().optional(),
  correctAnswer: z.unknown().optional(),
  tags: z
    .array(z.string().trim().min(1).max(50))
    .max(20, "At most 20 tags")
    .optional(),
};

export const createQuestionSchema = z
  .object(questionBase)
  .superRefine((value, ctx) => {
    if (value.type !== "MCQ") return;
    const options = Array.isArray(value.options) ? value.options : [];
    if (options.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "MCQ needs at least 2 options",
      });
    }
    if (
      value.correctAnswer === undefined ||
      value.correctAnswer === null ||
      value.correctAnswer === ""
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["correctAnswer"],
        message: "Mark the correct option",
      });
    }
  });
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;

export const updateQuestionSchema = z
  .object({
    ...questionBase,
    type: questionBase.type.optional(),
    difficulty: questionBase.difficulty.optional(),
    title: questionBase.title.optional(),
    body: questionBase.body.optional(),
    deletedAt: z.literal("now").optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type !== "MCQ" && value.correctAnswer !== undefined) return;
    if (
      value.type === "MCQ" &&
      (value.correctAnswer === undefined ||
        value.correctAnswer === null ||
        value.correctAnswer === "")
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["correctAnswer"],
        message: "Mark the correct option",
      });
    }
  });
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;

export const createAssessmentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(300, "Title is too long"),
  description: z
    .string()
    .trim()
    .max(5000, "Description is too long")
    .nullable()
    .optional(),
  durationMins: z.coerce
    .number("Enter a number of minutes")
    .int("Use whole minutes")
    .min(1, "Duration must be at least 1 minute")
    .max(600, "Duration cannot exceed 600 minutes"),
  passScore: z.coerce
    .number()
    .int()
    .min(0, "Pass score cannot be negative")
    .max(10000)
    .nullable()
    .optional(),
});
export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;

const assessmentDetails = {
  title: createAssessmentSchema.shape.title.optional(),
  description: createAssessmentSchema.shape.description,
  durationMins: createAssessmentSchema.shape.durationMins.optional(),
  passScore: createAssessmentSchema.shape.passScore,
};

export const assessmentDetailsSchema = z
  .object(assessmentDetails)
  .refine((value) => Object.values(value).some((v) => v !== undefined), {
    message: "Nothing to update",
  });
export type AssessmentDetailsInput = z.infer<typeof assessmentDetailsSchema>;

const blankableNumber = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    schema,
  );

export const assessmentDetailsFormSchema = z.object({
  title: createAssessmentSchema.shape.title,
  description: createAssessmentSchema.shape.description,
  durationMins: blankableNumber(
    createAssessmentSchema.shape.durationMins.optional(),
  ),
  passScore: blankableNumber(createAssessmentSchema.shape.passScore),
});
export type AssessmentDetailsFormInput = z.infer<
  typeof assessmentDetailsFormSchema
>;

export const updateAssessmentSchema = z.union([
  z.object({ status: z.enum(["PUBLISHED", "CLOSED", "ARCHIVED"]) }),
  z.object({
    questionIds: z
      .array(z.string().trim().min(1))
      .max(200, "Too many questions"),
  }),
  assessmentDetailsSchema,
  z.object({ deletedAt: z.literal("now") }),
]);
export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>;

export const inviteSchema = z.object({
  candidateEmails: z
    .array(z.email("One of the emails is invalid"))
    .min(1, "Add at least one candidate email")
    .max(100, "At most 100 candidates per batch"),
});
export type InviteInput = z.infer<typeof inviteSchema>;

export const respondInvitationSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED"]),
});
export type RespondInvitationInput = z.infer<typeof respondInvitationSchema>;

export const saveAnswersSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().trim().min(1),
        response: z.unknown(),
      }),
    )
    .min(1, "Nothing to save")
    .max(500),
});
export type SaveAnswersInput = z.infer<typeof saveAnswersSchema>;

export const evaluateAttemptSchema = z.object({
  scores: z
    .array(
      z.object({
        answerId: z.string().trim().min(1),
        points: z.coerce
          .number("Enter a number")
          .int("Use whole points")
          .min(0, "Points cannot be negative")
          .max(10000),
      }),
    )
    .min(1, "Score at least one written or coding answer")
    .max(500),
  releaseResult: z.boolean().optional(),
});
export type EvaluateAttemptInput = z.infer<typeof evaluateAttemptSchema>;

export const initiatePaymentSchema = z.object({
  plan: z.enum(["STARTER", "PRO", "ENTERPRISE"]),
});
export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;

export const updateUserStatusSchema = z
  .object({
    status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
    deletedAt: z.literal("now").optional(),
  })
  .refine(
    (value) => value.status !== undefined || value.deletedAt !== undefined,
    {
      message: "Choose an action",
    },
  );
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(100),
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  topic: z.enum(["GENERAL", "SALES", "SUPPORT", "BUG"]),
  message: z
    .string()
    .trim()
    .min(20, "Give us at least 20 characters")
    .max(2000, "Message is too long"),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const questionQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  type: z.enum(["MCQ", "WRITTEN", "CODING"]).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const assessmentQuerySchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"]).optional(),
  sortBy: z.enum(["createdAt", "title"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const invitationQuerySchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "DECLINED", "EXPIRED"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const adminUsersQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  role: z.enum(["CANDIDATE", "RECRUITER", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const auditLogQuerySchema = z.object({
  entity: z.string().trim().min(1).optional(),
  action: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// a cuid/nanoid-ish identifier, so a pasted sentence never reaches the API
export const recordIdSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Enter an identifier")
    .max(64, "That identifier is too long")
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Identifiers contain only letters, numbers, - and _",
    ),
});
export type RecordIdInput = z.infer<typeof recordIdSchema>;

// shared with assessment-questions-dialog.tsx so both sides agree
export const ASSESSMENT_QUESTION_LIMIT = 200;
export const assessmentQuestionsSchema = z.object({
  questionIds: z.array(z.string().trim().min(1)).max(ASSESSMENT_QUESTION_LIMIT),
});
export type AssessmentQuestionsInput = z.infer<
  typeof assessmentQuestionsSchema
>;

export const assessmentStatusSchema = z.object({
  status: z.enum(["PUBLISHED", "CLOSED", "ARCHIVED"]),
});
export type AssessmentStatusInput = z.infer<typeof assessmentStatusSchema>;

export const pagedQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
});
export type PagedQuery = z.infer<typeof pagedQuerySchema>;
