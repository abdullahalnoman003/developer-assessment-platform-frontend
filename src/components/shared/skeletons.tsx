import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SLOTS = Array.from({ length: 12 }, (_, i) => `slot-${i}`);

function slots(count: number): readonly string[] {
  return SLOTS.slice(0, Math.max(0, Math.min(count, SLOTS.length)));
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {slots(count).map((slot) => (
        <div
          key={slot}
          className="flex flex-col gap-2 border border-border bg-card p-4"
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  const template = `repeat(${columns}, minmax(0, 1fr))`;

  return (
    <div className="flex flex-col gap-2" aria-hidden>
      <div
        className="grid gap-3 border-b border-border pb-2"
        style={{ gridTemplateColumns: template }}
      >
        {slots(columns).map((slot) => (
          <Skeleton key={slot} className="h-3 w-full max-w-24" />
        ))}
      </div>
      {slots(rows).map((row) => (
        <div
          key={row}
          className="grid items-center gap-3 py-2"
          style={{ gridTemplateColumns: template }}
        >
          {slots(columns).map((column) => (
            <Skeleton key={column} className="h-4 w-full max-w-32" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" aria-hidden>
      {slots(count).map((slot) => (
        <div
          key={slot}
          className="flex flex-col gap-3 border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="size-5" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-7 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="flex max-w-xl flex-col gap-4" aria-hidden>
      {slots(fields).map((slot) => (
        <div key={slot} className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
      <Skeleton className="mt-2 h-8 w-32" />
    </div>
  );
}

export function PageSkeleton({
  title = true,
  className,
  children,
}: {
  title?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <output
      aria-busy="true"
      className={cn("flex w-full flex-col gap-6", className)}
    >
      {title ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-3 w-80 max-w-full" />
        </div>
      ) : null}
      {children}
      <span className="sr-only">Loading…</span>
    </output>
  );
}
