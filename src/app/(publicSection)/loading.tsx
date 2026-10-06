import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <output
      aria-busy="true"
      className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-16 animate-fade-in sm:px-6 lg:px-8"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-12 w-full max-w-2xl" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="mt-2 h-9 w-64" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {["a", "b", "c", "d", "e", "f"].map((slot) => (
          <div
            className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 shadow-sm"
            key={slot}
          >
            <Skeleton className="size-10 rounded-xl" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </output>
  );
}
