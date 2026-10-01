"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export interface UrlStateOptions {
  debounceMs?: number;
  resetKeys?: readonly string[];
}

export function useUrlState({
  debounceMs = 400,
  resetKeys = ["page"],
}: UrlStateOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const first = useRef(true);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

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
  }, [query, debounceMs, pathname, router, resetKeys, searchParams]);

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
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-xs">
      <label
        className="font-mono text-xs tracking-wider text-muted-foreground uppercase"
        htmlFor="search-input"
      >
        {label}
      </label>
      <div className="relative">
        <Input
          autoComplete="off"
          className="pr-8"
          id="search-input"
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
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label
        className="font-mono text-xs tracking-wider text-muted-foreground uppercase"
        htmlFor={`filter-${label}`}
      >
        {label}
      </label>
      <select
        className="h-9 w-full rounded-none border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
        id={`filter-${label}`}
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
