"use client";

import {
  ClearFiltersButton,
  FilterSelect,
  SearchInput,
  useUrlState,
} from "@/hooks/use-url-state";

export function UserFilters() {
  const { query, setQuery, setParam, clearFilters, params, pending } =
    useUrlState();
  const role = params.get("role") ?? "";
  const status = params.get("status") ?? "";
  const page = params.get("page") ?? "1";
  const limit = params.get("limit") ?? "10";

  const isFiltered = Boolean(query || role || status || page !== "1");

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
      <SearchInput
        busy={pending}
        label="Search"
        onChange={setQuery}
        placeholder="Name or email…"
        value={query}
      />

      <FilterSelect
        label="Role"
        onChange={(value) => setParam("role", value || null)}
        options={[
          { value: "", label: "All roles" },
          { value: "CANDIDATE", label: "Candidate" },
          { value: "RECRUITER", label: "Recruiter" },
          { value: "ADMIN", label: "Admin" },
        ]}
        value={role}
      />

      <FilterSelect
        label="Status"
        onChange={(value) => setParam("status", value || null)}
        options={[
          { value: "", label: "All statuses" },
          { value: "ACTIVE", label: "Active" },
          { value: "SUSPENDED", label: "Suspended" },
        ]}
        value={status}
      />

      <FilterSelect
        label="Per page"
        onChange={(value) => {
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
    </div>
  );
}
