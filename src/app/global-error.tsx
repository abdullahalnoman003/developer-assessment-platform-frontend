"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { ErrorCard } from "@/components/shared/error-card";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { VALIDATION_MESSAGES } from "@/lib/messages";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    toast.error(VALIDATION_MESSAGES.unknown, { id: "global-error" });
  }, []);

  const message =
    process.env.NODE_ENV === "development" && error.message
      ? error.message
      : null;

  return (
    <html lang="en" className="h-full">
      <body
        className="flex min-h-full items-center justify-center bg-background p-6 text-foreground"
        style={{
          margin: 0,
          background: "oklch(0.99 0.005 272)",
          color: "oklch(0.18 0.02 272)",
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        }}
      >
        <main className="flex w-full max-w-xl flex-col items-center gap-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {APP_NAME}
          </p>

          <ErrorCard
            variant="blocked"
            title="The application failed to start"
            description="A fault outside this page stopped the app from rendering. Reloading usually clears it."
            message={message}
            digest={error.digest}
            action={
              <>
                <Button onClick={reset}>Reload the app</Button>
                <a
                  href="/"
                  className="inline-flex h-7 items-center rounded-md border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Go to the home page
                </a>
              </>
            }
          />

          <p className="text-center text-xs text-muted-foreground">
            If this keeps happening, the CodeArena API on port 5000 may be down.
            Reload again once it is back.
          </p>
        </main>
      </body>
    </html>
  );
}
