import type { Metadata } from "next";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { dashboardMetadata } from "@/lib/seo";

export const metadata: Metadata = dashboardMetadata("Assessment detail");

export default function RecruiterAssessmentDetailPage() {
  return (
    <>
      <DashboardPageHeader title="Assessment detail" />
      <DashboardPanel title="Not built yet">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            TODO: stats, ordered question list with points, lifecycle action
            rail, edit while draft, soft delete, invite candidates dialog.
          </p>
          <p className="text-sm text-muted-foreground">
            TODO: route param id is the assessment id.
          </p>
        </div>
      </DashboardPanel>
    </>
  );
}
