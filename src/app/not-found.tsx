import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ErrorCard } from "@/components/shared/error-card";
import { LinkButton } from "@/components/ui/link-button";
import { APP_NAME } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar />
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-mesh-brand"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-faint opacity-50"
        />

        <div className="relative flex w-full max-w-xl flex-col items-center gap-6 animate-fade-up">
          <p
            aria-hidden
            className="font-mono text-6xl font-medium text-gradient-brand sm:text-7xl"
          >
            404
          </p>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="font-heading text-lg font-medium">
              This page does not exist
            </h1>
            <p className="text-sm/relaxed text-muted-foreground">
              The link may be out of date, or the assessment, question or record
              behind it may have been removed. Your account and its data are
              untouched.
            </p>
          </div>

          <ErrorCard
            className="rounded-2xl"
            variant="empty"
            title="Where to go instead"
            description={`${APP_NAME} has a public marketing site, plus a dashboard for each role once you sign in.`}
            action={
              <>
                <LinkButton href="/">Back to home</LinkButton>
                <LinkButton href="/login" variant="outline">
                  Sign in
                </LinkButton>
                <LinkButton href="/contact" variant="outline">
                  Contact support
                </LinkButton>
              </>
            }
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
