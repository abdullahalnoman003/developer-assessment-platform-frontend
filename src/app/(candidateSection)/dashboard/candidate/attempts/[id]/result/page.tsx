import type { Metadata } from "next";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { dashboardMetadata } from "@/lib/seo";

export const metadata: Metadata = dashboardMetadata("Attempt result");

export default function AttemptResultPage() {
  return (
    <>
      <DashboardPageHeader title="Attempt result" />
      <DashboardPanel title="Not built yet">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            TODO: locked state when resultReleased is false, otherwise score
            ring, pass or fail against passScore, per-answer review.
          </p>
          <p className="text-sm text-muted-foreground">
            TODO: route param id is the attempt id.
          </p>
        </div>
      </DashboardPanel>
    </>
  );
}
