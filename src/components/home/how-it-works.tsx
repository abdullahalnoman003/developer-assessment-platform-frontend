import {
  CheckCircleIcon,
  FilePlusIcon,
  SendIcon,
  SquarePenIcon,
} from "lucide-react";
import {
  Container,
  Section,
  SectionHeading,
} from "@/components/home/page-hero";

const STEPS = [
  {
    Icon: FilePlusIcon,
    step: "01",
    title: "Build the assessment",
    body: "Create questions in your library, then assemble them into an assessment with a duration and a pass score. It stays a draft until you publish it.",
  },
  {
    Icon: SendIcon,
    step: "02",
    title: "Publish and invite",
    body: "Publishing opens the assessment for invitations. Each invited candidate sees it as pending until they accept, and you can revoke it at any point.",
  },
  {
    Icon: SquarePenIcon,
    step: "03",
    title: "They take the test",
    body: "The candidate accepts, starts an attempt against the deadline, and answers under a timer. Multiple choice scores are calculated on submit.",
  },
  {
    Icon: CheckCircleIcon,
    step: "04",
    title: "You score and release",
    body: "Submitted attempts enter your evaluation queue. Add scores and a note, then release the result — the candidate sees nothing until you do.",
  },
] as const;

export function Workflow() {
  return (
    <Section
      className="relative overflow-hidden border-y border-border/70 bg-muted/40"
      id="workflow"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-mesh-brand opacity-50"
      />
      <Container className="relative flex flex-col gap-12">
        <SectionHeading
          description="Four moves, and every one of them is a real state the backend stores — not a UI-only illusion."
          eyebrow="Lifecycle"
          title="From question bank to released result"
        />

        <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ Icon, step, title, body }) => (
            <li
              className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border/80 bg-card/80 p-6 shadow-sm backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
              key={step}
            >
              <span
                aria-hidden
                className="absolute -right-3 -top-5 font-heading text-7xl font-bold text-foreground/[0.04] transition-colors duration-300 group-hover:text-brand/10"
              >
                {step}
              </span>

              <span className="relative flex size-11 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow transition-transform duration-300 group-hover:scale-105">
                <Icon className="size-5" />
              </span>
              <h3 className="relative font-heading text-base font-bold tracking-tight">
                {title}
              </h3>
              <p className="relative text-sm/relaxed text-muted-foreground">
                {body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
