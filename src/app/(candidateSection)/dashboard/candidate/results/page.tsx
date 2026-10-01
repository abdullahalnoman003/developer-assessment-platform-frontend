import type { Metadata } from "next";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { dashboardMetadata } from "@/lib/seo";

export const metadata: Metadata = dashboardMetadata("All results");

export default function CandidateResultsPage() {
  return (
    <>
      <DashboardPageHeader title="All results" />
      <DashboardPanel title="Not built yet">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            TODO: evaluated attempts with page param, average score, links to
            each result page.
          </p>
        </div>
      </DashboardPanel>
    </>
  );
}
