import { HelpCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AssessmentWizard } from "@/app/(recruiterSection)/_components/assessment-wizard";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { EMPTY_STATES, VALIDATION_MESSAGES } from "@/lib/messages";
import { dashboardMetadata } from "@/lib/seo";
import { questionService } from "@/service/questions";

export const metadata: Metadata = dashboardMetadata("New assessment");

/**
 * The picker is a search-and-list over the whole bank, so it needs the full
 * list rather than one page of it.
 *
 * `100` is the backend's hard ceiling — `GET /questions` answers
 * `limit: Too big: expected number to be <=100` for anything higher, and
 * `questionQuerySchema` mirrors that `.max(100)`. A larger bank is therefore
 * filtered client-side inside the wizard and flagged to the user below, rather
 * than silently showing the first slice as if it were everything.
 */
const PICKER_LIMIT = 100;

export default async function NewAssessmentPage() {
  const res = await questionService.list({ limit: PICKER_LIMIT });

  if (!res.success || !res.data) {
    return (
      <>
        <DashboardPageHeader title="New assessment" />
        <ErrorState message={res.message || VALIDATION_MESSAGES.unknown} />
      </>
    );
  }

  const questions = res.data.items;
  const truncated = res.data.meta.total > questions.length;

  return (
    <>
      <DashboardPageHeader
        description="Three steps: describe the assessment, pick the questions, then review and publish."
        title="New assessment"
      />

      {questions.length === 0 ? (
        <DashboardPanel>
          <EmptyState
            action={
              <Button render={<Link href="/dashboard/recruiter/questions" />}>
                <HelpCircleIcon className="size-4" />
                Go to the question bank
              </Button>
            }
            body={EMPTY_STATES.questions.body}
            Icon={HelpCircleIcon}
            title={EMPTY_STATES.questions.title}
          />
        </DashboardPanel>
      ) : (
        <>
          {truncated ? (
            <p className="border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
              Your bank holds {res.data.meta.total} questions but the API serves
              at most {PICKER_LIMIT} per request, so the first{" "}
              {questions.length} are loaded here. Search and the type and
              difficulty filters run against this loaded set.
            </p>
          ) : null}

          <DashboardPanel contentClassName="p-4 sm:p-6">
            {/* The wizard reads `?step=` through useSearchParams, so it needs a
                Suspense boundary to keep the rest of the page streamable. */}
            <Suspense
              fallback={
                <>
                  <TableSkeleton columns={4} rows={5} />
                  <span className="sr-only">Loading the wizard…</span>
                </>
              }
            >
              <AssessmentWizard questions={questions} />
            </Suspense>
          </DashboardPanel>
        </>
      )}
    </>
  );
}
