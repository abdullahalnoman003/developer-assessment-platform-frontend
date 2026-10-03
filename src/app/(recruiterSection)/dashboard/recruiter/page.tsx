import {
  ArrowRightIcon,
  Building2Icon,
  CircleAlertIcon,
  ClipboardListIcon,
  CoinsIcon,
  HelpCircleIcon,
  LayersIcon,
  PlusIcon,
  SendIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import {
  AssessmentFunnelChart,
  AttemptsDonutChart,
} from "@/components/shared/recruiter-charts";
import { StatsCards } from "@/components/shared/stats-cards";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";
import { EMPTY_STATES, VALIDATION_MESSAGES } from "@/lib/messages";
import { dashboardMetadata } from "@/lib/seo";
import type { CompanyDashboard } from "@/lib/types";
import { companyService } from "@/service/company";
import { questionService } from "@/service/questions";

export const metadata: Metadata = dashboardMetadata("Recruiter overview");

function ChartFallback() {
  return (
    <div
      aria-hidden
      className="flex h-56 flex-col items-center justify-center gap-3 border border-dashed border-border"
    >
      <Skeleton className="size-24 rounded-full" />
      <span className="sr-only">Loading chart…</span>
    </div>
  );
}

function OnboardingRail({
  stats,
  questionCount,
}: {
  stats: CompanyDashboard;
  questionCount: number;
}) {
  const steps = [
    {
      done: Boolean(stats.company.id),
      label: "Create your company",
      detail: "Questions and assessments both belong to a company.",
      href: "/dashboard/recruiter/company",
    },
    {
      done: questionCount > 0,
      label: "Add questions",
      detail: "Build a reusable bank you can pick from in any assessment.",
      href: "/dashboard/recruiter/questions",
    },
    {
      done: stats.assessmentCount > 0,
      label: "Build an assessment",
      detail: "Pick questions, set a time limit, then publish.",
      href: "/dashboard/recruiter/assessments/new",
    },
    {
      done: stats.invitationCount > 0,
      label: "Invite candidates",
      detail: "Send invitations by email from a published assessment.",
      href: "/dashboard/recruiter/assessments",
    },
  ];

  return (
    <ol className="flex flex-col divide-y divide-border">
      {steps.map((step) => (
        <li key={step.label} className="flex items-start gap-3 py-3 first:pt-0">
          <span
            aria-hidden
            className={
              step.done
                ? "mt-0.5 flex size-5 shrink-0 items-center justify-center border border-success/40 bg-success/10 font-mono text-[11px] text-success"
                : "mt-0.5 size-5 shrink-0 border border-border"
            }
          >
            {step.done ? "✓" : ""}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{step.label}</p>
            <p className="text-xs/relaxed text-muted-foreground">
              {step.detail}
            </p>
          </div>
          <Link
            className="mt-0.5 shrink-0 text-xs underline underline-offset-4"
            href={step.href}
          >
            {step.done ? "Open" : "Start"}
          </Link>
        </li>
      ))}
    </ol>
  );
}

export default async function RecruiterOverviewPage() {
  const [dashboard, questions] = await Promise.all([
    companyService.dashboard(),
    questionService.list({ limit: 1 }),
  ]);

  if (!dashboard.success || !dashboard.data) {
    return (
      <>
        <DashboardPageHeader title="Overview" />
        <ErrorState
          message={dashboard.message || VALIDATION_MESSAGES.unknown}
        />
      </>
    );
  }

  const stats = dashboard.data;
  const questionCount = questions.data?.meta.total ?? 0;

  if (dashboard.statusCode === 403 || !stats.company.id) {
    return (
      <>
        <DashboardPageHeader
          description="One company profile powers your question bank, your assessments, and your credit balance."
          title="Welcome to CodeArena"
        />
        <DashboardPanel>
          <EmptyState
            action={
              <Button render={<Link href="/dashboard/recruiter/company" />}>
                <Building2Icon className="size-4" />
                Set up your company
              </Button>
            }
            body={EMPTY_STATES.company.body}
            Icon={Building2Icon}
            title={EMPTY_STATES.company.title}
          />
        </DashboardPanel>
      </>
    );
  }

  const publishedCount = stats.assessmentsByStatus.PUBLISHED ?? 0;
  const awaitingGrading = stats.attemptsByStatus.SUBMITTED ?? 0;
  const pendingInvitations = stats.invitationsByStatus.PENDING ?? 0;
  const drafts = stats.assessmentsByStatus.DRAFT ?? 0;

  const needsAttention: {
    key: string;
    Icon: typeof CircleAlertIcon;
    title: string;
    body: string;
    href: string;
    cta: string;
  }[] = [];

  if (drafts > 0) {
    needsAttention.push({
      key: "drafts",
      Icon: ClipboardListIcon,
      title: `${formatNumber(drafts)} unpublished ${drafts === 1 ? "assessment" : "assessments"}`,
      body: "A draft stays invisible to candidates until you publish it.",
      href: "/dashboard/recruiter/assessments?status=DRAFT",
      cta: "Review drafts",
    });
  }

  if (awaitingGrading > 0) {
    needsAttention.push({
      key: "grading",
      Icon: CircleAlertIcon,
      title: `${formatNumber(awaitingGrading)} submitted ${awaitingGrading === 1 ? "attempt" : "attempts"} waiting to be graded`,
      body: "Written and coding answers stay hidden from the candidate until you release the result.",
      href: "/dashboard/recruiter/assessments?status=PUBLISHED",
      cta: "Open assessments",
    });
  }

  if (pendingInvitations > 0) {
    needsAttention.push({
      key: "pending",
      Icon: SendIcon,
      title: `${formatNumber(pendingInvitations)} ${pendingInvitations === 1 ? "invitation" : "invitations"} not yet answered`,
      body: "An invitation stays pending until the candidate accepts, declines, or it expires.",
      href: "/dashboard/recruiter/assessments?status=PUBLISHED",
      cta: "Open assessments",
    });
  }

  return (
    <>
      <DashboardPageHeader
        actions={
          <>
            <Button
              render={<Link href="/dashboard/recruiter/questions" />}
              size="sm"
              variant="outline"
            >
              <PlusIcon className="size-3.5" />
              Add question
            </Button>
            <Button
              render={<Link href="/dashboard/recruiter/assessments/new" />}
              size="sm"
            >
              <PlusIcon className="size-3.5" />
              New assessment
            </Button>
          </>
        }
        description={`${stats.company.name ?? "Your company"} — your hiring activity at a glance.`}
        title="Overview"
      />

      <StatsCards
        items={[
          {
            label: "Assessments",
            value: formatNumber(stats.assessmentCount),
            hint: `${formatNumber(publishedCount)} published`,
            Icon: ClipboardListIcon,
          },
          {
            label: "Invitations",
            value: formatNumber(stats.invitationCount),
            hint: `${formatNumber(pendingInvitations)} awaiting a reply`,
            Icon: SendIcon,
            tone: pendingInvitations > 0 ? "warning" : "default",
          },
          {
            label: "Attempts",
            value: formatNumber(stats.attemptCount),
            hint:
              awaitingGrading > 0
                ? `${formatNumber(awaitingGrading)} awaiting grading`
                : "None awaiting grading",
            Icon: LayersIcon,
            tone: awaitingGrading > 0 ? "warning" : "default",
          },
          {
            label: "Credits remaining",
            value: formatNumber(stats.company.creditsRemaining),
            hint: "Increases when a payment settles",
            Icon: CoinsIcon,
            tone: stats.company.creditsRemaining > 0 ? "success" : "danger",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardPanel
          description="How your assessment portfolio is distributed across the lifecycle."
          title="Assessment funnel"
        >
          <Suspense fallback={<ChartFallback />}>
            <AssessmentFunnelChart stats={stats} />
          </Suspense>
        </DashboardPanel>

        <DashboardPanel
          description="Where every candidate attempt currently sits."
          title="Attempts by status"
        >
          <Suspense fallback={<ChartFallback />}>
            <AttemptsDonutChart stats={stats} />
          </Suspense>
        </DashboardPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <DashboardPanel
          description="Only surfaced when there is something genuinely outstanding."
          title="Needs attention"
        >
          {needsAttention.length === 0 ? (
            <EmptyState
              body="Nothing is waiting on you. Unpublished assessments, ungraded submissions, and unanswered invitations would appear here."
              Icon={HelpCircleIcon}
              title="You are all caught up"
            />
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {needsAttention.map((item) => (
                <li
                  className="flex flex-wrap items-start gap-3 py-3 first:pt-0"
                  key={item.key}
                >
                  <item.Icon
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-warning"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs/relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                  <Link
                    className="mt-0.5 flex shrink-0 items-center gap-1 text-xs underline underline-offset-4"
                    href={item.href}
                  >
                    {item.cta}
                    <ArrowRightIcon className="size-3" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DashboardPanel>

        <DashboardPanel
          description="Track your setup. Each step unlocks the next."
          title="Get started"
        >
          <OnboardingRail questionCount={questionCount} stats={stats} />
        </DashboardPanel>
      </div>

      <DashboardPanel title="Where to go next">
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {NEXT_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                className="flex h-full flex-col gap-1 border border-border bg-background p-3 transition-colors hover:border-primary/50"
                href={link.href}
              >
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <link.Icon aria-hidden className="size-4 text-primary" />
                  {link.label}
                </span>
                <span className="text-xs/relaxed text-muted-foreground">
                  {link.body}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </DashboardPanel>

      <p className="text-xs/relaxed text-muted-foreground">
        Every figure on this page comes from{" "}
        <code className="font-mono">GET /companies/me/dashboard</code> and{" "}
        <code className="font-mono">GET /questions</code>. Credits are shown
        exactly as the API stores them — CodeArena never simulates a balance
        locally.
      </p>
    </>
  );
}

const NEXT_LINKS = [
  {
    href: "/dashboard/recruiter/questions",
    label: "Question bank",
    body: "Write MCQ, written, and coding questions once and reuse them.",
    Icon: HelpCircleIcon,
  },
  {
    href: "/dashboard/recruiter/assessments",
    label: "All assessments",
    body: "Filter by lifecycle state, sort, and open any assessment.",
    Icon: ClipboardListIcon,
  },
  {
    href: "/dashboard/recruiter/assessments/new",
    label: "Build an assessment",
    body: "Three steps: details, pick questions, review and publish.",
    Icon: LayersIcon,
  },
  {
    href: "/dashboard/recruiter/company",
    label: "Company profile",
    body: "Name, website, and logo shown on your candidate invitations.",
    Icon: Building2Icon,
  },
  {
    href: "/dashboard/recruiter/billing",
    label: "Credits & payments",
    body: "Buy a credit pack with Stripe test-mode checkout.",
    Icon: CoinsIcon,
  },
] as const;
