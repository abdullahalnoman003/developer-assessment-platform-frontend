import type { Metadata } from "next";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { dashboardMetadata } from "@/lib/seo";

export const metadata: Metadata = dashboardMetadata("New assessment");

export default function NewAssessmentPage() {
  return (
    <>
      <DashboardPageHeader title="New assessment" />
      <DashboardPanel title="Not built yet">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            TODO: 3-step wizard - Details, Pick questions, Review and publish -
            with the step kept in the URL.
          </p>
        </div>
      </DashboardPanel>
    </>
  );
}
