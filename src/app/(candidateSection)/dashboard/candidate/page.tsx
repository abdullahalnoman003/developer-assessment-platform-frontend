import type { Metadata } from "next";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { dashboardMetadata } from "@/lib/seo";

export const metadata: Metadata = dashboardMetadata("Candidate dashboard");

export default function CandidateDashboardPage() {
  return (
    <>
      <DashboardPageHeader title="Candidate dashboard" />
      <DashboardPanel title="Not built yet">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            TODO: stat cards, pending invitations, recent attempts with status
            ring, results-not-released explainer.
          </p>
        </div>
      </DashboardPanel>
    </>
  );
}
