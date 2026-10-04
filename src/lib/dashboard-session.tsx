import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { ROLE_HOME } from "@/lib/constants";
import type { Role, SessionUser } from "@/lib/types";
import { authService } from "@/service/auth";

export async function requireRole(role: Role): Promise<SessionUser | null> {
  const user = await authService.requireUser();

  if (!user || user.role !== role) {
    return null;
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

  if (!user) {
    redirect(ROLE_HOME[expectedRole] ?? "/login");
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
