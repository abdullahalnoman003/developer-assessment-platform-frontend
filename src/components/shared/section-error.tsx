"use client";

import { useEffect } from "react";
import { ErrorCard } from "@/components/shared/error-card";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { VALIDATION_MESSAGES } from "@/lib/messages";

export interface SectionErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  title: string;
  backHref: string;
  backLabel: string;
}

export function SectionError({
  error,
  reset,
  title,
  backHref,
  backLabel,
}: SectionErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const message =
    process.env.NODE_ENV === "development" && error.message
      ? error.message
      : null;

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center px-4 py-16 animate-fade-up">
      <ErrorCard
        variant="blocked"
        title={title}
        description={VALIDATION_MESSAGES.network}
        message={message}
        digest={error.digest}
        action={
          <>
            <Button onClick={reset} size="sm">
              Try again
            </Button>
            <LinkButton href={backHref} size="sm" variant="outline">
              {backLabel}
            </LinkButton>
          </>
        }
      />
    </div>
  );
}
