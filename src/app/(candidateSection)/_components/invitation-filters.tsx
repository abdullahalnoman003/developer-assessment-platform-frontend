"use client";

import {
  ClearFiltersButton,
  FilterSelect,
  useUrlState,
} from "@/hooks/use-url-state";
import { INVITATION_STATUS_LABELS } from "@/lib/constants";
import type { InvitationStatus } from "@/lib/types";

const STATUS_OPTIONS = Object.entries(INVITATION_STATUS_LABELS) as readonly [
  InvitationStatus,
  string,
][];

export function InvitationFilters() {
  const { setParam, clearFilters, params, pending } = useUrlState();
  const status = params.get("status") ?? "";

  const isFiltered = Boolean(status) || params.get("page") !== null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
      <FilterSelect
        label="Status"
        onChange={(value) => setParam("status", value || null)}
        options={[
          { value: "", label: "All statuses" },
          ...STATUS_OPTIONS.map(([value, label]) => ({ value, label })),
        ]}
        value={status}
      />

      {isFiltered ? <ClearFiltersButton onClick={clearFilters} /> : null}

      {pending ? (
        <output aria-live="polite" className="sr-only">
          Updating invitations
        </output>
      ) : null}
    </div>
  );
}
