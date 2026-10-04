import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { authService } from "@/service/auth";

export const dynamic = "force-dynamic";

export default async function ProfileSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await authService.requireUser();

  if (!user) {
    redirect("/login");
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
