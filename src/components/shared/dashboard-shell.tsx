import { ArrowUpRightIcon, PanelLeftIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
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
            aria-label={`${APP_NAME} — home`}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            href="/"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground shadow-glow">
              <PanelLeftIcon className="size-4" />
            </span>
            <span className="truncate font-heading text-sm font-bold tracking-tight text-gradient-brand group-data-[collapsible=icon]/sidebar:hidden">
              {APP_NAME}
            </span>
          </Link>
        </SidebarHeader>

        <DashboardNav config={config} />

        <SidebarFooter>
          <Link
            className="flex items-center gap-3 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/40 p-2.5 outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]/sidebar:hidden"
            href="/profile"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-brand font-heading text-xs font-bold text-primary-foreground shadow-sm">
              {initials(user.name)}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold">
                {user.name}
              </span>
              <span className="truncate font-mono text-[0.6875rem] tracking-wide text-muted-foreground uppercase">
                {ROLE_LABELS[user.role]}
              </span>
            </span>
          </Link>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border/70 glass px-4 sm:px-6">
          <SidebarTrigger className="-ml-1" />
          <span className="truncate font-heading text-sm font-bold tracking-tight">
            {config.homeLabel}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <LinkButton
              className="hidden sm:inline-flex"
              href="/"
              size="sm"
              variant="ghost"
            >
              View site
              <ArrowUpRightIcon data-icon="inline-end" />
            </LinkButton>
            <form action={logout}>
              <Button size="sm" type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </div>
        </header>

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-7 px-4 py-6 sm:px-6 sm:py-8",
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
    <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-heading text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-sm/relaxed text-muted-foreground">
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
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm",
        className,
      )}
    >
      {title || actions ? (
        <div className="flex flex-col gap-3 border-b border-border/70 bg-muted/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title ? (
              <h2 className="font-heading text-base font-bold tracking-tight">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-sm/relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}
      <div className={cn("p-5", contentClassName)}>{children}</div>
    </section>
  );
}
