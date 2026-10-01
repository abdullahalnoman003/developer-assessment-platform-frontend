import type { ReactNode } from "react";
import { DashboardRoleLayout } from "@/lib/dashboard-session";

export const dynamic = "force-dynamic";

export default function RecruiterSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardRoleLayout expectedRole="RECRUITER">
      {children}
    </DashboardRoleLayout>
  );
}
