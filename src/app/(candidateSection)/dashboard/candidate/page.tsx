import {
  CheckCircle2Icon,
  InboxIcon,
  LayersIcon,
  MailOpenIcon,
  SendIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState, InlineNotice } from "@/components/shared/error-state";
import { StatsCards } from "@/components/shared/stats-cards";
import {
  AttemptStatusBadge,
  InvitationStatusBadge,
} from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatNumber } from "@/lib/format";
import { EMPTY_STATES, VALIDATION_MESSAGES } from "@/lib/messages";
import { dashboardMetadata } from "@/lib/seo";
import type { InvitationWithAssessment } from "@/lib/types";
import { invitationService } from "@/service/invitations";

export const metadata: Metadata = dashboardMetadata("Candidate dashboard");

const MAX_INVITATIONS = 100;

const PENDING_PREVIEW = 3;

export default async function CandidateDashboardPage() {
  const res = await invitationService.listForCandidate({
    limit: MAX_INVITATIONS,
  });

  if (!res.success || !res.data) {
    return (
      <>
        <DashboardPageHeader title="Overview" />
        <ErrorState message={res.message || VALIDATION_MESSAGES.unknown} />
      </>
    );
  }

  const { items, meta } = res.data;
  const pending = items.filter((item) => item.status === "PENDING");
  const started = items.filter((item) => item.attempt !== null);
  const inProgress = started.filter(
    (item) => item.attempt?.status === "IN_PROGRESS",
  );
  const released = started.filter(
    (item) => item.attempt?.resultReleased === true,
  );
  const awaitingEvaluation = started.filter(
    (item) => item.attempt?.status === "SUBMITTED",
  );
  const truncated = meta.total > items.length;

  return (
    <>
      <DashboardPageHeader
        actions={
          <Button
            render={<Link href="/dashboard/candidate/invitations" />}
            size="sm"
            variant="outline"
          >
            All invitations
          </Button>
        }
        description="Everything here comes from your own invitations. Nothing is estimated."
        title="Overview"
      />

      <StatsCards
        items={[
          {
            label: "Invitations",
            value: formatNumber(meta.total),
            hint:
              meta.total === 1
                ? "1 assessment offered to you"
                : `${formatNumber(meta.total)} assessments offered to you`,
            Icon: SendIcon,
          },
          {
            label: "Awaiting your reply",
            value: formatNumber(pending.length),
            hint:
              pending.length > 0
                ? "Accept or decline before they expire"
                : "Nothing needs an answer",
            Icon: MailOpenIcon,
            tone: pending.length > 0 ? "warning" : "default",
          },
          {
            label: "In progress",
            value: formatNumber(inProgress.length),
            hint:
              inProgress.length > 0
                ? "Resume from where you stopped"
                : "No attempt running",
            Icon: LayersIcon,
          },
          {
            label: "Results released",
            value: formatNumber(released.length),
            hint:
              released.length > 0
                ? "Open a result to review every answer"
                : "Nothing released to you yet",
            Icon: CheckCircle2Icon,
            tone: released.length > 0 ? "success" : "default",
          },
        ]}
      />

      <DashboardPanel
        description={
          pending.length > 0
            ? `${formatNumber(pending.length)} invitation${pending.length === 1 ? "" : "s"} need${pending.length === 1 ? "s" : ""} an answer.`
            : "Nothing needs an answer right now."
        }
        title="Waiting for your reply"
      >
        {pending.length === 0 ? (
          <EmptyState
            action={
              <Button
                render={<Link href="/dashboard/candidate/invitations" />}
                size="sm"
                variant="outline"
              >
                Review invitations
              </Button>
            }
            body={EMPTY_STATES.myInvitations.body}
            Icon={InboxIcon}
            title={EMPTY_STATES.myInvitations.title}
          />
        ) : (
          <>
            <PendingInvitationList invitations={pending} />
            {pending.length > PENDING_PREVIEW ? (
              <p className="mt-4 text-xs text-muted-foreground">
                Showing {PENDING_PREVIEW} of {formatNumber(pending.length)} —
                the full list is on the{" "}
                <Link
                  className="underline underline-offset-4"
                  href="/dashboard/candidate/invitations?status=PENDING"
                >
                  invitations page
                </Link>
                .
              </p>
            ) : null}
          </>
        )}
      </DashboardPanel>

      <DashboardPanel
        description="One row per assessment you have actually started. An invitation alone is not an attempt."
        title="Your attempts"
      >
        {started.length === 0 ? (
          <EmptyState
            body={EMPTY_STATES.myAttempts.body}
            Icon={LayersIcon}
            title={EMPTY_STATES.myAttempts.title}
          />
        ) : (
          <AttemptList invitations={started} />
        )}
      </DashboardPanel>

      <InlineNotice
        body="Multiple-choice answers are scored the moment you save them. Written and coding answers are marked by the recruiter, and until they release the result you can see that your attempt was submitted but not what you scored. Releasing is a one-shot action, so a result that is not released cannot be published later."
        title="Why a result can be missing"
        tone={awaitingEvaluation.length > 0 ? "warning" : "info"}
      />

      {truncated ? (
        <InlineNotice
          body={`You have more than ${formatNumber(MAX_INVITATIONS)} invitations and the API will not return them all at once, so the counts above cover the most recent ${formatNumber(MAX_INVITATIONS)}. Nothing is estimated and nothing is hidden from the list pages.`}
          title="Showing the most recent invitations"
          tone="warning"
        />
      ) : null}

      <p className="text-xs/relaxed text-muted-foreground">
        Every figure above is counted from{" "}
        <code className="font-mono">GET /invitations/me</code>, the only
        candidate-scoped read the API exposes. CodeArena does not compute or
        guess a score.
      </p>
    </>
  );
}

function PendingInvitationList({
  invitations,
}: {
  invitations: readonly InvitationWithAssessment[];
}) {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {invitations.slice(0, PENDING_PREVIEW).map((invitation) => (
        <li className="flex flex-col gap-3 py-3 first:pt-0" key={invitation.id}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {invitation.assessment.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {invitation.assessment.durationMins} min limit · invited{" "}
                {formatDateTime(invitation.createdAt)}
              </p>
            </div>
            <InvitationStatusBadge value={invitation.status} />
          </div>
          <Button
            render={
              <Link
                href={`/dashboard/candidate/invitations?status=PENDING`}
                scroll={false}
              />
            }
            size="sm"
          >
            Accept or decline
          </Button>
        </li>
      ))}
    </ul>
  );
}

function AttemptList({
  invitations,
}: {
  invitations: readonly InvitationWithAssessment[];
}) {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {invitations.map((invitation) => {
        const attempt = invitation.attempt;
        if (!attempt) return null;

        const finished =
          attempt.status === "SUBMITTED" || attempt.status === "EVALUATED";
        const href = finished
          ? `/dashboard/candidate/attempts/${attempt.id}/result`
          : `/dashboard/candidate/attempts/${attempt.id}`;

        return (
          <li
            className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0"
            key={invitation.id}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {invitation.assessment.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {attempt.resultReleased
                  ? "Result released — open it to review every answer"
                  : attempt.status === "SUBMITTED"
                    ? "Submitted — waiting for the evaluator to release your result"
                    : attempt.status === "IN_PROGRESS"
                      ? `Deadline ${formatDateTime(attempt.deadline)}`
                      : "This attempt is closed"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <AttemptStatusBadge value={attempt.status} />
              <Button render={<Link href={href} />} size="sm" variant="outline">
                {finished ? "View" : "Open"}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
