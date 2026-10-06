"use client";

import { SectionError } from "@/components/shared/section-error";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SectionError
      backHref="/dashboard/admin"
      backLabel="Back to dashboard"
      error={error}
      reset={reset}
      title="The admin dashboard could not load"
    />
  );
}
