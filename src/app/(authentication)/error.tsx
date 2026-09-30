"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ErrorCard } from "@/components/shared/error-card";
import { Button } from "@/components/ui/button";
import { VALIDATION_MESSAGES } from "@/lib/messages";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorCard
      action={
        <>
          <Button onClick={reset} size="sm">
            Try again
          </Button>
          <Button render={<Link href="/login" />} size="sm" variant="outline">
            Back to sign in
          </Button>
        </>
      }
      description="We could not load this page. The API may be unreachable or the session expired."
      digest={error.digest ?? null}
      message={VALIDATION_MESSAGES.network}
      title="Auth page failed to load"
      variant="blocked"
    />
  );
}
