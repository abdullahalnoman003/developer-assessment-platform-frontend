import { ErrorCard } from "@/components/shared/error-card";
import { LinkButton } from "@/components/ui/link-button";
import { APP_NAME } from "@/lib/constants";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="flex w-full max-w-xl flex-col items-center gap-6">
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
          variant="empty"
          title="Where to go instead"
          description={`${APP_NAME} has a public marketing site, plus a dashboard for each role once you sign in.`}
          action={
            <>
              <LinkButton href="/">Back to home</LinkButton>
              <LinkButton href="/dashboard/candidate" variant="outline">
                Candidate dashboard
              </LinkButton>
              <LinkButton href="/login" variant="outline">
                Sign in
              </LinkButton>
            </>
          }
        />
      </div>
    </main>
  );
}
