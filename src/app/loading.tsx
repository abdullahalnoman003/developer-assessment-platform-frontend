import { PageSkeleton, StatCardsSkeleton } from "@/components/shared/skeletons";

export default function RootLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageSkeleton>
        <StatCardsSkeleton count={3} />
      </PageSkeleton>
    </div>
  );
}
