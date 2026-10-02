import {
  CardListSkeleton,
  FormSkeleton,
  PageSkeleton,
  StatCardsSkeleton,
  TableSkeleton,
} from "@/components/shared/skeletons";

export default function RecruiterLoading() {
  return (
    <PageSkeleton>
      <StatCardsSkeleton count={4} />
      <CardListSkeleton count={1} />
      <TableSkeleton columns={5} rows={6} />
      <FormSkeleton fields={3} />
      <span className="sr-only">Loading the recruiter section…</span>
    </PageSkeleton>
  );
}
