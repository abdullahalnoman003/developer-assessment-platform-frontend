import { Skeleton } from "@/components/ui/skeleton";

const QUICK_ACCESS_ROWS = ["a", "b", "c"];

export default function AuthLoading() {
  return (
    <div
      aria-busy="true"
      className="flex w-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm"
    >
      <Skeleton className="h-1 w-full rounded-none" />

      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="size-10 rounded-xl" />
          <Skeleton className="mt-1 h-6 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>

        <div className="flex flex-col gap-5">
          {["email", "password"].map((field) => (
            <div className="flex flex-col gap-1.5" key={field}>
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
          <Skeleton className="h-9 w-full" />
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-border/70 p-3.5">
          <Skeleton className="h-3 w-24" />
          {QUICK_ACCESS_ROWS.map((row) => (
            <Skeleton className="h-12 w-full rounded-lg" key={row} />
          ))}
        </div>
      </div>

      <span className="sr-only">Loading sign in…</span>
    </div>
  );
}
