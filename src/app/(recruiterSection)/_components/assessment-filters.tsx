"use client";

import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  ClearFiltersButton,
  FilterSelect,
  useUrlState,
} from "@/hooks/use-url-state";
import { ASSESSMENT_STATUS_LABELS } from "@/lib/constants";
import type { AssessmentStatus, UrlParamRecord } from "@/lib/types";

const STATUS_OPTIONS = Object.entries(ASSESSMENT_STATUS_LABELS) as readonly [
  AssessmentStatus,
  string,
][];

/**
 * Sorting lives in the table header as a link (see `SortableHeader`), so this
 * bar owns only the filters. URL state per final.md §7:
 * `status`, `sortBy`, `sortOrder`, `page`, `limit`.
 */
export function AssessmentFilters() {
  const { setParam, clearFilters, params, pending } = useUrlState();
  const [limit, setLimit] = useState(params.get("limit") ?? "10");
  const status = params.get("status") ?? "";
  const sortBy = params.get("sortBy") ?? "";
  const sortOrder = params.get("sortOrder") ?? "";
  const page = params.get("page") ?? "1";

  const isFiltered = Boolean(
    status || sortBy || sortOrder || page !== "1" || limit !== "10",
  );

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

      <FilterSelect
        label="Sort by"
        onChange={(value) => {
          if (!value) {
            setParam("sortBy", null);
            setParam("sortOrder", null);
            return;
          }
          setParam("sortBy", value);
          setParam("sortOrder", sortOrder || "asc");
        }}
        options={[
          { value: "", label: "Default order" },
          { value: "title", label: "Title" },
          { value: "createdAt", label: "Created" },
        ]}
        value={sortBy}
      />

      <FilterSelect
        label="Direction"
        onChange={(value) => setParam("sortOrder", value || null)}
        options={[
          { value: "", label: "Default order" },
          { value: "asc", label: "Ascending" },
          { value: "desc", label: "Descending" },
        ]}
        value={sortOrder}
      />

      <FilterSelect
        label="Per page"
        onChange={(value) => {
          setLimit(value);
          setParam("limit", value === "10" ? null : value);
        }}
        options={[
          { value: "10", label: "10" },
          { value: "25", label: "25" },
          { value: "50", label: "50" },
        ]}
        value={limit}
      />

      {isFiltered ? <ClearFiltersButton onClick={clearFilters} /> : null}

      {pending ? (
        <output aria-live="polite" className="sr-only">
          Updating list
        </output>
      ) : null}
    </div>
  );
}

/**
 * A sortable table header. Rendered as a link so the ordering lives in the URL
 * and works with JavaScript disabled, matching the `PaginationBar` pattern.
 */
export function SortableHeader({
  column,
  label,
  currentSortBy,
  currentSortOrder,
  pathname,
  searchParams,
}: {
  column: "title" | "createdAt";
  label: string;
  currentSortBy: string;
  currentSortOrder: string;
  pathname: string;
  searchParams: UrlParamRecord;
}) {
  const isActive = currentSortBy === column;
  const nextOrder = isActive && currentSortOrder === "asc" ? "desc" : "asc";

  const params = new URLSearchParams(searchParams);
  params.set("sortBy", column);
  params.set("sortOrder", nextOrder);
  params.delete("page");

  const Icon = !isActive
    ? ArrowUpDownIcon
    : currentSortOrder === "asc"
      ? ArrowUpIcon
      : ArrowDownIcon;

  return (
    <Link
      className="inline-flex items-center gap-1 hover:text-foreground"
      href={`${pathname}?${params.toString()}`}
      scroll={false}
    >
      {label}
      <Icon aria-hidden className={isActive ? "size-3" : "size-3 opacity-40"} />
      <span className="sr-only">
        {isActive
          ? `sorted ${nextOrder === "asc" ? "descending" : "ascending"}, activate to reverse`
          : "not sorted, activate to sort ascending"}
      </span>
    </Link>
  );
}
