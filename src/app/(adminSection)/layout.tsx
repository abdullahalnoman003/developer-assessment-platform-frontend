import type { ReactNode } from "react";
import { DashboardRoleLayout } from "@/lib/dashboard-session";

export const dynamic = "force-dynamic";

export default function AdminSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardRoleLayout expectedRole="ADMIN">{children}</DashboardRoleLayout>
  );
}
