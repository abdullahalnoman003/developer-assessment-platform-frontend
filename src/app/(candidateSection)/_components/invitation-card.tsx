import { ClockIcon } from "lucide-react";
import { ExpiryCountdown } from "@/app/(candidateSection)/_components/expiry-countdown";
import { InvitationActions } from "@/app/(candidateSection)/_components/invitation-actions";
import {
  AttemptStatusBadge,
  InvitationStatusBadge,
} from "@/components/shared/status-badge";
import { formatDateTime, isPast } from "@/lib/format";
import type { InvitationWithAssessment } from "@/lib/types";

/**
 * One invitation, rendered on the server. It shows only what
 * `GET /invitations/me` returns for the assessment — `title`, `description`,
 * `durationMins` and `status` — because that is the whole candidate-visible
 * shape: there is no candidate-scoped assessment endpoint, and deliberately so.
 */
export function InvitationCard({
  invitation,
}: {
  invitation: InvitationWithAssessment;
}) {
  const { assessment, attempt, status, expiresAt } = invitation;
  const expired = isPast(expiresAt);
  const closed = assessment.status !== "PUBLISHED";

  return (
    <article className="flex flex-col gap-3 border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-sm font-semibold">
            {assessment.title}
          </h3>
          {assessment.description ? (
            <p className="mt-1 text-xs/relaxed text-muted-foreground">
              {assessment.description}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <InvitationStatusBadge value={status} />
          {attempt ? <AttemptStatusBadge value={attempt.status} /> : null}
        </div>
      </div>

      <dl className="grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-3">
        <div className="flex items-center gap-1.5">
          <ClockIcon aria-hidden className="size-3 text-muted-foreground" />
          <dt className="sr-only">Time limit</dt>
          <dd className="text-muted-foreground">
            {assessment.durationMins} min limit
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="text-muted-foreground">Invited</dt>
          <dd>{formatDateTime(invitation.createdAt)}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="text-muted-foreground">Expires</dt>
          <dd>
            <ExpiryCountdown expiresAt={expiresAt} />
          </dd>
        </div>
      </dl>

      {closed ? (
        <p className="border border-amber-500/40 bg-amber-500/5 px-2.5 py-2 text-xs/relaxed text-muted-foreground">
          The recruiter has moved this assessment to{" "}
          <span className="font-medium text-foreground">
            {assessment.status.toLowerCase()}
          </span>
          . You can still review anything you already started, but no new
          invitation here can be started.
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <p className="text-xs/relaxed text-muted-foreground">
          {status === "PENDING"
            ? "Accept to unlock the assessment. Declining is permanent — there is no un-decline."
            : status === "DECLINED"
              ? "You declined this invitation."
              : status === "EXPIRED" || expired
                ? "This invitation can no longer be started."
                : attempt?.status === "IN_PROGRESS"
                  ? "Your saved answers come back from the server when you resume."
                  : "Nothing outstanding on this invitation."}
        </p>
        <InvitationActions
          attemptId={attempt?.id ?? null}
          attemptStatus={attempt?.status ?? null}
          expired={expired}
          invitationId={invitation.id}
          status={status}
        />
      </div>
    </article>
  );
}
