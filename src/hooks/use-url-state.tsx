"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export interface UrlStateOptions {
  debounceMs?: number;
  resetKeys?: readonly string[];
}

// hoisted so the default keeps one identity across renders
const DEFAULT_RESET_KEYS: readonly string[] = ["page"];

export function useUrlState({
  debounceMs = 400,
  resetKeys = DEFAULT_RESET_KEYS,
}: UrlStateOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const urlQuery = searchParams.get("q") ?? "";

  // the URL wins, so back/forward and external links stay in sync
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  // only push when the typed query actually diverged from the URL, otherwise
  // a pagination or filter change would be reset right back again
  useEffect(() => {
    if (query === urlQuery) return;

    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      for (const key of resetKeys) {
        params.delete(key);
      }
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    }, debounceMs);

    return () => clearTimeout(handle);
  }, [query, urlQuery, debounceMs, pathname, router, resetKeys, searchParams]);

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      for (const reset of resetKeys) {
        if (reset !== key) params.delete(reset);
      }
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, resetKeys, router, searchParams],
  );

  const clearFilters = useCallback(() => {
    setQuery("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }, [pathname, router]);

  return {
    query,
    setQuery,
    setParam,
    clearFilters,
    params: searchParams,
    pending,
    isBusy: pending,
  };
}

export function SearchInput({
  value,
  onChange,
  busy,
  placeholder = "Search…",
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  busy?: boolean;
  placeholder?: string;
  label: string;
}) {
  // per-instance id so two filter bars never collide
  const id = useId();
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-xs">
      <label
        className="font-mono text-xs tracking-wider text-muted-foreground uppercase"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="relative">
        <Input
          autoComplete="off"
          className="pr-8"
          id={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type="search"
          value={value}
        />
        {busy ? (
          <Spinner className="absolute inset-y-0 right-2 my-auto size-3.5" />
        ) : null}
      </div>
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label
        className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase"
        htmlFor={id}
      >
        {label}
      </label>
      <select
        className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ClearFiltersButton({ onClick }: { onClick: () => void }) {
  return (
    <Button className="self-end" onClick={onClick} size="sm" variant="ghost">
      Clear filters
    </Button>
  );
}
