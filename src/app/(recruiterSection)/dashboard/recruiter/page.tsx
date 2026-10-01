import type { Metadata } from "next";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { dashboardMetadata } from "@/lib/seo";

export const metadata: Metadata = dashboardMetadata("Recruiter dashboard");

export default function RecruiterDashboardPage() {
  return (
    <>
      <DashboardPageHeader title="Recruiter dashboard" />
      <DashboardPanel title="Not built yet">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            TODO: stat cards, assessment funnel, attempts donut, average score,
            credits pill with buy CTA, needs-attention list, company onboarding
            card on 403.
          </p>
        </div>
      </DashboardPanel>
    </>
  );
}
