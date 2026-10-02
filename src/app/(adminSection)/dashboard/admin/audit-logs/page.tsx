import { ScrollTextIcon } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuditLogFilters } from "@/components/shared/audit-log-filters";
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
import { StatusBadge } from "@/components/shared/status-badge";
import { auditActionLabel } from "@/lib/constants";
import { formatDateTime, initials, toUrlParamRecord } from "@/lib/format";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import { dashboardMetadata } from "@/lib/seo";
import type { AuditLog, JsonValue } from "@/lib/types";
import { auditLogQuerySchema } from "@/lib/validations";
import { adminService } from "@/service/admin";

export const metadata: Metadata = dashboardMetadata("Audit logs");

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function metaSummary(meta: JsonValue | null): string {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    return meta === null ? "—" : String(meta);
  }

  const entries = Object.entries(meta as Record<string, JsonValue>);
  if (entries.length === 0) return "—";

  return entries
    .map(([key, value]) => {
      if (value === null || typeof value === "object") {
        return `${key}: ${value === null ? "none" : "…"}`;
      }
      return `${key}: ${String(value)}`;
    })
    .join(" · ");
}

const COLUMNS: readonly DataTableColumn<AuditLog>[] = [
  {
    key: "when",
    header: "When",
    cell: (log) => (
      <span className="text-xs whitespace-nowrap text-muted-foreground">
        {formatDateTime(log.createdAt)}
      </span>
    ),
  },
  {
    key: "actor",
    header: "Actor",
    cell: (log) =>
      log.user ? (
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className="flex size-7 shrink-0 items-center justify-center border border-border bg-muted font-mono text-[10px] text-muted-foreground"
          >
            {initials(log.user.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm">{log.user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {log.user.email}
            </p>
          </div>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">System</span>
      ),
  },
  {
    key: "action",
    header: "Action",
    cell: (log) => (
      <StatusBadge
        dot={false}
        label={auditActionLabel(log.action)}
        tone="info"
      />
    ),
  },
  {
    key: "entity",
    header: "Entity",
    cell: (log) => (
      <span className="text-xs">
        {log.entity}
        {log.entityId ? (
          <span className="block font-mono text-[11px] text-muted-foreground">
            {log.entityId}
          </span>
        ) : null}
      </span>
    ),
  },
  {
    key: "meta",
    header: "Details",
    cell: (log) => (
      <span className="text-xs break-words text-muted-foreground">
        {metaSummary(log.meta)}
      </span>
    ),
  },
];

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;
  const parsed = auditLogQuerySchema.safeParse({
    entity: first(raw.entity),
    action: first(raw.action),
    page: first(raw.page),
    limit: first(raw.limit),
  });

  const filters = parsed.success ? parsed.data : {};
  const res = await adminService.auditLogs(filters);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const single = first(value);
    if (single) params.set(key, single);
  }
  const urlParams = toUrlParamRecord(params);

  if (!res.success || !res.data) {
    return (
      <>
        <DashboardPageHeader
          description="Every privileged mutation, newest first."
          title="Audit logs"
        />
        <ErrorState message={res.message || VALIDATION_MESSAGES.unknown} />
      </>
    );
  }

  const { items, meta } = res.data;
  const filtered = Boolean(filters.entity || filters.action);

  return (
    <>
      <DashboardPageHeader
        description="Every privileged mutation, newest first. The API exposes no write endpoint, so entries are read-only."
        title="Audit logs"
      />

      <Suspense>
        <AuditLogFilters />
      </Suspense>

      <DashboardPanel
        contentClassName="flex flex-col gap-4 p-0 sm:p-0"
        description={`${meta.total} ${meta.total === 1 ? "entry" : "entries"} recorded`}
        title="Activity trail"
      >
        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              body={
                filtered
                  ? "No entries match these filters. Clear them to see the full trail."
                  : "Nothing has been logged yet. Entries appear when a status, assessment, invitation, or payment changes."
              }
              Icon={ScrollTextIcon}
              title={filtered ? "No matching entries" : "No audit entries yet"}
            />
          </div>
        ) : (
          <>
            <DataTable
              caption="Audit log entries with actor, action, entity, and metadata"
              columns={COLUMNS}
              getRowKey={(log) => log.id}
              rows={items}
            />
            <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <PageSizeNote
                limit={meta.limit}
                pathname="/dashboard/admin/audit-logs"
                searchParams={urlParams}
              />
              <PaginationBar
                label="entries"
                meta={meta}
                pathname="/dashboard/admin/audit-logs"
                searchParams={urlParams}
              />
            </div>
          </>
        )}
      </DashboardPanel>
    </>
  );
}
