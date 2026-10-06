import { Skeleton } from "@/components/ui/skeleton";

const ROWS = ["row-a", "row-b", "row-c", "row-d", "row-e", "row-f"] as const;

export default function PaymentLoading() {
  return (
    <div
      aria-busy="true"
      className="mx-auto flex w-full max-w-2xl animate-fade-in flex-col gap-5 px-4 py-14 sm:px-6 sm:py-20"
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
        <Skeleton className="size-12 rounded-xl" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-64 max-w-full" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-2/3 max-w-full" />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
        <Skeleton className="h-4 w-24" />
        <div className="grid gap-4 sm:grid-cols-2">
          {ROWS.map((row) => (
            <div className="flex flex-col gap-1.5" key={row}>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-40" />
      </div>

      <span className="sr-only">Loading payment result…</span>
    </div>
  );
}
