import {
  ArrowRightIcon,
  BriefcaseBusinessIcon,
  CheckIcon,
  Code2Icon,
} from "lucide-react";
import {
  Container,
  Section,
  SectionHeading,
} from "@/components/home/page-hero";
import { LinkButton } from "@/components/ui/link-button";
import { cn } from "@/lib/utils";

const AUDIENCES = [
  {
    Icon: BriefcaseBusinessIcon,
    eyebrow: "For recruiters",
    title: "Run the whole round from one desk",
    body: "Draft the assessment, control who sits it, and decide when the scores leave the room. Every action lands as a state your whole hiring team can see.",
    points: [
      "Assemble timed assessments from a reusable question bank",
      "Invite by email and track accepted, declined, revoked and expired",
      "Grade written and coding answers side by side in one queue",
      "Release results only when the evaluation is finished",
    ],
    href: "/register?role=RECRUITER",
    cta: "Create a recruiter account",
    featured: true,
  },
  {
    Icon: Code2Icon,
    eyebrow: "For candidates",
    title: "One link, one deadline, one result",
    body: "Accept an invitation, work against a real timer with autosave, and see your score only after the recruiter releases it — no guessing in between.",
    points: [
      "Accept or decline every invitation on your own schedule",
      "Attempt under a countdown with answers saved as you type",
      "Multiple choice questions are graded the moment you submit",
      "Released results show the score, feedback and final status",
    ],
    href: "/register?role=CANDIDATE",
    cta: "Create a candidate account",
    featured: false,
  },
] as const;

export function Roles() {
  return (
    <Section className="border-b border-border/70" id="audiences">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          description="The same attempt, seen from both ends of the table — each side gets its own workspace, its own rules, and no surprises."
          eyebrow="Who it is for"
          title="Two sides, one shared workspace"
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {AUDIENCES.map(
            (
              { Icon, eyebrow, title, body, points, href, cta, featured },
              index,
            ) => (
              <div
                className={cn(
                  "group relative flex h-full animate-fade-up flex-col overflow-hidden rounded-3xl border bg-card p-6 shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8",
                  featured
                    ? "border-brand/30"
                    : "border-border/80 hover:border-brand/40",
                )}
                key={eyebrow}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-24 right-0 h-48 w-2/3 bg-gradient-brand opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-15"
                />

                <div className="relative flex flex-col gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow transition-transform duration-300 group-hover:scale-105">
                    <Icon className="size-5" />
                  </span>
                  <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.16em] text-brand uppercase">
                    {eyebrow}
                  </p>
                  <h3 className="font-heading text-xl font-bold tracking-[-0.01em] sm:text-2xl">
                    {title}
                  </h3>
                  <p className="text-sm/relaxed text-muted-foreground text-pretty">
                    {body}
                  </p>
                </div>

                <ul className="relative mt-5 flex flex-col gap-2.5 border-t border-border/70 pt-5">
                  {points.map((point) => (
                    <li
                      className="flex items-start gap-2.5 text-sm/relaxed text-muted-foreground"
                      key={point}
                    >
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                        <CheckIcon className="size-2.5" />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>

                <div className="relative mt-auto pt-6">
                  <LinkButton
                    className="w-full sm:w-auto"
                    href={href}
                    variant={featured ? "default" : "outline"}
                  >
                    {cta}
                    <ArrowRightIcon data-icon="inline-end" />
                  </LinkButton>
                </div>
              </div>
            ),
          )}
        </div>

        <p className="mx-auto max-w-2xl text-center text-xs/relaxed text-muted-foreground">
          Admin accounts run in the background — user status, payments and audit
          logs, visible only to the platform team.
        </p>
      </Container>
    </Section>
  );
}
