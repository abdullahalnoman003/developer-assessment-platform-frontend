"use client";

import { useEffect } from "react";
import { ErrorCard } from "@/components/shared/error-card";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { VALIDATION_MESSAGES } from "@/lib/messages";

export default function PublicError({
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
    <div className="mx-auto w-full max-w-2xl px-4 py-20 sm:px-6">
      <ErrorCard
        action={
          <>
            <Button onClick={reset} size="sm">
              Try again
            </Button>
            <LinkButton href="/" size="sm" variant="outline">
              Back to home
            </LinkButton>
          </>
        }
        description="This page could not be rendered. Nothing you entered has been lost."
        digest={error.digest ?? null}
        message={VALIDATION_MESSAGES.unknown}
        title="Page failed to load"
        variant="blocked"
      />
    </div>
  );
}
