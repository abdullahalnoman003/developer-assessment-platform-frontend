import { ArrowRightIcon } from "lucide-react";
import { Container, Section } from "@/components/home/page-hero";
import { LinkButton } from "@/components/ui/link-button";
import { APP_NAME } from "@/lib/constants";

export function Cta() {
  return (
    <Section>
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-brand/25 bg-brand-soft-gradient px-6 py-14 text-center shadow-lg sm:px-12 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grid-faint opacity-40"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-3/4 -translate-x-1/2 rounded-full bg-gradient-brand opacity-20 blur-3xl"
          />

          <div className="relative mx-auto flex max-w-2xl animate-fade-up flex-col items-center gap-5">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-background/70 px-3 py-1 font-mono text-[0.6875rem] font-semibold tracking-[0.16em] text-brand uppercase">
              Get started
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-[-0.02em] text-balance sm:text-4xl">
              See the whole loop before you commit to it
            </h2>
            <p className="max-w-xl text-base/relaxed text-muted-foreground text-pretty">
              Sign in to walk the recruiter, candidate and admin workflows end
              to end against realistic data, or create your own company and
              build a question bank from scratch.
            </p>
            <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
              <LinkButton className="w-full sm:w-auto" href="/login" size="lg">
                Sign in to explore
                <ArrowRightIcon data-icon="inline-end" />
              </LinkButton>
              <LinkButton
                className="w-full sm:w-auto"
                href="/register"
                size="lg"
                variant="outline"
              >
                Create an account
              </LinkButton>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              {APP_NAME} · no credit card needed to explore
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
