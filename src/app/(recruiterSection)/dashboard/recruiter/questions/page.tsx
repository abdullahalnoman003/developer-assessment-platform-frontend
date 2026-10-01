import type { Metadata } from "next";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { dashboardMetadata } from "@/lib/seo";

export const metadata: Metadata = dashboardMetadata("Question bank");

export default function RecruiterQuestionsPage() {
  return (
    <>
      <DashboardPageHeader title="Question bank" />
      <DashboardPanel title="Not built yet">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            TODO: filters for search, type, difficulty and page, create and edit
            dialogs with the MCQ option builder, preview dialog, soft delete.
          </p>
        </div>
      </DashboardPanel>
    </>
  );
}
