import {
  ASSESSMENT_STATUS_LABELS,
  ASSESSMENT_STATUS_TONES,
  ATTEMPT_STATUS_LABELS,
  ATTEMPT_STATUS_TONES,
  type BadgeTone,
  DIFFICULTY_LABELS,
  DIFFICULTY_TONES,
  INVITATION_STATUS_LABELS,
  INVITATION_STATUS_TONES,
  PAYMENT_PROVIDER_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
  QUESTION_TYPE_LABELS,
  ROLE_LABELS,
} from "@/lib/constants";
import type {
  AssessmentStatus,
  AttemptStatus,
  AuthProvider,
  Difficulty,
  InvitationStatus,
  PaymentProvider,
  PaymentStatus,
  QuestionType,
  Role,
  UserStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  success: "border-success/35 bg-success/10 text-success",
  warning: "border-warning/35 bg-warning/10 text-warning",
  danger: "border-destructive/35 bg-destructive/10 text-destructive",
  info: "border-info/35 bg-info/10 text-info",
};

const DOT_CLASS: Record<BadgeTone, string> = {
  neutral: "bg-muted-foreground/60",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-info",
};

export function StatusBadge({
  label,
  tone,
  dot = true,
  className,
}: {
  label: string;
  tone: BadgeTone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 font-mono text-xs font-medium whitespace-nowrap",
        TONE_CLASS[tone],
        className,
      )}
    >
      {dot ? (
        <span
          aria-hidden
          className={cn("size-1.5 shrink-0 rounded-full", DOT_CLASS[tone])}
        />
      ) : null}
      {label}
    </span>
  );
}

export const UserStatusLabels: Record<UserStatus, string> = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
};

export const UserStatusTones: Record<UserStatus, BadgeTone> = {
  ACTIVE: "success",
  SUSPENDED: "danger",
};

export const AuthProviderLabels: Record<AuthProvider, string> = {
  LOCAL: "Email + password",
  GOOGLE: "Google",
};

export function QuestionTypeBadge({
  value,
  className,
}: {
  value: QuestionType;
  className?: string;
}) {
  return (
    <StatusBadge
      className={className}
      dot={false}
      label={QUESTION_TYPE_LABELS[value]}
      tone="info"
    />
  );
}

export function DifficultyBadge({
  value,
  className,
}: {
  value: Difficulty;
  className?: string;
}) {
  return (
    <StatusBadge
      className={className}
      label={DIFFICULTY_LABELS[value]}
      tone={DIFFICULTY_TONES[value]}
    />
  );
}

export function AssessmentStatusBadge({
  value,
  className,
}: {
  value: AssessmentStatus;
  className?: string;
}) {
  return (
    <StatusBadge
      className={className}
      label={ASSESSMENT_STATUS_LABELS[value]}
      tone={ASSESSMENT_STATUS_TONES[value]}
    />
  );
}

export function InvitationStatusBadge({
  value,
  className,
}: {
  value: InvitationStatus;
  className?: string;
}) {
  return (
    <StatusBadge
      className={className}
      label={INVITATION_STATUS_LABELS[value]}
      tone={INVITATION_STATUS_TONES[value]}
    />
  );
}

export function AttemptStatusBadge({
  value,
  className,
}: {
  value: AttemptStatus;
  className?: string;
}) {
  return (
    <StatusBadge
      className={className}
      label={ATTEMPT_STATUS_LABELS[value]}
      tone={ATTEMPT_STATUS_TONES[value]}
    />
  );
}

export function PaymentStatusBadge({
  value,
  className,
}: {
  value: PaymentStatus;
  className?: string;
}) {
  return (
    <StatusBadge
      className={className}
      label={PAYMENT_STATUS_LABELS[value]}
      tone={PAYMENT_STATUS_TONES[value]}
    />
  );
}

export function PaymentProviderBadge({
  value,
  className,
}: {
  value: PaymentProvider;
  className?: string;
}) {
  return (
    <StatusBadge
      className={className}
      dot={false}
      label={PAYMENT_PROVIDER_LABELS[value]}
      tone="neutral"
    />
  );
}

export function RoleBadge({
  value,
  className,
}: {
  value: Role;
  className?: string;
}) {
  return (
    <StatusBadge
      className={className}
      dot={false}
      label={ROLE_LABELS[value]}
      tone="neutral"
    />
  );
}

export function UserStatusBadge({
  value,
  className,
}: {
  value: UserStatus;
  className?: string;
}) {
  return (
    <StatusBadge
      className={className}
      label={UserStatusLabels[value]}
      tone={UserStatusTones[value]}
    />
  );
}
