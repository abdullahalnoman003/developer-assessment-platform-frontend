import { ArrowLeftIcon, GaugeIcon, LockIcon, UnlockIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  type GradingQuestion,
  GradingWorkspace,
} from "@/app/(recruiterSection)/_components/grading-workspace";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { ErrorState, NotFoundState } from "@/components/shared/error-state";
import {
  AttemptStatusBadge,
  StatusBadge,
} from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, pluralize } from "@/lib/format";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import { dashboardMetadata } from "@/lib/seo";
import { attemptService } from "@/service/attempts";

export const metadata: Metadata = dashboardMetadata("Grade attempt");

type Params = Promise<{ id: string; attemptId: string }>;

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-2 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-sm break-words">{value}</dd>
    </div>
  );
}

export default async function GradeAttemptPage({ params }: { params: Params }) {
  const { id, attemptId } = await params;

  const res = await attemptService.detail(attemptId);

  if (res.statusCode === 404) {
    return (
      <>
        <DashboardPageHeader title="Attempt not found" />
        <NotFoundState message={res.message || VALIDATION_MESSAGES.notFound} />
        <Button
          className="self-start"
          render={
            <Link href={`/dashboard/recruiter/assessments/${id}/results`} />
          }
          size="sm"
          variant="outline"
        >
          Back to results
        </Button>
      </>
    );
  }

  if (!res.success || !res.data) {
    return (
      <>
        <DashboardPageHeader title="Grade attempt" />
        <ErrorState message={res.message || VALIDATION_MESSAGES.unknown} />
      </>
    );
  }

  const attempt = res.data;
  const ordered = [...attempt.invitation.assessment.questions].sort(
    (a, b) => a.order - b.order,
  );

  const items: GradingQuestion[] = ordered.map((entry) => {
    const answer = attempt.answers.find(
      (candidate) => candidate.questionId === entry.questionId,
    );
    return {
      entry,
      answer,
      awarded: answer?.pointsAwarded ?? null,
    };
  });

  const resultsHref = `/dashboard/recruiter/assessments/${id}/results`;

  return (
    <>
      <DashboardPageHeader
        actions={
          <Button
            render={<Link href={resultsHref} />}
            size="sm"
            variant="outline"
          >
            <ArrowLeftIcon className="size-3.5" />
            Back to results
          </Button>
        }
        description={attempt.invitation.assessment.title}
        title="Grade attempt"
      />

      <DashboardPanel
        actions={
          <div className="flex items-center gap-2">
            <AttemptStatusBadge value={attempt.status} />
            {attempt.resultReleased ? (
              <StatusBadge dot={false} label="Released" tone="success" />
            ) : (
              <StatusBadge dot={false} label="Private" tone="neutral" />
            )}
          </div>
        }
        description="Timestamps and score exactly as stored by the API."
        title="Attempt"
      >
        <dl className="flex flex-col">
          <DetailRow
            label="Started"
            value={attempt.startedAt ? formatDateTime(attempt.startedAt) : "—"}
          />
          <DetailRow
            label="Submitted"
            value={
              attempt.submittedAt
                ? formatDateTime(attempt.submittedAt)
                : "Not submitted"
            }
          />
          <DetailRow
            label="Deadline"
            value={attempt.deadline ? formatDateTime(attempt.deadline) : "—"}
          />
          <DetailRow
            label="Time limit"
            value={pluralize(
              attempt.invitation.assessment.durationMins,
              "minute",
            )}
          />
          <DetailRow
            label="Score"
            value={
              attempt.score === null
                ? "Not graded"
                : `${attempt.score} of ${attempt.maxScore ?? "?"} points`
            }
          />
          <DetailRow
            label="Evaluator note"
            value={
              attempt.evaluatorNote
                ? attempt.evaluatorNote
                : "Not supported — the API has no field to write it"
            }
          />
        </dl>
      </DashboardPanel>

      <DashboardPanel
        description={
          attempt.status === "SUBMITTED"
            ? "Award points for the written and coding answers. Multiple choice is already scored."
            : "Every answer is shown, but the scores can no longer be changed."
        }
        title="Answers"
      >
        <GradingWorkspace
          attemptId={attempt.id}
          candidateId={attempt.candidateId}
          items={items}
          maxScore={attempt.maxScore}
          resultReleased={attempt.resultReleased}
          status={attempt.status}
        />
      </DashboardPanel>

      <p className="flex items-start gap-2 text-xs/relaxed text-muted-foreground">
        {attempt.resultReleased ? (
          <UnlockIcon className="mt-0.5 size-3.5 shrink-0" />
        ) : (
          <LockIcon className="mt-0.5 size-3.5 shrink-0" />
        )}
        <GaugeIcon className="mt-0.5 size-3.5 shrink-0" />A result becomes
        visible to the candidate only through the release checkbox on the
        evaluation, and the score shown here is the sum of the points you award
        plus the automatically scored multiple-choice answers.
      </p>
    </>
  );
}
