import {
  Building2Icon,
  ClipboardListIcon,
  CreditCardIcon,
  FileQuestionIcon,
  ScrollTextIcon,
  TrendingUpIcon,
  UserCheckIcon,
  UsersIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ContentVolumeChart,
  UsersByRoleChart,
} from "@/components/shared/admin-charts";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { ErrorState } from "@/components/shared/error-state";
import { StatsCards } from "@/components/shared/stats-cards";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber, pluralize } from "@/lib/format";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import { dashboardMetadata } from "@/lib/seo";
import { adminService } from "@/service/admin";

export const metadata: Metadata = dashboardMetadata("Admin overview");

export default async function AdminDashboardPage() {
  const res = await adminService.stats();

  if (!res.success || !res.data) {
    return (
      <>
        <DashboardPageHeader
          description="Live platform totals served by the CodeArena API."
          title="Platform overview"
        />
        <ErrorState message={res.message || VALIDATION_MESSAGES.unknown} />
      </>
    );
  }

  const stats = res.data;
  const { users, payments } = stats;

  return (
    <>
      <DashboardPageHeader
        actions={
          <>
            <Button
              render={<Link href="/dashboard/admin/users" />}
              size="sm"
              variant="outline"
            >
              <UsersIcon />
              Manage users
            </Button>
            <Button
              render={<Link href="/dashboard/admin/audit-logs" />}
              size="sm"
            >
              <ScrollTextIcon />
              Audit logs
            </Button>
          </>
        }
        description="Live platform totals served by the CodeArena API. Nothing here is estimated on the client."
        title="Platform overview"
      />

      <StatsCards
        items={[
          {
            label: "Total users",
            value: formatNumber(users.total),
            hint: `${pluralize(users.recruiters, "recruiter")} · ${pluralize(users.candidates, "candidate")} · ${pluralize(users.admins, "admin")}`,
            Icon: UsersIcon,
            tone: "accent",
          },
          {
            label: "Companies",
            value: formatNumber(stats.companies),
            hint: "Recruiter workspaces on the platform",
            Icon: Building2Icon,
          },
          {
            label: "Question bank",
            value: formatNumber(stats.questions),
            hint: `Across ${pluralize(stats.assessments, "assessment")}`,
            Icon: FileQuestionIcon,
          },
          {
            label: "Attempts",
            value: formatNumber(stats.attempts),
            hint: "Candidate submissions recorded",
            Icon: ClipboardListIcon,
          },
        ]}
      />

      <StatsCards
        items={[
          {
            label: "Paid payments",
            value: formatNumber(payments.paidCount),
            hint: "Payments the provider confirmed",
            Icon: CreditCardIcon,
            tone: "success",
          },
          {
            label: "Gross revenue",
            value: formatCurrency(payments.totalRevenue),
            hint: "Sum of paid amounts, as stored",
            Icon: TrendingUpIcon,
            tone: "success",
          },
          {
            label: "Recruiters",
            value: formatNumber(users.recruiters),
            hint: "Accounts that can hire candidates",
            Icon: UserCheckIcon,
          },
          {
            label: "Candidates",
            value: formatNumber(users.candidates),
            hint: "Accounts that can take assessments",
            Icon: UserCheckIcon,
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardPanel
          description="Share of registered accounts by role"
          title="Users by role"
        >
          <Suspense fallback={<ChartFallback />}>
            <UsersByRoleChart stats={stats} />
          </Suspense>
        </DashboardPanel>

        <DashboardPanel
          description="Content created and submitted so far"
          title="Content volume"
        >
          <Suspense fallback={<ChartFallback />}>
            <ContentVolumeChart stats={stats} />
          </Suspense>
        </DashboardPanel>
      </div>

      <DashboardPanel
        description="Tools that map to the endpoints the API exposes for administrators"
        title="Administration"
      >
        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            {
              href: "/dashboard/admin/users",
              title: "User directory",
              body: "Filter by role and status, then suspend or restore sign-in.",
              Icon: UsersIcon,
            },
            {
              href: "/dashboard/admin/payments/lookup",
              title: "Payment lookup",
              body: "Fetch any single payment by its identifier.",
              Icon: CreditCardIcon,
            },
            {
              href: "/dashboard/admin/audit-logs",
              title: "Audit logs",
              body: "Every privileged mutation, filterable by entity and action.",
              Icon: ScrollTextIcon,
            },
          ].map((item) => (
            <li key={item.href}>
              <Link
                className="flex h-full flex-col gap-1.5 border border-border p-3 transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:ring-1 focus-visible:ring-ring"
                href={item.href}
              >
                <span className="flex items-center gap-2 font-heading text-sm font-semibold">
                  <item.Icon className="size-3.5 text-primary" />
                  {item.title}
                </span>
                <span className="text-xs/relaxed text-muted-foreground">
                  {item.body}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </DashboardPanel>

      <p className="text-xs/relaxed text-muted-foreground">
        Administrators cannot read assessment results or individual attempts:
        the API restricts those routes to the assessment owner. Company credits
        change only when a payment is confirmed.
      </p>
    </>
  );
}

function ChartFallback() {
  return (
    <output
      aria-busy="true"
      className="flex h-56 items-center justify-center border border-dashed border-border"
    >
      <Skeleton className="h-40 w-40 rounded-full" />
      <span className="sr-only">Loading chart…</span>
    </output>
  );
}
