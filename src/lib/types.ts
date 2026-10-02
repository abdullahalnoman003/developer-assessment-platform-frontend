export type Role = "CANDIDATE" | "RECRUITER" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED";
export type AuthProvider = "LOCAL" | "GOOGLE";

export type AssessmentStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
export type QuestionType = "MCQ" | "WRITTEN" | "CODING";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
export type AttemptStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "EVALUATED"
  | "EXPIRED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentProvider = "STRIPE" | "BKASH" | "SSLCOMMERZ";
export type CreditPlan = "STARTER" | "PRO" | "ENTERPRISE";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  errors?: string[];
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginatedMeta;
}

/**
 * URL state handed from a Server Component to a `"use client"` component.
 * A `URLSearchParams` instance cannot cross the RSC boundary — React collapses it
 * into one mangled key — so pages convert it with `toUrlParamRecord` first.
 */
export type UrlParamRecord = Record<string, string>;

export interface Company {
  id: string;
  name: string;
  website: string | null;
  logoUrl: string | null;
  creditsRemaining: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CompanySummary {
  id: string;
  name: string;
}

export interface CompanyMembership {
  id: string;
  userId: string;
  companyId: string;
  company: Company;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  authProvider: AuthProvider;
  avatarUrl: string | null;
  phone: string | null;
  bio: string | null;
  skills: string[];
  resumeUrl: string | null;
  githubUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SessionUser extends User {
  companyMembership: CompanyMembership | null;
}

export type ProfileUser = SessionUser;

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  authProvider: AuthProvider;
  avatarUrl: string | null;
  createdAt: string;
  companyMembership: { company: CompanySummary } | null;
  _count: { invitations: number; attempts: number; auditLogs: number };
}

export interface AdminUserPatch {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  deletedAt: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ActionState {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: Record<string, string[]>;
  redirectTo: string | null;
}

export const IDLE_ACTION_STATE: ActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  redirectTo: null,
};

export interface CompanyDashboard {
  company: {
    id: string | undefined;
    name: string | undefined;
    website: string | null;
    logoUrl: string | null;
    creditsRemaining: number;
    createdAt: string | undefined;
  };
  assessmentCount: number;
  assessmentsByStatus: Partial<Record<AssessmentStatus, number>>;
  invitationCount: number;
  invitationsByStatus: Partial<Record<InvitationStatus, number>>;
  attemptCount: number;
  attemptsByStatus: Partial<Record<AttemptStatus, number>>;
  averageScore: number | null;
}

export interface Question {
  id: string;
  companyId: string;
  type: QuestionType;
  difficulty: Difficulty;
  title: string;
  body: string;
  options: JsonValue | null;
  correctAnswer: JsonValue | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Assessment {
  id: string;
  companyId: string;
  title: string;
  description: string | null;
  status: AssessmentStatus;
  durationMins: number;
  passScore: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AssessmentListItem extends Assessment {
  _count: { questions: number; invitations: number };
}

export interface AssessmentWithQuestions extends Assessment {
  questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  assessmentId: string;
  questionId: string;
  points: number;
  order: number;
  question: Question;
}

export interface AssessmentStats {
  invitationCount: number;
  invitationsByStatus: Partial<Record<InvitationStatus, number>>;
  attemptCount: number;
  attemptsByStatus: Partial<Record<AttemptStatus, number>>;
  averageScore: number | null;
}

export interface AssessmentDetail extends Assessment {
  questions: AssessmentQuestion[];
  _count: { invitations: number };
  stats: AssessmentStats;
}

export interface Invitation {
  id: string;
  assessmentId: string;
  candidateId: string;
  status: InvitationStatus;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface InvitationWithAssessment extends Invitation {
  assessment: {
    id: string;
    title: string;
    description: string | null;
    durationMins: number;
    status: AssessmentStatus;
  };
  attempt: {
    id: string;
    status: AttemptStatus;
    deadline: string;
    resultReleased: boolean;
  } | null;
}

export interface InvitationWithCandidate extends Invitation {
  candidate: { id: string; name: string; email: string };
}

export interface Answer {
  id: string;
  attemptId: string;
  questionId: string;
  response: JsonValue;
  isCorrect: boolean | null;
  pointsAwarded: number | null;
}

export interface Attempt {
  id: string;
  invitationId: string;
  candidateId: string;
  status: AttemptStatus;
  startedAt: string | null;
  submittedAt: string | null;
  deadline: string | null;
  score: number | null;
  maxScore: number | null;
  resultReleased: boolean;
  evaluatorNote: string | null;
}

export interface AttemptAssessmentBrief {
  id: string;
  title: string;
  durationMins: number;
}

export interface StartedAttempt extends Attempt {
  invitation: Invitation & { assessment: AttemptAssessmentBrief };
}

export interface SavedAttempt extends Attempt {
  answers: Answer[];
  invitation: Invitation & { assessment: AttemptAssessmentBrief };
}

export interface EvaluatedAttempt extends Attempt {
  answers: Answer[];
  invitation: Invitation & { assessment: { id: string; title: string } };
}

export interface AttemptDetail extends Attempt {
  answers: Answer[];
  invitation: Invitation & {
    assessment: Assessment & { questions: AssessmentQuestion[] };
  };
}

export interface ResultRow extends Attempt {
  candidate: { id: string; name: string; email: string };
  invitation: { status: InvitationStatus };
}

export interface Payment {
  id: string;
  companyId: string;
  provider: PaymentProvider;
  amount: string;
  status: PaymentStatus;
  providerRef: string;
  creditsGranted: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDetail extends Payment {
  company: CompanySummary;
}

export interface InitiatePaymentResult {
  checkoutUrl: string;
  payment: Payment;
}

export interface AdminStats {
  users: {
    total: number;
    recruiters: number;
    candidates: number;
    admins: number;
  };
  companies: number;
  questions: number;
  assessments: number;
  attempts: number;
  payments: { paidCount: number; totalRevenue: number };
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  meta: JsonValue | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}
