"use client";

import { SectionError } from "@/components/shared/section-error";

export default function CandidateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SectionError
      backHref="/dashboard/candidate"
      backLabel="Back to overview"
      error={error}
      reset={reset}
      title="The candidate dashboard could not load"
    />
  );
}
