import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { ROLE_HOME } from "@/lib/constants";
import type { Role, SessionUser } from "@/lib/types";
import { authService } from "@/service/auth";

export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await authService.requireUser();

  if (user.role !== role) {
    redirect(ROLE_HOME[user.role]);
  }

  return user;
}

export async function DashboardRoleLayout({
  expectedRole,
  children,
}: {
  expectedRole: Role;
  children: ReactNode;
}) {
  const user = await requireRole(expectedRole);
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
