import type { Metadata } from "next";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { dashboardMetadata } from "@/lib/seo";

export const metadata: Metadata = dashboardMetadata("Billing");

export default function RecruiterBillingPage() {
  return (
    <>
      <DashboardPageHeader title="Billing" />
      <DashboardPanel title="Not built yet">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            TODO: credits hero, 3 plan cards that call payments initiate,
            paginated payments table, receipt dialog.
          </p>
        </div>
      </DashboardPanel>
    </>
  );
}
