import { ClipboardListIcon, PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  AssessmentFilters,
  SortableHeader,
} from "@/app/(recruiterSection)/_components/assessment-filters";
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
import {
  PageSizeNote,
  PaginationBar,
} from "@/components/shared/pagination-bar";
import { AssessmentStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  pluralize,
  toUrlParamRecord,
  truncate,
} from "@/lib/format";
import { EMPTY_STATES, VALIDATION_MESSAGES } from "@/lib/messages";
import { dashboardMetadata } from "@/lib/seo";
import type { AssessmentListItem, UrlParamRecord } from "@/lib/types";
import { assessmentQuerySchema } from "@/lib/validations";
import { assessmentService } from "@/service/assessments";

export const metadata: Metadata = dashboardMetadata("Assessments");

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PATHNAME = "/dashboard/recruiter/assessments";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * `_count` is present on the list payload (verified against the live API) but
 * absent from every `PATCH /assessments/:id` response, so counts are only ever
 * read from the list route or the detail route.
 */
function buildColumns(
  urlParams: UrlParamRecord,
  sortBy: string,
  sortOrder: string,
): readonly DataTableColumn<AssessmentListItem>[] {
  return [
    {
      key: "title",
      header: (
        <SortableHeader
          column="title"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          label="Assessment"
          pathname={PATHNAME}
          searchParams={urlParams}
        />
      ),
      cell: (assessment) => (
        <div className="min-w-0">
          <Link
            className="block truncate font-medium underline-offset-4 hover:underline"
            href={`${PATHNAME}/${assessment.id}`}
          >
            {assessment.title}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            {assessment.description
              ? truncate(assessment.description, 80)
              : "No description"}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (assessment) => <AssessmentStatusBadge value={assessment.status} />,
    },
    {
      key: "durationMins",
      header: "Time limit",
      cell: (assessment) => (
        <span className="text-xs whitespace-nowrap tabular-nums">
          {pluralize(assessment.durationMins, "min")}
        </span>
      ),
    },
    {
      key: "passScore",
      header: "Pass mark",
      cell: (assessment) => (
        <span className="text-xs tabular-nums">
          {assessment.passScore === null
            ? "Not set"
            : `${assessment.passScore} pts`}
        </span>
      ),
    },
    {
      key: "questions",
      header: "Questions",
      cell: (assessment) => (
        <span className="text-xs tabular-nums text-muted-foreground">
          {assessment._count.questions}
        </span>
      ),
    },
    {
      key: "invitations",
      header: "Invited",
      cell: (assessment) => (
        <span className="text-xs tabular-nums text-muted-foreground">
          {assessment._count.invitations}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: (
        <SortableHeader
          column="createdAt"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          label="Created"
          pathname={PATHNAME}
          searchParams={urlParams}
        />
      ),
      cell: (assessment) => (
        <span className="text-xs whitespace-nowrap text-muted-foreground">
          {formatDate(assessment.createdAt)}
        </span>
      ),
    },
  ];
}

export default async function RecruiterAssessmentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;
  const parsed = assessmentQuerySchema.safeParse({
    limit: first(raw.limit),
    page: first(raw.page),
    sortBy: first(raw.sortBy),
    sortOrder: first(raw.sortOrder),
    status: first(raw.status),
  });
  const filters = parsed.success ? parsed.data : {};

  const res = await assessmentService.list(filters);

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const single = first(value);
    if (single) params.set(key, single);
  }
  const urlParams = toUrlParamRecord(params);

  if (!res.success || !res.data) {
    return (
      <>
        <DashboardPageHeader title="Assessments" />
        <ErrorState message={res.message || VALIDATION_MESSAGES.unknown} />
      </>
    );
  }

  const { items, meta } = res.data;
  const isFiltered = Boolean(filters.status || filters.sortBy || filters.page);
  const columns = buildColumns(
    urlParams,
    filters.sortBy ?? "",
    filters.sortOrder ?? "",
  );

  return (
    <>
      <DashboardPageHeader
        actions={
          <Button render={<Link href={`${PATHNAME}/new`} />} size="sm">
            <PlusIcon className="size-3.5" />
            New assessment
          </Button>
        }
        description="Build an assessment from your question bank, publish it, then invite candidates by email."
        title="Assessments"
      />

      <Suspense>
        <AssessmentFilters />
      </Suspense>

      <DashboardPanel
        contentClassName="flex flex-col gap-4 p-0 sm:p-0"
        description={`${meta.total} ${meta.total === 1 ? "assessment" : "assessments"} in this view`}
        title="All assessments"
      >
        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              action={
                <Button render={<Link href={`${PATHNAME}/new`} />} size="sm">
                  <PlusIcon className="size-3.5" />
                  New assessment
                </Button>
              }
              body={
                isFiltered
                  ? "No assessments match this filter. Clear it to see everything you have built."
                  : EMPTY_STATES.assessments.body
              }
              Icon={ClipboardListIcon}
              title={
                isFiltered
                  ? "No matching assessments"
                  : EMPTY_STATES.assessments.title
              }
            />
          </div>
        ) : (
          <>
            <DataTable
              caption="Assessments with lifecycle status, time limit, pass mark, and question and invitation counts"
              columns={columns}
              getRowKey={(assessment) => assessment.id}
              rows={items}
            />
            <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <PageSizeNote
                limit={meta.limit}
                pathname={PATHNAME}
                searchParams={urlParams}
              />
              <PaginationBar
                label="assessments"
                meta={meta}
                pathname={PATHNAME}
                searchParams={urlParams}
              />
            </div>
          </>
        )}
      </DashboardPanel>

      <p className="flex items-start gap-2 text-xs/relaxed text-muted-foreground">
        <ClipboardListIcon className="mt-0.5 size-3.5 shrink-0" />
        Question and invitation counts come straight from the list endpoint. A
        draft with zero questions cannot be published — the backend refuses the
        transition until at least one question is attached, which is why the
        wizard will not let you reach the review step empty-handed.
      </p>
    </>
  );
}
