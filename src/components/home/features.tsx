import {
  ClipboardCheckIcon,
  FileQuestionIcon,
  GaugeIcon,
  LayersIcon,
  LockIcon,
  UsersIcon,
} from "lucide-react";
import {
  Container,
  Section,
  SectionHeading,
} from "@/components/home/page-hero";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    Icon: FileQuestionIcon,
    title: "Reusable question bank",
    body: "Multiple choice, written and coding questions, each with a difficulty, a type, and the correct answer stored server-side. Reuse a question across as many assessments as you need.",
  },
  {
    Icon: ClipboardCheckIcon,
    title: "Timed attempts with autosave",
    body: "Candidates start an attempt against a deadline. Every answer is saved as they type, and multiple choice questions are graded by the backend the moment an attempt is submitted.",
  },
  {
    Icon: UsersIcon,
    title: "Invite by email",
    body: "Publishing an assessment lets you invite candidates directly. Each invitation moves through accepted, declined, revoked and expired, so you always know the real state.",
  },
  {
    Icon: GaugeIcon,
    title: "Evaluation workspace",
    body: "Written and coding answers land in a grading queue with the candidate's answers side by side. Score them, leave a note, and release the result when you are ready.",
  },
  {
    Icon: LockIcon,
    title: "Results stay under your control",
    body: "A candidate cannot see a score until you release it. Until then the attempt is visible to them as in progress, so a partially marked assessment never leaks.",
  },
  {
    Icon: LayersIcon,
    title: "Credits that match reality",
    body: "Invitation credits are stored on the company record and displayed exactly as the backend reports them. Buy a pack when you need it — nothing is simulated in the browser.",
  },
] as const;

export function Features() {
  return (
    <Section id="features">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          description="Everything the assessment lifecycle needs, and nothing that pretends to be smarter than it is."
          eyebrow="Capabilities"
          title="Built around the real assessment flow"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, body }) => (
            <Card className="h-full" key={title}>
              <CardContent className="flex h-full flex-col gap-3">
                <span className="flex size-9 items-center justify-center border border-primary/40 bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <h3 className="font-heading text-sm font-semibold">{title}</h3>
                <p className="text-sm/relaxed text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
