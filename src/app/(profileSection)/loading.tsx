import {
  DashboardPageHeader,
  DashboardPanel,
} from "@/components/shared/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <>
      <DashboardPageHeader
        description="Loading your profile…"
        title="Profile"
      />
      <DashboardPanel title="Identity">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </DashboardPanel>
    </>
  );
}
