"use client";

import { DashboardPageHeader } from "@/components/shared/dashboard-shell";
import { SectionError } from "@/components/shared/section-error";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <DashboardPageHeader title="Profile" />
      <SectionError
        backHref="/profile"
        backLabel="Back to profile"
        error={error}
        reset={reset}
        title="Your profile could not load"
      />
    </>
  );
}
