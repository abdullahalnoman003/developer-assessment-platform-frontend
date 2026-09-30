export type Role = "CANDIDATE" | "RECRUITER" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED";
export type AuthProvider = "LOCAL" | "GOOGLE";

export type AssessmentStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
export type QuestionType = "MCQ" | "WRITTEN" | "CODING";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
export type AttemptStatus =
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "EVALUATED"
  | "EXPIRED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PaymentProvider = "STRIPE" | "BKASH" | "SSLCOMMERZ";
export type CreditPlan = "STARTER" | "PRO" | "ENTERPRISE";

/** Prisma Json column, as it arrives over the wire. */
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

/* ------------------------------------------------------------------ Users */

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

/** Shape returned by `GET /auth/me` and `GET /users/me`. */
export interface SessionUser extends User {
  companyMembership: CompanyMembership | null;
}

/** Shape returned by `POST /auth/register` and `PATCH /users/me` (no membership). */
export type ProfileUser = User;

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

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/* --------------------------------------------------------------- Company */

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

/* ------------------------------------------------------------- Questions */

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

/* ----------------------------------------------------------- Assessments */

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

/* ----------------------------------------------------------- Invitations */

export interface Invitation {
  id: string;
  assessmentId: string;
  candidateId: string;
  status: InvitationStatus;
  token: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
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

/* -------------------------------------------------------------- Attempts */

export interface Answer {
  id: string;
  attemptId: string;
  questionId: string;
  response: JsonValue;
  isCorrect: boolean | null;
  pointsAwarded: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Attempt {
  id: string;
  invitationId: string;
  candidateId: string;
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  deadline: string | null;
  score: number | null;
  maxScore: number | null;
  resultReleased: boolean;
  evaluatorNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StartedAttempt extends Attempt {
  invitation: {
    id: string;
    status: InvitationStatus;
    assessment: { id: string; title: string; durationMins: number };
  };
}

export interface SavedAttempt extends Attempt {
  answers: Answer[];
  invitation: {
    id: string;
    assessment: { id: string; title: string; durationMins: number };
  };
}

/** `GET /attempts/:id` — carries the full question set and the answers. */
export interface AttemptDetail extends Attempt {
  answers: Answer[];
  invitation: {
    id: string;
    status: InvitationStatus;
    assessment: Assessment & { questions: AssessmentQuestion[] };
  };
}

export interface ResultRow extends Attempt {
  candidate: { id: string; name: string; email: string };
  invitation: { status: InvitationStatus };
}

/* -------------------------------------------------------------- Payments */

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

/* ----------------------------------------------------------------- Admin */

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
  entityId: string;
  meta: JsonValue | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}
