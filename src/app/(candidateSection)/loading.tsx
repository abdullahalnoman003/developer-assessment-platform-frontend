import {
  CardListSkeleton,
  PageSkeleton,
  StatCardsSkeleton,
  TableSkeleton,
} from "@/components/shared/skeletons";

export default function CandidateLoading() {
  return (
    <PageSkeleton>
      <StatCardsSkeleton count={4} />
      <CardListSkeleton count={2} />
      <TableSkeleton columns={5} rows={6} />
      <span className="sr-only">Loading your dashboard…</span>
    </PageSkeleton>
  );
}
