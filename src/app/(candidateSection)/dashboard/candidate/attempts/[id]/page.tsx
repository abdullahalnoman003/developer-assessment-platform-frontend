import type { Metadata } from "next";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { dashboardMetadata } from "@/lib/seo";

export const metadata: Metadata = dashboardMetadata("Attempt runner");

export default function AttemptRunnerPage() {
  return (
    <>
      <DashboardPageHeader title="Attempt runner" />
      <DashboardPanel title="Not built yet">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            TODO: countdown timer, question navigator, MCQ radio plus written
            and coding inputs, autosave, submit confirmation.
          </p>
          <p className="text-sm text-muted-foreground">
            TODO: route param id is the attempt id.
          </p>
        </div>
      </DashboardPanel>
    </>
  );
}
