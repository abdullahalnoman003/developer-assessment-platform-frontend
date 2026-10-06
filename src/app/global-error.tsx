"use client";

import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { ErrorCard } from "@/components/shared/error-card";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { APP_NAME } from "@/lib/constants";
import { VALIDATION_MESSAGES } from "@/lib/messages";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    toast.error(VALIDATION_MESSAGES.unknown, { id: "global-error" });
  }, [error]);

  const message =
    process.env.NODE_ENV === "development" && error.message
      ? error.message
      : null;

  return (
    <html
      lang="en"
      className={`h-full ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full items-center justify-center bg-background p-6 text-foreground font-sans antialiased animate-fade-in">
        <main className="flex w-full max-w-xl flex-col items-center gap-6">
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase">
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
                <Button
                  onClick={() => {
                    reset();
                    window.location.reload();
                  }}
                >
                  Reload the app
                </Button>
                <LinkButton href="/" variant="outline">
                  Go to the home page
                </LinkButton>
              </>
            }
          />

          <p className="text-center text-xs text-muted-foreground">
            If this keeps happening, the CodeArena API may be down. Reload again
            once it is back.
          </p>
        </main>
      </body>
    </html>
  );
}
