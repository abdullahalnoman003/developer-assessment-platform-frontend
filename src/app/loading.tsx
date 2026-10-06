import { Skeleton } from "@/components/ui/skeleton";

const CARDS = ["card-a", "card-b", "card-c"] as const;

export default function RootLoading() {
  return (
    <div
      aria-busy="true"
      className="mx-auto w-full max-w-7xl animate-fade-in px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-3 w-96 max-w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <Skeleton className="h-32 w-full rounded-2xl" key={card} />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
      <span aria-live="polite" className="sr-only">
        Loading…
      </span>
    </div>
  );
}
