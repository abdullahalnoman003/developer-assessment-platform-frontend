import type { Metadata } from "next";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { dashboardMetadata } from "@/lib/seo";

export const metadata: Metadata = dashboardMetadata("Assessment results");

export default function RecruiterAssessmentResultsPage() {
  return (
    <>
      <DashboardPageHeader title="Assessment results" />
      <DashboardPanel title="Not built yet">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            TODO: paginated candidate results with status, score bar,
            result-released chip, submitted date, grade CTA.
          </p>
          <p className="text-sm text-muted-foreground">
            TODO: route param id is the assessment id.
          </p>
        </div>
      </DashboardPanel>
    </>
  );
}
