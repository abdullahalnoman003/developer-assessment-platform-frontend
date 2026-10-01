import { ArrowRightIcon, TerminalIcon } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/home/page-hero";
import { Button } from "@/components/ui/button";

const SIGNALS = [
  "MCQ auto-grading",
  "Written + coding review",
  "Release-controlled results",
  "Credit-based invitations",
] as const;

export function Hero() {
  return (
    <div className="relative border-b border-border bg-grid-faint">
      <Container className="flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        <p className="inline-flex items-center gap-2 border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
          <TerminalIcon className="size-3.5" />
          Developer assessment platform
        </p>

        <h1 className="max-w-4xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          <span className="text-gradient-brand">
            Rigorous technical screening
          </span>{" "}
          without the scheduling overhead
        </h1>

        <p className="max-w-2xl text-base/relaxed text-muted-foreground text-pretty sm:text-lg">
          CodeArena turns a question bank into a timed, graded assessment. You
          build the test, invite the candidate, and score the parts a machine
          cannot — in one shared workspace.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button render={<Link href="/register?role=RECRUITER" />} size="lg">
            Start hiring
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
          <Button
            render={<Link href="/how-it-works" />}
            size="lg"
            variant="outline"
          >
            See how it works
          </Button>
        </div>

        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {SIGNALS.map((signal) => (
            <li
              className="font-mono text-xs text-muted-foreground"
              key={signal}
            >
              {signal}
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
