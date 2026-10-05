import {
  ClipboardListIcon,
  GaugeIcon,
  ListChecksIcon,
  SendIcon,
  TimerIcon,
  UsersIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { AdvanceAssessmentDialog } from "@/app/(recruiterSection)/_components/advance-assessment-dialog";
import { AssessmentDeleteButton } from "@/app/(recruiterSection)/_components/assessment-delete-button";
import { AssessmentEditDialog } from "@/app/(recruiterSection)/_components/assessment-edit-dialog";
import { AssessmentLifecycleRail } from "@/app/(recruiterSection)/_components/assessment-lifecycle-rail";
import { AssessmentQuestionsDialog } from "@/app/(recruiterSection)/_components/assessment-questions-dialog";
import { InviteCandidatesDialog } from "@/app/(recruiterSection)/_components/invite-candidates-dialog";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState, NotFoundState } from "@/components/shared/error-state";
import { StatsCards } from "@/components/shared/stats-cards";
import {
  AssessmentStatusBadge,
  DifficultyBadge,
  QuestionTypeBadge,
} from "@/components/shared/status-badge";
import { LinkButton } from "@/components/ui/link-button";
import {
  ASSESSMENT_NEXT_STATUS,
  ASSESSMENT_STATUS_LABELS,
} from "@/lib/constants";
import { formatDateTime, formatNumber, pluralize } from "@/lib/format";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import { dashboardMetadata } from "@/lib/seo";
import type { AssessmentDetail, AssessmentStatus } from "@/lib/types";
import { assessmentService } from "@/service/assessments";
import { companyService } from "@/service/company";
import { questionService } from "@/service/questions";

export const metadata: Metadata = dashboardMetadata("Assessment detail");

type Params = Promise<{ id: string }>;

const ACTION_LABELS: Partial<
  Record<AssessmentStatus, { trigger: string; destructive: boolean }>
> = {
  DRAFT: { trigger: "Publish", destructive: false },
  PUBLISHED: { trigger: "Close assessment", destructive: true },
  CLOSED: { trigger: "Archive", destructive: true },
};

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

function statusBreakdown(counts: Partial<Record<string, number>>): string {
  const parts = Object.entries(counts)
    .filter(([, value]) => (value ?? 0) > 0)
    .map(([key, value]) => `${value} ${key.toLowerCase()}`);
  return parts.length > 0 ? parts.join(" · ") : "none yet";
}

export default async function RecruiterAssessmentDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const res = await assessmentService.detail(id);

  if (res.statusCode === 404) {
    return (
      <>
        <DashboardPageHeader title="Assessment not found" />
        <NotFoundState message={res.message || VALIDATION_MESSAGES.notFound} />
        <LinkButton
          className="self-start"
          href="/dashboard/recruiter/assessments"
          size="sm"
          variant="outline"
        >
          Back to assessments
        </LinkButton>
      </>
    );
  }

  if (!res.success || !res.data) {
    return (
      <>
        <DashboardPageHeader title="Assessment detail" />
        <ErrorState message={res.message || VALIDATION_MESSAGES.unknown} />
      </>
    );
  }

  const assessment: AssessmentDetail = res.data;
  const { stats } = assessment;
  const isDraft = assessment.status === "DRAFT";
  const canInvite =
    assessment.status === "PUBLISHED" || assessment.status === "CLOSED";
  const next = ASSESSMENT_NEXT_STATUS[assessment.status] ?? null;
  const actionLabels = ACTION_LABELS[assessment.status] ?? null;
  const totalPoints = assessment.questions.length;

  const [bank, company] = await Promise.all([
    isDraft
      ? questionService.list({ limit: 100 })
      : Promise.resolve({ success: true as const, data: null }),
    canInvite ? companyService.get() : Promise.resolve(null),
  ]);

  const questions = bank.success ? (bank.data?.items ?? []) : [];
  const credits = company?.success ? (company.data?.creditsRemaining ?? 0) : 0;
  const bankTruncated =
    isDraft && bank.success && (bank.data?.meta.total ?? 0) > questions.length;

  const questionsDialog =
    isDraft && bank.success ? (
      <AssessmentQuestionsDialog
        assessmentId={id}
        questions={questions}
        selectedIds={assessment.questions.map((q) => q.questionId)}
      />
    ) : null;

  return (
    <>
      <DashboardPageHeader
        actions={
          <>
            <LinkButton
              href={`/dashboard/recruiter/assessments/${id}/results`}
              size="sm"
              variant="outline"
            >
              <ClipboardListIcon className="size-3.5" />
              Results
            </LinkButton>

            {isDraft ? (
              <>
                <AssessmentEditDialog assessment={assessment} />
                {questionsDialog}
              </>
            ) : null}

            {canInvite ? (
              <InviteCandidatesDialog
                alreadyInvited={stats.invitationCount}
                assessmentId={id}
                remainingCredits={Math.max(credits - stats.invitationCount, 0)}
              />
            ) : null}

            {next && actionLabels ? (
              <AdvanceAssessmentDialog
                assessmentId={id}
                questionCount={totalPoints}
                target={next}
                triggerLabel={actionLabels.trigger}
              />
            ) : null}

            <AssessmentDeleteButton
              assessmentId={id}
              attemptCount={stats.attemptCount}
              title={assessment.title}
            />
          </>
        }
        description={assessment.description ?? "No description"}
        title={assessment.title}
      />

      <StatsCards
        items={[
          {
            label: "Status",
            value: <AssessmentStatusBadge value={assessment.status} />,
            hint: ASSESSMENT_STATUS_LABELS[assessment.status],
            Icon: GaugeIcon,
            tone: isDraft ? "default" : "accent",
          },
          {
            label: "Questions",
            value: formatNumber(totalPoints),
            hint:
              totalPoints === 0
                ? "Cannot be published while empty"
                : `Worth ${pluralize(totalPoints, "point")} in total`,
            Icon: ListChecksIcon,
            tone: totalPoints === 0 ? "warning" : "default",
          },
          {
            label: "Invitations",
            value: formatNumber(stats.invitationCount),
            hint: statusBreakdown(stats.invitationsByStatus),
            Icon: SendIcon,
            tone: "default",
          },
          {
            label: "Attempts",
            value: formatNumber(stats.attemptCount),
            hint:
              stats.averageScore === null
                ? "No evaluated attempts yet"
                : `Average ${stats.averageScore.toFixed(1)} pts across evaluated attempts`,
            Icon: UsersIcon,
            tone: "default",
          },
        ]}
      />

      <DashboardPanel
        description="The API only accepts the immediate next state, and ARCHIVED is terminal."
        title="Lifecycle"
      >
        <AssessmentLifecycleRail status={assessment.status} />
      </DashboardPanel>

      <DashboardPanel
        description="Exactly what was stored by the last write."
        title="Details"
      >
        <dl className="flex flex-col">
          <DetailRow label="Identifier" value={assessment.id} />
          <DetailRow
            label="Time limit"
            value={pluralize(assessment.durationMins, "minute")}
          />
          <DetailRow
            label="Pass mark"
            value={
              assessment.passScore === null
                ? "Not set"
                : `${assessment.passScore} points, as stored`
            }
          />
          <DetailRow
            label="Created"
            value={formatDateTime(assessment.createdAt)}
          />
          <DetailRow
            label="Updated"
            value={formatDateTime(assessment.updatedAt)}
          />
        </dl>
      </DashboardPanel>

      <DashboardPanel
        actions={isDraft ? questionsDialog : null}
        description={
          isDraft
            ? bank.success
              ? bankTruncated
                ? `Your bank holds ${bank.data?.meta.total} questions; the first ${questions.length} are loaded here, so an older question may need searching for on the questions page.`
                : "Click a question to change the list or its order."
              : "Your question bank could not be loaded, so the list cannot be changed from here."
            : "The order below is fixed — question changes are only possible while the assessment is a draft."
        }
        title={`Questions (${totalPoints})`}
      >
        {totalPoints === 0 ? (
          <EmptyState
            action={isDraft && questions.length > 0 ? questionsDialog : null}
            body={
              !isDraft
                ? "This assessment has no questions attached."
                : !bank.success
                  ? "The question bank request failed, so nothing can be attached right now. Reload the page to try again."
                  : questions.length === 0
                    ? "Your question bank is empty, so there is nothing to attach yet. Create a question first."
                    : "Nothing is attached yet. A draft with no questions cannot be published, so pick at least one before you publish."
            }
            Icon={ListChecksIcon}
            title={
              !isDraft
                ? "No questions attached"
                : !bank.success
                  ? "Question bank unavailable"
                  : questions.length === 0
                    ? "No questions in your bank"
                    : "No questions attached"
            }
          />
        ) : (
          <ol className="flex flex-col divide-y divide-border/70">
            {assessment.questions.map((entry, index) => (
              <li className="flex flex-col gap-2 py-3" key={entry.questionId}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {entry.question.title}
                  </span>
                  <QuestionTypeBadge value={entry.question.type} />
                  <DifficultyBadge value={entry.question.difficulty} />
                </div>
                <p className="pl-8 text-xs/relaxed text-muted-foreground">
                  {entry.points} {entry.points === 1 ? "point" : "points"} ·{" "}
                  {entry.question.id}
                </p>
              </li>
            ))}
          </ol>
        )}
      </DashboardPanel>

      <p className="flex items-start gap-2 text-xs/relaxed text-muted-foreground">
        <TimerIcon className="mt-0.5 size-3.5 shrink-0" />
        The time limit starts when the candidate opens the assessment, not when
        the invitation is sent, and the backend does not extend it — the
        deadline on each attempt is fixed at start time.
      </p>
    </>
  );
}
