import { GaugeIcon, InboxIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState, InlineNotice } from "@/components/shared/error-state";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { ScoreRing } from "@/components/shared/score-ring";
import {
  AttemptStatusBadge,
  StatusBadge,
} from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatNumber, toUrlParamRecord } from "@/lib/format";
import { EMPTY_STATES, VALIDATION_MESSAGES } from "@/lib/messages";
import { dashboardMetadata } from "@/lib/seo";
import type { AttemptStatus, PaginatedMeta } from "@/lib/types";
import { pagedQuerySchema } from "@/lib/validations";
import { attemptService } from "@/service/attempts";
import { invitationService } from "@/service/invitations";

export const metadata: Metadata = dashboardMetadata("My results");

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PAGE_SIZE = 10;

const MAX_INVITATIONS = 100;

interface ResultRow {
  attemptId: string;
  title: string;
  durationMins: number;
  status: AttemptStatus;
  resultReleased: boolean;
  score: number | null;
  maxScore: number | null;
  submittedAt: string | null;
  startedAt: string | null;
  detailLoaded: boolean;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toQueryRecord(
  raw: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const single = first(value);
    if (single) params.set(key, single);
  }
  return toUrlParamRecord(params);
}

async function loadPage(rows: ResultRow[]): Promise<ResultRow[]> {
  const hydrated = await Promise.all(
    rows.map(async (row) => {
      const res = await attemptService.detail(row.attemptId);
      if (!res.success || !res.data) return row;

      return {
        ...row,
        status: res.data.status,
        resultReleased: res.data.resultReleased,
        score: res.data.score,
        maxScore: res.data.maxScore,
        submittedAt: res.data.submittedAt,
        startedAt: res.data.startedAt,
        detailLoaded: true,
      };
    }),
  );

  return hydrated;
}

function buildColumns(): readonly DataTableColumn<ResultRow>[] {
  return [
    {
      key: "assessment",
      header: "Assessment",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.durationMins} min limit
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Attempt",
      cell: (row) => <AttemptStatusBadge value={row.status} />,
    },
    {
      key: "score",
      header: "Score",
      cell: (row) => {
        if (!row.detailLoaded) {
          return (
            <span className="text-xs text-muted-foreground">
              Could not load
            </span>
          );
        }
        if (!row.resultReleased) {
          return (
            <span className="text-xs text-muted-foreground">
              Hidden until released
            </span>
          );
        }
        if (row.score === null) {
          return (
            <span className="text-xs text-muted-foreground">Not scored</span>
          );
        }
        return (
          <span className="text-sm font-medium tabular-nums">
            {row.score}
            <span className="text-muted-foreground">
              {" "}
              / {row.maxScore ?? "?"}
            </span>
          </span>
        );
      },
    },
    {
      key: "visibility",
      header: "Result",
      cell: (row) =>
        row.resultReleased ? (
          <StatusBadge dot={false} label="Released" tone="success" />
        ) : (
          <StatusBadge dot={false} label="Private" tone="neutral" />
        ),
    },
    {
      key: "submittedAt",
      header: "Submitted",
      cell: (row) => (
        <span className="text-xs whitespace-nowrap text-muted-foreground">
          {!row.detailLoaded
            ? "—"
            : row.submittedAt
              ? formatDateTime(row.submittedAt)
              : row.startedAt
                ? `Started ${formatDateTime(row.startedAt)}`
                : "Not started"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Detail",
      cell: (row) => (
        <div className="flex justify-end">
          <Button
            render={
              <Link
                href={`/dashboard/candidate/attempts/${row.attemptId}/result`}
              />
            }
            size="sm"
            variant={row.resultReleased ? "default" : "outline"}
          >
            {row.resultReleased ? "View result" : "Open"}
          </Button>
        </div>
      ),
    },
  ];
}

export default async function CandidateResultsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;
  const parsed = pagedQuerySchema.safeParse({ page: first(raw.page) });
  const page = parsed.success ? (parsed.data.page ?? 1) : 1;

  const res = await invitationService.listForCandidate({
    limit: MAX_INVITATIONS,
  });

  if (!res.success || !res.data) {
    return (
      <>
        <DashboardPageHeader title="Results" />
        <ErrorState message={res.message || VALIDATION_MESSAGES.unknown} />
      </>
    );
  }

  const { items, meta: invitationMeta } = res.data;

  const all: ResultRow[] = items
    .filter((item) => item.attempt !== null)
    .map((item) => ({
      attemptId: item.attempt?.id ?? "",
      title: item.assessment.title,
      durationMins: item.assessment.durationMins,
      status: item.attempt?.status ?? "NOT_STARTED",
      resultReleased: item.attempt?.resultReleased ?? false,
      score: null,
      maxScore: null,
      submittedAt: null,
      startedAt: null,
      detailLoaded: false,
    }))
    .reverse();

  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const slice = all.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rows = await loadPage(slice);

  const meta: PaginatedMeta = {
    page: safePage,
    limit: PAGE_SIZE,
    total: all.length,
    totalPages,
  };

  const evaluated = all.filter((row) => row.status === "EVALUATED").length;
  const releasedCount = all.filter((row) => row.resultReleased).length;
  const failedReads = rows.filter((row) => !row.detailLoaded).length;

  const percents = rows
    .filter(
      (row) =>
        row.detailLoaded &&
        row.resultReleased &&
        row.maxScore &&
        row.score !== null,
    )
    .map((row) => ((row.score ?? 0) / (row.maxScore ?? 1)) * 100);
  const averagePercent =
    percents.length > 0
      ? percents.reduce((sum, value) => sum + value, 0) / percents.length
      : null;
  const columns = buildColumns();

  return (
    <>
      <DashboardPageHeader
        description="One row per assessment you started. A score appears only once the recruiter has released the result."
        title="Results"
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <DashboardPanel
          description={
            releasedCount > 0
              ? `${formatNumber(releasedCount)} of ${formatNumber(all.length)} attempts have a released result.`
              : `No result has been released yet across ${formatNumber(all.length)} attempts.`
          }
          title="Summary"
        >
          <dl className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                Attempts
              </dt>
              <dd className="font-heading text-2xl font-semibold tabular-nums">
                {formatNumber(all.length)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                Evaluated
              </dt>
              <dd className="font-heading text-2xl font-semibold tabular-nums">
                {formatNumber(evaluated)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                Released
              </dt>
              <dd className="font-heading text-2xl font-semibold tabular-nums">
                {formatNumber(releasedCount)}
              </dd>
            </div>
          </dl>
        </DashboardPanel>

        {averagePercent !== null ? (
          <DashboardPanel className="lg:w-56" title="Average score">
            <div className="flex flex-col items-center gap-2">
              <ScoreRing
                caption="percent"
                label={`Average score ${averagePercent.toFixed(1)} percent across ${percents.length} released results on this page`}
                percent={averagePercent / 100}
                tone="neutral"
                value={`${averagePercent.toFixed(0)}%`}
              />
              <p className="text-center text-xs text-muted-foreground">
                Across the {formatNumber(percents.length)} released{" "}
                {percents.length === 1 ? "result" : "results"} on this page.
              </p>
            </div>
          </DashboardPanel>
        ) : null}
      </div>

      <DashboardPanel
        contentClassName="flex flex-col gap-4 p-0 sm:p-0"
        description={`${formatNumber(meta.total)} ${meta.total === 1 ? "attempt" : "attempts"} in this view`}
        title="Attempts"
      >
        {rows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              action={
                <Button
                  render={<Link href="/dashboard/candidate/invitations" />}
                  size="sm"
                >
                  Go to invitations
                </Button>
              }
              body={
                page > 1
                  ? "There is nothing on this page. Go back to the first page."
                  : EMPTY_STATES.myAttempts.body
              }
              Icon={InboxIcon}
              title={
                page > 1
                  ? "Nothing on this page"
                  : all.length === 0
                    ? EMPTY_STATES.myAttempts.title
                    : EMPTY_STATES.results.title
              }
            />
          </div>
        ) : (
          <>
            <DataTable
              caption="Your assessment attempts with score, release state and submission time"
              columns={columns}
              getRowKey={(row) => row.attemptId}
              rows={rows}
            />
            <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-center sm:justify-end">
              <PaginationBar
                label="attempts"
                meta={meta}
                pathname="/dashboard/candidate/results"
                searchParams={toQueryRecord(raw)}
              />
            </div>
          </>
        )}
      </DashboardPanel>

      {failedReads > 0 ? (
        <InlineNotice
          body={`${failedReads} row${failedReads === 1 ? "" : "s"} on this page could not be read from the API, so the score and submission time are shown as unavailable rather than as zero. Open the attempt directly for the detail, or reload the page.`}
          title="Some rows could not be loaded"
          tone="warning"
        />
      ) : null}

      <p className="flex items-start gap-2 text-xs/relaxed text-muted-foreground">
        <GaugeIcon className="mt-0.5 size-3.5 shrink-0" />
        This page has no endpoint of its own. It is assembled from{" "}
        <code className="font-mono">GET /invitations/me</code> and one{" "}
        <code className="font-mono">GET /attempts/:id</code> per row on this
        page, because the API refuses{" "}
        <code className="font-mono">GET /assessments/:id/results</code> to a
        candidate.{" "}
        {invitationMeta.total > MAX_INVITATIONS
          ? `You have more than ${formatNumber(MAX_INVITATIONS)} invitations, which the API will not return in one call, so this list covers the most recent ${formatNumber(MAX_INVITATIONS)}.`
          : null}
      </p>
    </>
  );
}
