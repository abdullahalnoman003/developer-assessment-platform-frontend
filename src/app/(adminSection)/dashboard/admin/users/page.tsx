import { Building2Icon, UsersIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import {
  PageSizeNote,
  PaginationBar,
} from "@/components/shared/pagination-bar";
import {
  AuthProviderLabels,
  RoleBadge,
  UserStatusBadge,
} from "@/components/shared/status-badge";
import { UserFilters } from "@/components/shared/user-filters";
import { UserStatusAction } from "@/components/shared/user-status-action";
import { formatDate, initials } from "@/lib/format";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import { dashboardMetadata } from "@/lib/seo";
import type { AdminUser } from "@/lib/types";
import { adminUsersQuerySchema } from "@/lib/validations";
import { adminService } from "@/service/admin";

export const metadata: Metadata = dashboardMetadata("Users");

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const COLUMNS: readonly DataTableColumn<AdminUser>[] = [
  {
    key: "user",
    header: "User",
    cell: (user) => (
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center border border-border bg-muted font-mono text-xs text-muted-foreground"
        >
          {initials(user.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    cell: (user) => <RoleBadge value={user.role} />,
  },
  {
    key: "status",
    header: "Status",
    cell: (user) => <UserStatusBadge value={user.status} />,
  },
  {
    key: "authProvider",
    header: "Sign-in",
    cell: (user) => (
      <span className="text-xs text-muted-foreground">
        {AuthProviderLabels[user.authProvider]}
      </span>
    ),
  },
  {
    key: "company",
    header: "Company",
    cell: (user) =>
      user.companyMembership ? (
        <span className="text-xs">{user.companyMembership.company.name}</span>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    key: "activity",
    header: "Activity",
    cell: (user) => (
      <span className="text-xs tabular-nums text-muted-foreground">
        {user._count.invitations} invited · {user._count.attempts} attempts
      </span>
    ),
  },
  {
    key: "createdAt",
    header: "Joined",
    cell: (user) => (
      <span className="text-xs whitespace-nowrap text-muted-foreground">
        {formatDate(user.createdAt)}
      </span>
    ),
  },
  {
    key: "actions",
    header: "Manage",
    headerClassName: "text-right",
    className: "text-right",
    cell: (user) => <UserStatusAction status={user.status} userId={user.id} />,
  },
];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;
  const parsed = adminUsersQuerySchema.safeParse({
    q: first(raw.q),
    role: first(raw.role),
    status: first(raw.status),
    page: first(raw.page),
    limit: first(raw.limit),
  });

  const filters = parsed.success ? parsed.data : {};
  const res = await adminService.users(filters);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const single = first(value);
    if (single) params.set(key, single);
  }

  if (!res.success || !res.data) {
    return (
      <>
        <DashboardPageHeader
          description="Search every account, change status, and review activity counts."
          title="Users"
        />
        <ErrorState message={res.message || VALIDATION_MESSAGES.unknown} />
      </>
    );
  }

  const { items, meta } = res.data;
  const filtered = Boolean(
    filters.q || filters.role || filters.status || filters.page,
  );

  return (
    <>
      <DashboardPageHeader
        actions={
          <Link
            className="text-xs underline underline-offset-4"
            href="/dashboard/admin/audit-logs"
          >
            View audit logs
          </Link>
        }
        description="Search every account, suspend access, or restore it. Every change is written to the audit log."
        title="Users"
      />

      <Suspense>
        <UserFilters />
      </Suspense>

      <DashboardPanel
        contentClassName="flex flex-col gap-4 p-0 sm:p-0"
        description={`${meta.total} ${meta.total === 1 ? "account" : "accounts"} match this view`}
        title="Directory"
      >
        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              body={
                filtered
                  ? "No accounts match these filters. Try a different search term or clear the filters."
                  : "No accounts exist yet."
              }
              Icon={UsersIcon}
              title={filtered ? "No matching users" : "No users yet"}
            />
          </div>
        ) : (
          <>
            <DataTable
              caption="Platform users with role, status, and activity"
              columns={COLUMNS}
              getRowKey={(user) => user.id}
              rows={items}
            />
            <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <PageSizeNote
                limit={meta.limit}
                pathname="/dashboard/admin/users"
                searchParams={params}
              />
              <PaginationBar
                label="users"
                meta={meta}
                pathname="/dashboard/admin/users"
                searchParams={params}
              />
            </div>
          </>
        )}
      </DashboardPanel>

      <p className="flex items-center gap-2 text-xs/relaxed text-muted-foreground">
        <Building2Icon className="size-3.5 shrink-0" />
        Suspending a recruiter blocks sign-in immediately; their company,
        questions, and assessments are left untouched.
      </p>
    </>
  );
}
