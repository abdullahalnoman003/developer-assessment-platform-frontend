import type {
  AssessmentStatus,
  AttemptStatus,
  CreditPlan,
  Difficulty,
  InvitationStatus,
  PaymentProvider,
  PaymentStatus,
  QuestionType,
  Role,
} from "./types";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

export const ROLE_LABELS: Record<Role, string> = {
  CANDIDATE: "Candidate",
  RECRUITER: "Recruiter",
  ADMIN: "Admin",
};

export const ROLE_HOME: Record<Role, string> = {
  CANDIDATE: "/dashboard/candidate",
  RECRUITER: "/dashboard/recruiter",
  ADMIN: "/dashboard/admin",
};

export interface DemoAccount {
  role: Role;
  email: string;
  password: string;
  blurb: string;
}

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    role: "CANDIDATE",
    email: "candidate@codearena.com",
    password: "candidate123",
    blurb: "Invitations, live attempts and released results.",
  },
  {
    role: "RECRUITER",
    email: "recruiter@codearena.com",
    password: "recruiter123",
    blurb: "Question bank, assessments, grading and billing.",
  },
  {
    role: "ADMIN",
    email: "admin@codearena.com",
    password: "admin1234",
    blurb: "Users, audit logs and payment lookup.",
  },
] as const;

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MCQ: "Multiple choice",
  WRITTEN: "Written",
  CODING: "Coding",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CLOSED: "Closed",
  ARCHIVED: "Archived",
};

export const ASSESSMENT_STATUS_TONES: Record<AssessmentStatus, BadgeTone> = {
  DRAFT: "neutral",
  PUBLISHED: "info",
  CLOSED: "warning",
  ARCHIVED: "danger",
};

export const INVITATION_STATUS_LABELS: Record<InvitationStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  EXPIRED: "Expired",
};

export const INVITATION_STATUS_TONES: Record<InvitationStatus, BadgeTone> = {
  PENDING: "warning",
  ACCEPTED: "success",
  DECLINED: "danger",
  EXPIRED: "neutral",
};

export const ATTEMPT_STATUS_LABELS: Record<AttemptStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  SUBMITTED: "Submitted",
  EVALUATED: "Evaluated",
  EXPIRED: "Expired",
};

export const ATTEMPT_STATUS_TONES: Record<AttemptStatus, BadgeTone> = {
  NOT_STARTED: "neutral",
  IN_PROGRESS: "info",
  SUBMITTED: "warning",
  EVALUATED: "success",
  EXPIRED: "danger",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const PAYMENT_STATUS_TONES: Record<PaymentStatus, BadgeTone> = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "danger",
  REFUNDED: "info",
};

export const PAYMENT_PROVIDER_LABELS: Record<PaymentProvider, string> = {
  STRIPE: "Stripe",
  BKASH: "bKash",
  SSLCOMMERZ: "SSLCommerz",
};

export const AUDIT_ACTIONS: readonly { value: string; label: string }[] = [
  { value: "", label: "All actions" },
  { value: "USER_STATUS_UPDATED", label: "User status updated" },
  { value: "USER_DELETED", label: "User deleted" },
  { value: "ASSESSMENT_STATUS_CHANGE", label: "Assessment status changed" },
  { value: "RESULT_RELEASED", label: "Result released" },
  { value: "INVITATIONS_SENT", label: "Invitations sent" },
  { value: "PAYMENT_CONFIRMED", label: "Payment confirmed" },
];

export const AUDIT_ENTITIES: readonly { value: string; label: string }[] = [
  { value: "", label: "All entities" },
  { value: "User", label: "User" },
  { value: "Assessment", label: "Assessment" },
  { value: "Attempt", label: "Attempt" },
  { value: "Invitation", label: "Invitation" },
  { value: "Payment", label: "Payment" },
];

export function auditActionLabel(action: string): string {
  return AUDIT_ACTIONS.find((entry) => entry.value === action)?.label ?? action;
}

export const DIFFICULTY_TONES: Record<Difficulty, BadgeTone> = {
  EASY: "success",
  MEDIUM: "warning",
  HARD: "danger",
};

export const CREDIT_PLANS: {
  id: CreditPlan;
  name: string;
  credits: number;
  priceUsdCents: number;
  highlight: string[];
  featured: boolean;
}[] = [
  {
    id: "STARTER",
    name: "Starter",
    credits: 25,
    priceUsdCents: 2000,
    highlight: [
      "25 assessment credits",
      "All three question types",
      "Stripe test-mode checkout",
    ],
    featured: false,
  },
  {
    id: "PRO",
    name: "Pro",
    credits: 100,
    priceUsdCents: 7500,
    highlight: [
      "100 assessment credits",
      "Everything in Starter",
      "Lower price per credit",
    ],
    featured: true,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    credits: 300,
    priceUsdCents: 20000,
    highlight: [
      "300 assessment credits",
      "Everything in Pro",
      "Lowest price per credit",
    ],
    featured: false,
  },
];

export const SUPPORT_EMAIL = "support@codearena.com";
export const APP_NAME = "CodeArena";
export const APP_TAGLINE =
  "Rigorous technical screening for modern engineering teams";

export const NAV_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;
