import { HelpCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { QuestionDialog } from "@/app/(recruiterSection)/_components/question-dialog";
import { QuestionFilters } from "@/app/(recruiterSection)/_components/question-filters";
import { QuestionRowActions } from "@/app/(recruiterSection)/_components/question-row-actions";
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
import {
  DifficultyBadge,
  QuestionTypeBadge,
} from "@/components/shared/status-badge";
import { formatDate, toUrlParamRecord, truncate } from "@/lib/format";
import { EMPTY_STATES, VALIDATION_MESSAGES } from "@/lib/messages";
import { dashboardMetadata } from "@/lib/seo";
import type { Question } from "@/lib/types";
import { questionQuerySchema } from "@/lib/validations";
import { questionService } from "@/service/questions";

export const metadata: Metadata = dashboardMetadata("Question bank");

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const COLUMNS: readonly DataTableColumn<Question>[] = [
  {
    key: "title",
    header: "Question",
    cell: (question) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{question.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {truncate(question.body, 90)}
        </p>
      </div>
    ),
  },
  {
    key: "type",
    header: "Type",
    cell: (question) => <QuestionTypeBadge value={question.type} />,
  },
  {
    key: "difficulty",
    header: "Difficulty",
    cell: (question) => <DifficultyBadge value={question.difficulty} />,
  },
  {
    key: "tags",
    header: "Tags",
    cell: (question) =>
      question.tags.length === 0 ? (
        <span className="text-xs text-muted-foreground">—</span>
      ) : (
        <ul className="flex flex-wrap gap-1">
          {question.tags.slice(0, 3).map((tag) => (
            <li
              className="min-w-0 max-w-full truncate rounded-md border border-border/70 bg-muted px-2 py-0.5 font-mono text-[11px]"
              key={`${question.id}-${tag}`}
            >
              {tag}
            </li>
          ))}
          {question.tags.length > 3 ? (
            <li className="px-1 font-mono text-[11px] text-muted-foreground">
              +{question.tags.length - 3}
            </li>
          ) : null}
        </ul>
      ),
  },
  {
    key: "updatedAt",
    header: "Updated",
    cell: (question) => (
      <span className="text-xs whitespace-nowrap text-muted-foreground">
        {formatDate(question.updatedAt)}
      </span>
    ),
  },
  {
    key: "actions",
    header: "Manage",
    headerClassName: "text-right",
    className: "text-right",
    cell: (question) => <QuestionRowActions question={question} />,
  },
];

export default async function RecruiterQuestionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;
  const parsed = questionQuerySchema.safeParse({
    difficulty: first(raw.difficulty),
    limit: first(raw.limit),
    page: first(raw.page),
    q: first(raw.q),
    type: first(raw.type),
  });
  const filters = parsed.success ? parsed.data : {};

  const res = await questionService.list(filters);

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const single = first(value);
    if (single) params.set(key, single);
  }
  const urlParams = toUrlParamRecord(params);

  if (!res.success || !res.data) {
    return (
      <>
        <DashboardPageHeader title="Question bank" />
        <ErrorState message={res.message || VALIDATION_MESSAGES.unknown} />
      </>
    );
  }

  const { items, meta } = res.data;
  const isFiltered = Boolean(
    filters.q || filters.type || filters.difficulty || filters.page,
  );

  return (
    <>
      <DashboardPageHeader
        actions={<QuestionDialog />}
        description="Write each question once, then reuse it in any assessment. Multiple choice is auto-graded; written and coding answers are scored by you."
        title="Question bank"
      />

      <Suspense>
        <QuestionFilters />
      </Suspense>

      <DashboardPanel
        contentClassName="flex flex-col gap-4 p-0 sm:p-0"
        description={`${meta.total} ${meta.total === 1 ? "question" : "questions"} in this view`}
        title="Library"
      >
        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              action={<QuestionDialog />}
              body={
                isFiltered
                  ? "No questions match these filters. Try a different search term, or clear the filters to see your whole bank."
                  : EMPTY_STATES.questions.body
              }
              Icon={HelpCircleIcon}
              title={
                isFiltered
                  ? "No matching questions"
                  : EMPTY_STATES.questions.title
              }
            />
          </div>
        ) : (
          <>
            <DataTable
              caption="Questions in your company bank with type, difficulty, and tags"
              columns={COLUMNS}
              getRowKey={(question) => question.id}
              rows={items}
            />
            <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <PageSizeNote
                limit={meta.limit}
                pathname="/dashboard/recruiter/questions"
                searchParams={urlParams}
              />
              <PaginationBar
                label="questions"
                meta={meta}
                pathname="/dashboard/recruiter/questions"
                searchParams={urlParams}
              />
            </div>
          </>
        )}
      </DashboardPanel>

      <p className="text-xs/relaxed text-muted-foreground">
        Removing a question is a soft delete. Assessments that already reference
        it keep their own copy, so a live assessment is never broken by cleaning
        up the bank.
      </p>
    </>
  );
}
