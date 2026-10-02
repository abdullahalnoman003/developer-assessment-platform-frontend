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

/**
 * The candidate's only filterable list state, per final.md §7: `status` and
 * `page`. `useUrlState` already resets `page` to 1 whenever `status` changes,
 * so the bar never has to do it itself.
 *
 * The select reads its value from the URL on every render rather than from a
 * local `useState`, which is the drift §0.7 D warned about for the admin page
 * size — the server is always the source of truth.
 */
export function InvitationFilters() {
  const { setParam, clearFilters, params, pending } = useUrlState();
  const status = params.get("status") ?? "";

  const isFiltered = Boolean(status) || params.get("page") !== null;

  return (
    <div className="flex flex-col gap-3 border border-border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-end">
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
