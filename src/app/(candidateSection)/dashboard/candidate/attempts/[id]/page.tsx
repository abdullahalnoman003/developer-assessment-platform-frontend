import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AttemptRunner } from "@/app/(candidateSection)/_components/attempt-runner";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import { dashboardMetadata } from "@/lib/seo";
import { attemptService } from "@/service/attempts";

export const metadata: Metadata = dashboardMetadata("Attempt");

type Params = Promise<{ id: string }>;

export default async function CandidateAttemptPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const res = await attemptService.detail(id);

  if (!res.success || !res.data) {
    return (
      <>
        <DashboardPageHeader title="Attempt" />
        <DashboardPanel>
          <ErrorState
            message={res.message || VALIDATION_MESSAGES.unknown}
            title={
              res.statusCode === 404
                ? "That attempt does not exist"
                : "Could not load this attempt"
            }
          />
          <Button
            className="mt-4"
            render={<Link href="/dashboard/candidate/invitations" />}
            size="sm"
            variant="outline"
          >
            Back to invitations
          </Button>
        </DashboardPanel>
      </>
    );
  }

  const attempt = res.data;

  if (
    attempt.status === "SUBMITTED" ||
    attempt.status === "EVALUATED" ||
    attempt.status === "EXPIRED"
  ) {
    redirect(`/dashboard/candidate/attempts/${id}/result`);
  }

  return (
    <>
      <DashboardPageHeader title={attempt.invitation.assessment.title} />
      <AttemptRunner attempt={attempt} />
    </>
  );
}
