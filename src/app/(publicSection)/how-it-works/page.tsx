import type { Metadata } from "next";
import {
  CheckCircleIcon,
  ClipboardCheckIcon,
  FilePlusIcon,
  SendIcon,
  SquarePenIcon,
  XCircleIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Container,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/home/page-hero";
import { Cta } from "@/components/home/cta";
import { Workflow } from "@/components/home/how-it-works";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "How it works",
  description:
    "The full CodeArena assessment lifecycle: build, publish, invite, attempt, evaluate, release.",
  path: "/how-it-works",
});

const RULES = [
  {
    Icon: CheckCircleIcon,
    title: "A draft can be edited freely",
    body: "Question order, duration and pass score are all editable while the assessment is a draft. Once it is published, treat it as frozen for that round.",
  },
  {
    Icon: XCircleIcon,
    title: "One invitation, one attempt",
    body: "The backend refuses to start a second attempt for the same invitation. A revoked or expired invitation cannot be started at all.",
  },
  {
    Icon: SquarePenIcon,
    title: "Answers are saved as you go",
    body: "Every answer is persisted while the candidate types, so a closed tab or a dropped connection does not lose an hour of work.",
  },
  {
    Icon: ClipboardCheckIcon,
    title: "Grading happens once, on submit",
    body: "Multiple choice is scored by the server at submission. Written and coding answers wait for a human score and a note before anything is released.",
  },
] as const;

const LIFECYCLE = [
  {
    Icon: FilePlusIcon,
    title: "Assessment states",
    items: [
      "Draft — editable, invisible to candidates",
      "Published — open to invitations and attempts",
      "Closed — no new invitations, existing attempts finish",
      "Archived — kept for the record, out of the way",
    ],
  },
  {
    Icon: SendIcon,
    title: "Invitation states",
    items: [
      "Pending — waiting on the candidate",
      "Accepted — the assessment is startable",
      "Declined — the candidate said no",
      "Expired — the window closed",
    ],
  },
  {
    Icon: ClipboardCheckIcon,
    title: "Attempt states",
    items: [
      "Not started — invitation accepted, nothing begun",
      "In progress — live, autosaving, counting down",
      "Submitted — answers locked, MCQ scored",
      "Evaluated — every answer has a score",
      "Expired — the deadline passed first",
    ],
  },
] as const;

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        description="No magic and no shortcuts: four steps, five attempt states, and one deliberate separation between grading someone and telling them about it."
        eyebrow="How it works"
        title="The lifecycle, state by state"
      />

      <Workflow />

      <Section className="border-b border-border">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            align="left"
            description="Every state below is stored on the record, which is why the dashboards can filter on them at all."
            eyebrow="States"
            title="What the API is actually holding"
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {LIFECYCLE.map((column) => (
              <Card className="h-full" key={column.title}>
                <CardContent className="flex h-full flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center border border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan">
                      <column.Icon className="size-4" />
                    </span>
                    <h3 className="font-heading text-sm font-semibold">
                      {column.title}
                    </h3>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {column.items.map((item) => (
                      <li
                        className="flex items-start gap-2 text-sm/relaxed text-muted-foreground"
                        key={item}
                      >
                        <span className="mt-2 size-1 shrink-0 bg-muted-foreground/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-col gap-10">
          <SectionHeading
            align="left"
            description="The rules that surprise people, written down once."
            eyebrow="Rules"
            title="Worth knowing before your first round"
          />

          <div className="grid gap-4 md:grid-cols-2">
            {RULES.map(({ Icon, title, body }) => (
              <Card className="h-full" key={title}>
                <CardContent className="flex h-full flex-col gap-3">
                  <span className="flex size-8 items-center justify-center border border-primary/40 bg-primary/10 text-primary">
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

      <Cta />
    </>
  );
}
