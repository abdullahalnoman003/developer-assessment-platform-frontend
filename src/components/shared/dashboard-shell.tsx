import { PanelLeftIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { APP_NAME, ROLE_LABELS } from "@/lib/constants";
import { dashboardNavFor } from "@/lib/dashboard-nav";
import { initials } from "@/lib/format";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { logout } from "@/service/logout";
import { DashboardNav } from "./dashboard-nav";

export function DashboardShell({
  user,
  children,
  className,
}: {
  user: SessionUser;
  children: ReactNode;
  className?: string;
}) {
  const config = dashboardNavFor(user.role);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link
            className="flex items-center gap-2 px-2 py-1.5 font-heading text-sm font-semibold"
            href={config.home}
          >
            <span className="flex size-6 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 text-primary">
              <PanelLeftIcon className="size-3.5" />
            </span>
            <span className="truncate group-data-[collapsible=icon]/sidebar:hidden">
              {APP_NAME}
            </span>
          </Link>
        </SidebarHeader>

        <DashboardNav config={config} />

        <SidebarFooter>
          <div className="flex flex-col gap-0.5 px-2 py-1.5 text-xs group-data-[collapsible=icon]/sidebar:hidden">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-muted-foreground">
              {ROLE_LABELS[user.role]} · {initials(user.email)}
            </span>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6">
          <SidebarTrigger className="-ml-1" />
          <span className="truncate font-heading text-sm font-semibold">
            {config.homeLabel}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <form action={logout}>
              <Button size="sm" type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </div>
        </header>

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-6 px-4 py-6 sm:px-6",
            className,
          )}
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function DashboardPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm/relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function DashboardPanel({
  title,
  description,
  actions,
  className,
  contentClassName,
  children,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("border border-border bg-card", className)}>
      {title || actions ? (
        <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title ? (
              <h2 className="font-heading text-sm font-semibold">{title}</h2>
            ) : null}
            {description ? (
              <p className="text-xs/relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}
      <div className={cn("p-4", contentClassName)}>{children}</div>
    </section>
  );
}
