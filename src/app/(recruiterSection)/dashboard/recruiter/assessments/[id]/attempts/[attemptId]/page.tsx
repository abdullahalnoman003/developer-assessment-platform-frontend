import type { Metadata } from "next";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { dashboardMetadata } from "@/lib/seo";

export const metadata: Metadata = dashboardMetadata("Grading workspace");

export default function GradingWorkspacePage() {
  return (
    <>
      <DashboardPageHeader title="Grading workspace" />
      <DashboardPanel title="Not built yet">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            TODO: split pane with a points stepper for written and coding
            answers, MCQ locked as auto-graded, live total, release-result
            switch.
          </p>
          <p className="text-sm text-muted-foreground">
            TODO: route params are the assessment id and the attempt id.
          </p>
        </div>
      </DashboardPanel>
    </>
  );
}
