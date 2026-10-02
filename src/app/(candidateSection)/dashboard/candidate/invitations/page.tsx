import { InboxIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { InvitationCard } from "@/app/(candidateSection)/_components/invitation-card";
import { InvitationFilters } from "@/app/(candidateSection)/_components/invitation-filters";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { Button } from "@/components/ui/button";
import { INVITATION_STATUS_LABELS } from "@/lib/constants";
import { formatNumber, toUrlParamRecord } from "@/lib/format";
import { EMPTY_STATES, VALIDATION_MESSAGES } from "@/lib/messages";
import { dashboardMetadata } from "@/lib/seo";
import { invitationQuerySchema } from "@/lib/validations";
import { invitationService } from "@/service/invitations";

export const metadata: Metadata = dashboardMetadata("My invitations");

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PAGE_SIZE = 10;

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

/** The API validates `status` itself; the same message is shown when it 400s. */
const FILTER_COPY: Record<string, { title: string; body: string }> = {
  PENDING: {
    title: "Nothing waiting for you",
    body: "Every invitation has been answered. New ones appear here as soon as a recruiter sends them.",
  },
  ACCEPTED: {
    title: "No accepted invitations",
    body: "Accept an invitation and it moves here, so the assessments you can start stay in one place.",
  },
  DECLINED: {
    title: "You have not declined anything",
    body: "Declined invitations are kept here for your records. There is no way to un-decline one.",
  },
  EXPIRED: {
    title: "No expired invitations",
    body: "An invitation expires on its own if it is neither accepted nor declined before the deadline.",
  },
};

export default async function CandidateInvitationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;

  const parsed = invitationQuerySchema.safeParse({
    status: first(raw.status),
    page: first(raw.page),
    limit: first(raw.limit),
  });
  const filters = parsed.success ? parsed.data : {};

  const res = await invitationService.listForCandidate({
    status: filters.status,
    page: filters.page ?? 1,
    limit: filters.limit ?? PAGE_SIZE,
  });

  // `PaginationBar` is a client component and a `URLSearchParams` cannot cross
  // the RSC boundary (§0.7 D), so the params are converted to a plain record.
  const urlParams = toQueryRecord(raw);
  const activeStatus = parsed.success ? filters.status : undefined;

  if (!res.success || !res.data) {
    return (
      <>
        <DashboardPageHeader title="My invitations" />
        <ErrorState message={res.message || VALIDATION_MESSAGES.unknown} />
      </>
    );
  }

  const { items, meta } = res.data;

  return (
    <>
      <DashboardPageHeader
        description="Filter by status and page — both live in the URL, so a view is shareable and survives a refresh."
        title="My invitations"
      />

      <InvitationFilters />

      <DashboardPanel
        contentClassName="flex flex-col gap-4 p-0 sm:p-0"
        description={
          activeStatus
            ? `${INVITATION_STATUS_LABELS[activeStatus]} · ${formatNumber(meta.total)} in this view`
            : `${formatNumber(meta.total)} invitation${meta.total === 1 ? "" : "s"} in this view`
        }
        title="Invitations"
      >
        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              action={
                activeStatus ? (
                  <Button
                    render={
                      <Link
                        href="/dashboard/candidate/invitations"
                        scroll={false}
                      />
                    }
                    size="sm"
                    variant="outline"
                  >
                    Clear filter
                  </Button>
                ) : (
                  <Button
                    render={<Link href="/dashboard/candidate" />}
                    size="sm"
                  >
                    Back to overview
                  </Button>
                )
              }
              body={
                activeStatus
                  ? FILTER_COPY[activeStatus]?.body
                  : EMPTY_STATES.myInvitations.body
              }
              Icon={InboxIcon}
              title={
                activeStatus
                  ? (FILTER_COPY[activeStatus]?.title ??
                    EMPTY_STATES.myInvitations.title)
                  : meta.total > 0
                    ? "Nothing on this page"
                    : EMPTY_STATES.myInvitations.title
              }
            />
          </div>
        ) : (
          <>
            <div className="grid gap-4 p-4 md:grid-cols-2">
              {items.map((invitation) => (
                <InvitationCard invitation={invitation} key={invitation.id} />
              ))}
            </div>
            <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-center sm:justify-end">
              <PaginationBar
                label="invitations"
                meta={meta}
                pathname="/dashboard/candidate/invitations"
                searchParams={urlParams}
              />
            </div>
          </>
        )}
      </DashboardPanel>

      <p className="text-xs/relaxed text-muted-foreground">
        An invitation is a seat, not a result. Accepting one lets you start the
        assessment; only the attempt you submit produces something scoreable,
        and only once the recruiter releases it.
      </p>
    </>
  );
}
