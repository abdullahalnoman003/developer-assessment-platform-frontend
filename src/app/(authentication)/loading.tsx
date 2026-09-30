import { Skeleton } from "@/components/ui/skeleton";

const DEMO_SLOTS = ["a", "b", "c"];

export default function AuthLoading() {
  return (
    <div
      aria-busy="true"
      className="flex w-full flex-col gap-6 border border-border bg-card p-6"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3 w-48" />
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

      <div className="grid gap-2 sm:grid-cols-3">
        {DEMO_SLOTS.map((slot) => (
          <Skeleton className="h-14 w-full" key={slot} />
        ))}
      </div>

      <span className="sr-only">Loading sign in…</span>
    </div>
  );
}
