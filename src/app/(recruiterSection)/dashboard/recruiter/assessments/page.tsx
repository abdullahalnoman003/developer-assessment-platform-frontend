import type { Metadata } from "next";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { dashboardMetadata } from "@/lib/seo";

export const metadata: Metadata = dashboardMetadata("Assessments");

export default function RecruiterAssessmentsPage() {
  return (
    <>
      <DashboardPageHeader title="Assessments" />
      <DashboardPanel title="Not built yet">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            TODO: status filter, sortable headers for title and createdAt,
            lifecycle badges, question and invitation counts.
          </p>
        </div>
      </DashboardPanel>
    </>
  );
}
