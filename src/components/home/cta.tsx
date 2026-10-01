import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Container, Section } from "@/components/home/page-hero";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export function Cta() {
  return (
    <Section>
      <Container>
        <div className="flex flex-col items-center gap-5 border border-primary/40 bg-primary/5 px-6 py-12 text-center sm:py-16">
          <h2 className="max-w-2xl font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            See the whole loop before you commit to it
          </h2>
          <p className="max-w-xl text-sm/relaxed text-muted-foreground text-pretty">
            Sign in with a demo account to walk the recruiter, candidate and
            admin views against real seeded data, or create your own company and
            build a question bank from scratch.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button render={<Link href="/login" />} size="lg">
              Try a demo account
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <Button
              render={<Link href="/register" />}
              size="lg"
              variant="outline"
            >
              Create an account
            </Button>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {APP_NAME} · no credit card needed to explore
          </p>
        </div>
      </Container>
    </Section>
  );
}
