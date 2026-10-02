import type { ReactNode } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { authService } from "@/service/auth";

/**
 * The profile route is shared by all roles — it is linked from the avatar menu
 * in every dashboard shell. Authenticated only; `requireUser()` throws
 * `UnauthenticatedError` for anonymous visitors, which `proxy.ts` turns into a
 * `/login?redirectTo=/profile` redirect.
 */
export const dynamic = "force-dynamic";

export default async function ProfileSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await authService.requireUser();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
