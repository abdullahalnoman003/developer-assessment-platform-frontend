import type { Metadata } from "next";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { dashboardMetadata } from "@/lib/seo";

export const metadata: Metadata = dashboardMetadata("Company");

export default function RecruiterCompanyPage() {
  return (
    <>
      <DashboardPageHeader title="Company" />
      <DashboardPanel title="Not built yet">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            TODO: company upsert form for name, website, logo URL, plus a
            credits and created panel.
          </p>
        </div>
      </DashboardPanel>
    </>
  );
}
