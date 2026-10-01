import type { ReactNode } from "react";
import { DashboardRoleLayout } from "@/lib/dashboard-session";

export const dynamic = "force-dynamic";

export default function CandidateSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardRoleLayout expectedRole="CANDIDATE">
      {children}
    </DashboardRoleLayout>
  );
}
