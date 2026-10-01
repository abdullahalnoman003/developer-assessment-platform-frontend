import type { Metadata } from "next";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { dashboardMetadata } from "@/lib/seo";

export const metadata: Metadata = dashboardMetadata("My invitations");

export default function CandidateInvitationsPage() {
  return (
    <>
      <DashboardPageHeader title="My invitations" />
      <DashboardPanel title="Not built yet">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            TODO: server-filtered cards with status and page search params,
            expiry countdown, Accept, Decline, Start, Resume.
          </p>
        </div>
      </DashboardPanel>
    </>
  );
}
