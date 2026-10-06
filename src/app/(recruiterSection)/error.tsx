"use client";

import { SectionError } from "@/components/shared/section-error";

export default function RecruiterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SectionError
      backHref="/dashboard/recruiter"
      backLabel="Back to overview"
      error={error}
      reset={reset}
      title="The recruiter dashboard could not load"
    />
  );
}
