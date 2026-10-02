import { LockIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ResultReview } from "@/app/(candidateSection)/_components/result-review";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState, InlineNotice } from "@/components/shared/error-state";
import { ScoreRing } from "@/components/shared/score-ring";
import {
  AttemptStatusBadge,
  StatusBadge,
} from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatNumber } from "@/lib/format";
import { EMPTY_STATES, VALIDATION_MESSAGES } from "@/lib/messages";
import { dashboardMetadata } from "@/lib/seo";
import type { AttemptDetail } from "@/lib/types";
import { attemptService } from "@/service/attempts";

export const metadata: Metadata = dashboardMetadata("Attempt result");

type Params = Promise<{ id: string }>;

export default async function CandidateAttemptResultPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const res = await attemptService.detail(id);

  if (!res.success || !res.data) {
    return (
      <>
        <DashboardPageHeader title="Result" />
        <ErrorState
          message={res.message || VALIDATION_MESSAGES.unknown}
          title={
            res.statusCode === 404
              ? "That attempt does not exist"
              : "Could not load this result"
          }
        />
        <Button
          className="self-start"
          render={<Link href="/dashboard/candidate/results" />}
          size="sm"
          variant="outline"
        >
          Back to results
        </Button>
      </>
    );
  }

  const attempt = res.data;
  const assessment = attempt.invitation.assessment;
  const released = attempt.resultReleased;

  return (
    <>
      <DashboardPageHeader
        actions={
          <Button
            render={<Link href="/dashboard/candidate/results" />}
            size="sm"
            variant="outline"
          >
            All results
          </Button>
        }
        description={assessment.title}
        title="Result"
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem] lg:items-start">
        <DashboardPanel
          description={
            released
              ? "Every question in the assessment, including the ones you left blank."
              : "Nothing about the score is available until the evaluator releases it."
          }
          title="Question review"
        >
          {released ? (
            <ResultReview
              answers={attempt.answers}
              questions={assessment.questions}
              released={released}
            />
          ) : (
            <EmptyState
              body={EMPTY_STATES.unreleasedResult.body}
              Icon={LockIcon}
              title={EMPTY_STATES.unreleasedResult.title}
            />
          )}
        </DashboardPanel>

        <div className="flex flex-col gap-4">
          <DashboardPanel title="Score">
            {released ? (
              <ScoreSummary attempt={attempt} />
            ) : (
              <div className="flex flex-col items-center gap-3 py-2">
                <span
                  aria-hidden
                  className="flex size-12 items-center justify-center border border-border text-muted-foreground"
                >
                  <LockIcon className="size-5" />
                </span>
                <p className="text-center text-sm/relaxed text-muted-foreground">
                  Withheld until the evaluator releases the result.
                </p>
              </div>
            )}

            {/* The pass mark is the target, not the result, so it is shown in
                both branches — otherwise a locked page carries no information
                at all. */}
            <PassMarkNote attempt={attempt} />
          </DashboardPanel>

          <DashboardPanel title="Attempt">
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <AttemptStatusBadge value={attempt.status} />
                </dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-muted-foreground">Started</dt>
                <dd className="text-xs">{formatDateTime(attempt.startedAt)}</dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-muted-foreground">Submitted</dt>
                <dd className="text-xs">
                  {formatDateTime(attempt.submittedAt)}
                </dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-muted-foreground">Time limit</dt>
                <dd className="text-xs tabular-nums">
                  {assessment.durationMins} min
                </dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-muted-foreground">Result</dt>
                <dd>
                  {released ? (
                    <StatusBadge dot={false} label="Released" tone="success" />
                  ) : (
                    <StatusBadge dot={false} label="Private" tone="neutral" />
                  )}
                </dd>
              </div>
            </dl>
          </DashboardPanel>

          {attempt.evaluatorNote ? (
            <DashboardPanel
              description="Written by the evaluator. Read-only — the API has no route to change it after the fact."
              title="Evaluator note"
            >
              <p className="text-sm/relaxed whitespace-pre-wrap">
                {attempt.evaluatorNote}
              </p>
            </DashboardPanel>
          ) : null}
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */

function ScoreSummary({ attempt }: { attempt: AttemptDetail }) {
  const { score, maxScore } = attempt;
  const scored = score !== null;
  const percent = scored && maxScore ? (score / maxScore) * 100 : null;
  // `passScore` is stored in **points**, not percent — the recruiter form labels
  // it "Pass mark (points)". The API never evaluates it, so the comparison is
  // made here and labelled as such rather than guessed.
  const passScore = attempt.invitation.assessment.passScore;
  const passed = scored && passScore !== null && score >= passScore;

  return (
    <div className="flex flex-col items-center gap-3">
      <ScoreRing
        caption={maxScore ? `of ${maxScore} pts` : "points"}
        label={
          scored ? `Score ${score} of ${maxScore ?? 0} points` : "Not scored"
        }
        percent={percent}
        tone={passed ? "success" : scored ? "danger" : "neutral"}
        value={scored ? String(score) : "—"}
      />

      {scored ? (
        passed ? (
          <StatusBadge label="Pass mark met" tone="success" />
        ) : (
          <StatusBadge label="Below the pass mark" tone="danger" />
        )
      ) : (
        <StatusBadge dot={false} label="Not scored yet" tone="warning" />
      )}
    </div>
  );
}

/**
 * Rendered in both the locked and the released branch. The pass mark is the
 * target rather than the result, so hiding it behind the release would leave
 * the locked page with nothing to say. It states plainly that the API stores
 * the mark without evaluating it, and calls out the case where the mark cannot
 * be reached — the seeded "Backend Engineer Test" carries `passScore: 70` on a
 * 3-point assessment, and rendering that as a plain failure would mislead.
 */
function PassMarkNote({ attempt }: { attempt: AttemptDetail }) {
  const passScore = attempt.invitation.assessment.passScore;
  const maxScore = attempt.maxScore;

  if (passScore === null) {
    return (
      <p className="mt-3 text-center text-xs/relaxed text-muted-foreground">
        This assessment has no pass mark.
      </p>
    );
  }

  const unreachable = maxScore !== null && passScore > maxScore;

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
      <p className="text-center text-xs/relaxed text-muted-foreground">
        Pass mark {formatNumber(passScore)} of {formatNumber(maxScore ?? 0)}{" "}
        points. CodeArena makes the comparison on your screen — the API stores
        the pass mark but never evaluates it.
      </p>
      {unreachable ? (
        <InlineNotice
          body={`The pass mark is ${formatNumber(passScore)} points but the whole assessment is only worth ${formatNumber(maxScore ?? 0)}, so no attempt can reach it. That is the value the recruiter entered and it is not adjusted here.`}
          title="This pass mark cannot be reached"
          tone="warning"
        />
      ) : null}
    </div>
  );
}
