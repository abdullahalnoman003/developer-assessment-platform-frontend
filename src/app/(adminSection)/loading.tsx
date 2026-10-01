import {
  CardListSkeleton,
  PageSkeleton,
  StatCardsSkeleton,
  TableSkeleton,
} from "@/components/shared/skeletons";

export default function AdminLoading() {
  return (
    <PageSkeleton>
      <StatCardsSkeleton count={4} />
      <div className="grid gap-4 lg:grid-cols-2">
        <CardListSkeleton count={1} />
        <CardListSkeleton count={1} />
      </div>
      <TableSkeleton columns={5} rows={6} />
      <span className="sr-only">Loading the admin section…</span>
    </PageSkeleton>
  );
}
