"use client";

import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VALIDATION_MESSAGES } from "@/lib/messages";

export default function RecruiterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <span
        aria-hidden
        className="flex size-10 items-center justify-center border border-destructive/40 bg-destructive/10 text-destructive"
      >
        <AlertTriangleIcon className="size-5" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-lg font-semibold">
          The recruiter page could not load
        </h1>
        <p className="text-sm/relaxed text-muted-foreground">
          {VALIDATION_MESSAGES.network}
        </p>
        {error.digest ? (
          <p className="font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={reset} size="sm">
          <RefreshCwIcon className="size-3.5" />
          Try again
        </Button>
        <Button
          render={<Link href="/dashboard/recruiter" />}
          size="sm"
          variant="outline"
        >
          Back to overview
        </Button>
      </div>
    </div>
  );
}
