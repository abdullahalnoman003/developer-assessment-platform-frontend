"use client";

import {
  ClearFiltersButton,
  FilterSelect,
  SearchInput,
  useUrlState,
} from "@/hooks/use-url-state";

export function QuestionFilters() {
  const { query, setQuery, setParam, clearFilters, params, pending } =
    useUrlState();
  // derived, not seeded, so a <Link> page-size change stays in sync
  const limit = params.get("limit") ?? "10";
  const type = params.get("type") ?? "";
  const difficulty = params.get("difficulty") ?? "";
  const page = params.get("page") ?? "1";

  const isFiltered = Boolean(
    query || type || difficulty || page !== "1" || limit !== "10",
  );

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
      <SearchInput
        busy={pending}
        label="Search"
        onChange={setQuery}
        placeholder="Title, body, or tag…"
        value={query}
      />

      <FilterSelect
        label="Type"
        onChange={(value) => setParam("type", value || null)}
        options={[
          { value: "", label: "All types" },
          { value: "MCQ", label: "Multiple choice" },
          { value: "WRITTEN", label: "Written" },
          { value: "CODING", label: "Coding" },
        ]}
        value={type}
      />

      <FilterSelect
        label="Difficulty"
        onChange={(value) => setParam("difficulty", value || null)}
        options={[
          { value: "", label: "All difficulties" },
          { value: "EASY", label: "Easy" },
          { value: "MEDIUM", label: "Medium" },
          { value: "HARD", label: "Hard" },
        ]}
        value={difficulty}
      />

      <FilterSelect
        label="Per page"
        onChange={(value) => setParam("limit", value === "10" ? null : value)}
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
