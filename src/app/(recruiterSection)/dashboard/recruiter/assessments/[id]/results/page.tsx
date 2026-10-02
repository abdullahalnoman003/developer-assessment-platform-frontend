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
import { ErrorState } from "@/components/shared/error-state";
import { PaginationBar } from "@/components/shared/pagination-bar";
import {
  AttemptStatusBadge,
  InvitationStatusBadge,
  StatusBadge,
} from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, toUrlParamRecord } from "@/lib/format";
import { EMPTY_STATES, VALIDATION_MESSAGES } from "@/lib/messages";
import { dashboardMetadata } from "@/lib/seo";
import type { ResultRow } from "@/lib/types";
import { pagedQuerySchema } from "@/lib/validations";
import { assessmentService } from "@/service/assessments";

export const metadata: Metadata = dashboardMetadata("Assessment results");

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PAGE_SIZE = 10;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function buildColumns(
  assessmentId: string,
): readonly DataTableColumn<ResultRow>[] {
  return [
    {
      key: "candidate",
      header: "Candidate",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.candidate.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.candidate.email}
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
      key: "invitation",
      header: "Invitation",
      cell: (row) => <InvitationStatusBadge value={row.invitation.status} />,
    },
    {
      key: "score",
      header: "Score",
      cell: (row) =>
        row.score === null ? (
          <span className="text-xs text-muted-foreground">Not graded</span>
        ) : (
          <span className="text-sm font-medium tabular-nums">
            {row.score}
            <span className="text-muted-foreground">
              {" "}
              / {row.maxScore ?? "?"}
            </span>
          </span>
        ),
    },
    {
      key: "resultReleased",
      header: "Visible to candidate",
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
          {row.submittedAt ? formatDateTime(row.submittedAt) : "Not submitted"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Grade",
      cell: (row) => (
        <div className="flex justify-end">
          <Button
            render={
              <Link
                href={`/dashboard/recruiter/assessments/${assessmentId}/attempts/${row.id}`}
              />
            }
            size="sm"
            variant={row.status === "SUBMITTED" ? "default" : "outline"}
          >
            {row.status === "SUBMITTED" ? "Grade now" : "Open"}
          </Button>
        </div>
      ),
    },
  ];
}

export default async function AssessmentResultsPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const raw = await searchParams;

  const parsed = pagedQuerySchema.safeParse({ page: first(raw.page) });
  const page = parsed.success ? parsed.data.page : undefined;

  // The service always sends an explicit page/limit pair, so the default of 1
  // covers an absent or invalid `?page=`.
  const res = await assessmentService.results(id, page ?? 1, PAGE_SIZE);

  const urlParams = toUrlParamRecord(new URLSearchParams(toQueryString(raw)));
  const base = `/dashboard/recruiter/assessments/${id}`;

  if (!res.success || !res.data) {
    return (
      <>
        <DashboardPageHeader title="Results" />
        <ErrorState message={res.message || VALIDATION_MESSAGES.unknown} />
        <Button
          className="self-start"
          render={<Link href={base} />}
          size="sm"
          variant="outline"
        >
          Back to assessment
        </Button>
      </>
    );
  }

  const { items, meta } = res.data;
  const gradeable = items.filter((row) => row.status === "SUBMITTED").length;
  const columns = buildColumns(id);

  return (
    <>
      <DashboardPageHeader
        actions={
          <Button render={<Link href={base} />} size="sm" variant="outline">
            Back to assessment
          </Button>
        }
        description="One row per candidate who has actually started this assessment. Invitations that were never accepted do not appear."
        title="Results"
      />

      <DashboardPanel
        contentClassName="flex flex-col gap-4 p-0 sm:p-0"
        description={
          gradeable > 0
            ? `${meta.total} row${meta.total === 1 ? "" : "s"} · ${gradeable} waiting for you on this page`
            : `${meta.total} row${meta.total === 1 ? "" : "s"} in this view`
        }
        title="Attempts"
      >
        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              action={
                <Button render={<Link href={base} />} size="sm">
                  Open the assessment
                </Button>
              }
              body={
                page
                  ? "There is nothing on this page. Go back to the first page."
                  : "Nobody has started this assessment yet. Invited candidates show up here the moment they open it."
              }
              Icon={InboxIcon}
              title={
                page ? "Nothing on this page" : EMPTY_STATES.attempts.title
              }
            />
          </div>
        ) : (
          <>
            <DataTable
              caption="Attempts on this assessment with score, release state, and submission time"
              columns={columns}
              getRowKey={(row) => row.id}
              rows={items}
            />
            <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-center sm:justify-end">
              <PaginationBar
                label="attempts"
                meta={meta}
                pathname={`${base}/results`}
                searchParams={urlParams}
              />
            </div>
          </>
        )}
      </DashboardPanel>

      <p className="flex items-start gap-2 text-xs/relaxed text-muted-foreground">
        <GaugeIcon className="mt-0.5 size-3.5 shrink-0" />
        Only multiple-choice answers are scored automatically. Written and
        coding answers stay ungraded until you open the attempt and award
        points, and a result the candidate can see is only produced by that
        manual step.
      </p>
    </>
  );
}

function toQueryString(
  raw: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const single = first(value);
    if (single) params.set(key, single);
  }
  return params.toString();
}
