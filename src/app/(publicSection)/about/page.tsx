import type { Metadata } from "next";
import { Cta } from "@/components/home/cta";
import {
  Container,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/home/page-hero";
import { Card, CardContent } from "@/components/ui/card";
import { APP_NAME, APP_TAGLINE, SUPPORT_EMAIL } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: `What ${APP_NAME} is, who it is for, and the rules the platform actually enforces.`,
  path: "/about",
});

const AUDIENCES = [
  {
    role: "Recruiters",
    body: "Own the company workspace. Build a question bank, assemble assessments, invite candidates, and decide when a result is released.",
  },
  {
    role: "Candidates",
    body: "Accept an invitation, work through a timed attempt, and see the result only after the recruiter releases it. No company profile needed.",
  },
  {
    role: "Admins",
    body: "Keep the platform honest: manage user status, inspect companies, and follow the audit trail of privileged actions.",
  },
] as const;

const PRINCIPLES = [
  {
    title: "The server owns the truth",
    body: "Every status, score and credit balance you see is read from the API. Nothing is invented in the browser to make a screen look fuller than it is.",
  },
  {
    title: "States are explicit",
    body: "Draft, published, closed, archived. Pending, accepted, declined, expired. Not started, in progress, submitted, evaluated, expired. A screen never guesses where something is in the lifecycle.",
  },
  {
    title: "Release is a decision",
    body: "Grading a written answer is not the same as telling the candidate about it. Those are two separate actions in CodeArena, on purpose.",
  },
  {
    title: "Uploads are URLs",
    body: "Resumes, company logos and question images are links, not files. That keeps the platform honest about what it does and does not do.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        description="CodeArena is an assessment workspace for engineering hiring. It covers the whole loop from question bank to released result, and it refuses to pretend it does more than that."
        eyebrow="About"
        title="Screening built on states you can audit"
      >
        <p className="text-sm text-muted-foreground">
          {APP_NAME} · {APP_TAGLINE}
        </p>
      </PageHero>

      <Section>
        <Container className="flex flex-col gap-10">
          <SectionHeading
            align="left"
            description="Three roles share one set of records. Each one sees the slice that belongs to it, and the API enforces the boundary."
            eyebrow="Who it is for"
            title="One platform, three vantage points"
          />

          <div className="grid gap-4 md:grid-cols-3">
            {AUDIENCES.map((audience) => (
              <Card className="h-full" key={audience.role}>
                <CardContent className="flex h-full flex-col gap-2">
                  <h3 className="font-heading text-sm font-semibold">
                    {audience.role}
                  </h3>
                  <p className="text-sm/relaxed text-muted-foreground">
                    {audience.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-y border-border bg-muted/30">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            align="left"
            description="Four commitments that shaped how the screens are built."
            eyebrow="Principles"
            title="What we will not compromise on"
          />

          <div className="grid gap-4 md:grid-cols-2">
            {PRINCIPLES.map((principle) => (
              <Card className="h-full" key={principle.title}>
                <CardContent className="flex h-full flex-col gap-2">
                  <h3 className="font-heading text-sm font-semibold">
                    {principle.title}
                  </h3>
                  <p className="text-sm/relaxed text-muted-foreground">
                    {principle.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-col gap-4">
          <SectionHeading
            align="left"
            eyebrow="Questions"
            title="Something not covered here?"
          />
          <p className="max-w-2xl text-sm/relaxed text-muted-foreground">
            The contact page builds an email to{" "}
            <a
              className="underline underline-offset-4 hover:text-foreground"
              href={`mailto:${SUPPORT_EMAIL}`}
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            from what you type, so you can send a real question instead of
            filling in a form that goes nowhere.
          </p>
        </Container>
      </Section>

      <Cta />
    </>
  );
}
