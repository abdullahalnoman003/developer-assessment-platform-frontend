import {
  ArrowRightIcon,
  CheckCircle2Icon,
  CodeIcon,
  FileTextIcon,
  ListChecksIcon,
  SparklesIcon,
} from "lucide-react";
import { Container } from "@/components/home/page-hero";
import { LinkButton } from "@/components/ui/link-button";

const SIGNALS = [
  "MCQ auto-grading",
  "Written + coding review",
  "Release-controlled results",
  "Credit-based invitations",
] as const;

const PREVIEW_ROWS = [
  {
    Icon: ListChecksIcon,
    label: "Frontend Engineer · Screening",
    meta: "12 questions · 45 min",
    status: "Published",
    tone: "ok",
  },
  {
    Icon: CodeIcon,
    label: "Backend Engineer · Practical",
    meta: "8 questions · 90 min",
    status: "2 in review",
    tone: "warn",
  },
  {
    Icon: FileTextIcon,
    label: "Data Analyst · Written only",
    meta: "6 questions · 30 min",
    status: "Draft",
    tone: "idle",
  },
] as const;

const TONE_CLASS = {
  ok: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warn: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  idle: "bg-muted text-muted-foreground",
} as const;

function HeroPreview() {
  return (
    <div className="relative min-w-0">
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2.5rem] bg-gradient-brand opacity-20 blur-3xl"
      />

      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border/70 bg-muted/50 px-4 py-3">
          <span className="size-2.5 shrink-0 rounded-full bg-red-400" />
          <span className="size-2.5 shrink-0 rounded-full bg-amber-400" />
          <span className="size-2.5 shrink-0 rounded-full bg-emerald-400" />
          <span className="ml-2 min-w-0 truncate font-mono text-xs text-muted-foreground">
            codearena · assessments
          </span>
        </div>

        <div className="flex flex-col gap-2.5 p-4">
          {PREVIEW_ROWS.map(({ Icon, label, meta, status, tone }, index) => (
            <div
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/60 p-3.5 transition-colors hover:border-brand/40 hover:bg-background"
              key={label}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {label}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {meta}
                </span>
              </span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[0.6875rem] font-semibold ${TONE_CLASS[tone]}`}
              >
                {status}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 border-t border-border/70 bg-muted/40 px-4 py-3.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground">
            <CheckCircle2Icon className="size-4" />
          </span>
          <p className="min-w-0 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">
              Results released.
            </span>{" "}
            The candidate sees the score only after you publish it.
          </p>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <div className="relative overflow-hidden border-b border-border/70">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-mesh-brand"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-faint opacity-60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent"
      />

      <Container className="relative grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <div className="flex min-w-0 flex-col items-start gap-7">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand-soft px-3.5 py-1.5 font-mono text-xs font-semibold tracking-wide text-brand">
            <SparklesIcon className="size-3.5" />
            Developer assessment platform
          </p>

          <h1 className="max-w-xl font-heading text-4xl font-bold tracking-[-0.03em] text-balance sm:text-5xl lg:text-6xl">
            <span className="text-gradient-brand">Rigorous screening</span>{" "}
            without the scheduling overhead
          </h1>

          <p className="max-w-xl text-lg/relaxed text-muted-foreground text-pretty">
            CodeArena turns a question bank into a timed, graded assessment. You
            build the test, invite the candidate, and score the parts a machine
            cannot — in one shared workspace.
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <LinkButton
              className="w-full sm:w-auto"
              href="/register?role=RECRUITER"
              size="lg"
            >
              Start hiring
              <ArrowRightIcon data-icon="inline-end" />
            </LinkButton>
            <LinkButton
              className="w-full sm:w-auto"
              href="/how-it-works"
              size="lg"
              variant="outline"
            >
              See how it works
            </LinkButton>
          </div>

          <ul className="grid w-full gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {SIGNALS.map((signal) => (
              <li
                className="flex items-center gap-2 text-sm text-muted-foreground"
                key={signal}
              >
                <CheckCircle2Icon className="size-4 shrink-0 text-brand" />
                {signal}
              </li>
            ))}
          </ul>
        </div>

        <HeroPreview />
      </Container>
    </div>
  );
}
