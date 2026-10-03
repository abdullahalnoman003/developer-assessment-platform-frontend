"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { PaginatedMeta, UrlParamRecord } from "@/lib/types";

function buildHref(
  pathname: string,
  searchParams: UrlParamRecord,
  page: number,
): string {
  const params = new URLSearchParams(searchParams);
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current]);
  for (const offset of [-1, 1]) {
    const candidate = current + offset;
    if (candidate > 1 && candidate < total) pages.add(candidate);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];

  for (let i = 0; i < sorted.length; i += 1) {
    const value = sorted[i];
    if (i > 0 && value - sorted[i - 1] > 1) out.push("gap");
    out.push(value);
  }

  return out;
}

export function PaginationBar({
  meta,
  pathname,
  searchParams,
  label = "results",
}: {
  meta: PaginatedMeta;
  pathname: string;
  searchParams: UrlParamRecord;
  label?: string;
}) {
  const { page, limit, total, totalPages } = meta;

  if (total === 0) {
    return null;
  }

  const firstRow = (page - 1) * limit + 1;
  const lastRow = Math.min(page * limit, total);
  const window = pageWindow(page, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs/relaxed text-muted-foreground">
        Showing <span className="tabular-nums">{firstRow}</span>–
        <span className="tabular-nums">{lastRow}</span> of{" "}
        <span className="tabular-nums">{total}</span> {label}
        {totalPages > 1 ? (
          <span className="ml-1">
            · page {page} of {totalPages}
          </span>
        ) : null}
      </p>

      {totalPages > 1 ? (
        <Pagination className="mx-0 w-full justify-start sm:w-auto sm:justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                aria-disabled={page <= 1}
                href={buildHref(pathname, searchParams, Math.max(1, page - 1))}
              />
            </PaginationItem>

            {window.map((entry) =>
              entry === "gap" ? (
                <PaginationItem key="gap">
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={entry}>
                  <PaginationLink
                    href={buildHref(pathname, searchParams, entry)}
                    isActive={entry === page}
                    size="icon"
                  >
                    {entry}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                aria-disabled={page >= totalPages}
                href={buildHref(
                  pathname,
                  searchParams,
                  Math.min(totalPages, page + 1),
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
}

export function PageSizeNote({
  pathname,
  searchParams,
  limit,
  options = [10, 25, 50],
}: {
  pathname: string;
  searchParams: UrlParamRecord;
  limit: number;
  options?: readonly number[];
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Per page</span>
      {options.map((option) => {
        const params = new URLSearchParams(searchParams);
        params.set("limit", String(option));
        params.delete("page");
        return (
          <Button
            aria-current={option === limit ? "true" : undefined}
            aria-label={`${option} results per page`}
            key={option}
            render={<Link href={`${pathname}?${params.toString()}`} />}
            size="sm"
            variant={option === limit ? "outline" : "ghost"}
          >
            {option}
          </Button>
        );
      })}
    </div>
  );
}
