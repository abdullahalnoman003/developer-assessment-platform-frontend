"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { ErrorCard } from "@/components/shared/error-card";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Skeleton } from "@/components/ui/skeleton";
import { VALIDATION_MESSAGES } from "@/lib/messages";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    toast.error(VALIDATION_MESSAGES.unknown, { id: "root-error" });
  }, []);

  const message =
    process.env.NODE_ENV === "development" && error.message
      ? error.message
      : null;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="flex w-full max-w-xl flex-col items-center gap-6">
        <ErrorCard
          variant="blocked"
          title="Something went wrong"
          description="This part of the page could not be loaded. Nothing was changed, so it is safe to try again."
          message={message}
          digest={error.digest}
          action={
            <>
              <Button onClick={reset}>Try again</Button>
              <LinkButton href="/" variant="outline">
                Back to home
              </LinkButton>
            </>
          }
        />

        <div aria-hidden className="flex w-full flex-col gap-2 opacity-40">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </main>
  );
}
