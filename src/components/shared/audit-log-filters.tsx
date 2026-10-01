"use client";

import {
  ClearFiltersButton,
  FilterSelect,
  useUrlState,
} from "@/hooks/use-url-state";
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from "@/lib/constants";

export function AuditLogFilters() {
  const { setParam, clearFilters, params, pending } = useUrlState();
  const entity = params.get("entity") ?? "";
  const action = params.get("action") ?? "";
  const page = params.get("page") ?? "1";

  const isFiltered = Boolean(entity || action || page !== "1");

  return (
    <div
      className="flex flex-col gap-3 border border-border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-end"
      data-busy={pending || undefined}
    >
      <FilterSelect
        label="Entity"
        onChange={(value) => setParam("entity", value || null)}
        options={AUDIT_ENTITIES}
        value={entity}
      />

      <FilterSelect
        label="Action"
        onChange={(value) => setParam("action", value || null)}
        options={AUDIT_ACTIONS}
        value={action}
      />

      {isFiltered ? <ClearFiltersButton onClick={clearFilters} /> : null}
    </div>
  );
}
