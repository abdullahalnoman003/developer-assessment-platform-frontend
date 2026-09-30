import {
  CheckCircleIcon,
  FilePlusIcon,
  SendIcon,
  SquarePenIcon,
} from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/home/page-hero";

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
    <Section className="border-y border-border bg-muted/30" id="workflow">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          description="Four moves, and every one of them is a real state the backend stores — not a UI-only illusion."
          eyebrow="Lifecycle"
          title="From question bank to released result"
        />

        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ Icon, step, title, body }) => (
            <li
              className="flex h-full flex-col gap-3 border border-border bg-card p-5"
              key={step}
            >
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center border border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan">
                  <Icon className="size-4" />
                </span>
                <span className="font-mono text-lg text-muted-foreground/50">
                  {step}
                </span>
              </div>
              <h3 className="font-heading text-sm font-semibold">{title}</h3>
              <p className="text-sm/relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
