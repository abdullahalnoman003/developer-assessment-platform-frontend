import { ClockIcon, LifeBuoyIcon, MailIcon } from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "@/app/(publicSection)/_components/contact-form";
import {
  Container,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/home/page-hero";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Ask CodeArena a question. The form validates your message and opens it in your own email client.",
  path: "/contact",
});

const REASONS = [
  {
    Icon: LifeBuoyIcon,
    title: "Support",
    body: "Something in a dashboard is not behaving the way the state machine says it should. Tell us the role, the screen and what you clicked.",
  },
  {
    Icon: MailIcon,
    title: "Pricing and credits",
    body: "Questions about a credit pack, a Stripe test checkout, or which plan fits the number of candidates you expect to invite.",
  },
  {
    Icon: ClockIcon,
    title: "Everything else",
    body: "Feedback on a screen, a workflow you wish existed, or a question about how a particular status behaves.",
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <PageHero
        description="There is no ticket queue behind this page, so the honest version is a validated message handed to your own email client. You keep a copy, we get a real inbox message."
        eyebrow="Contact"
        title="Talk to a human"
      />

      <Section>
        <Container className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="animate-fade-up">
            <ContactForm />
          </div>

          <div className="flex flex-col gap-4">
            <Card className="animate-fade-up transition-transform duration-300 hover:-translate-y-1">
              <CardContent className="flex flex-col gap-3">
                <h2 className="font-heading text-base font-bold tracking-tight">
                  Prefer to write directly?
                </h2>
                <p className="text-sm/relaxed text-muted-foreground">
                  Our support inbox is{" "}
                  <a
                    className="rounded font-semibold text-brand underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                    href={`mailto:${SUPPORT_EMAIL}`}
                  >
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </p>
                <LinkButton href={`mailto:${SUPPORT_EMAIL}`} variant="outline">
                  <MailIcon data-icon="inline-start" />
                  Open mail client
                </LinkButton>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              {REASONS.map(({ Icon, title, body }, index) => (
                <Card
                  className="animate-fade-up transition-transform duration-300 hover:-translate-y-1"
                  key={title}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <CardContent className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand ring-1 ring-brand/15">
                      <Icon className="size-4" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-heading text-sm font-bold tracking-tight">
                        {title}
                      </h3>
                      <p className="text-sm/relaxed text-muted-foreground">
                        {body}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border/70 bg-muted/40">
        <Container className="flex flex-col gap-6">
          <SectionHeading
            align="left"
            description="Before you write, these two pages answer most of what arrives in that inbox."
            eyebrow="Worth reading"
            title="Already answered somewhere?"
          />
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/faq" variant="outline">
              Read the FAQ
            </LinkButton>
            <LinkButton href="/how-it-works" variant="outline">
              See the assessment lifecycle
            </LinkButton>
          </div>
        </Container>
      </Section>
    </>
  );
}
