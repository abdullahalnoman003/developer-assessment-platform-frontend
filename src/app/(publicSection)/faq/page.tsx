import { MailIcon } from "lucide-react";
import type { Metadata } from "next";
import { Faq } from "@/components/home/faq";
import { Container, PageHero, Section } from "@/components/home/page-hero";
import { LinkButton } from "@/components/ui/link-button";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description:
    "Questions about CodeArena assessments, invitations, credits, attempts and accounts, answered in terms the API enforces.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <PageHero
        description="Grouped by the part of the lifecycle they belong to. If something is still unclear, the contact page turns your question into an email."
        eyebrow="FAQ"
        title="Frequently asked questions"
      />

      <Section>
        <Container className="flex flex-col gap-10">
          <Faq />
        </Container>
      </Section>

      <Section className="border-t border-border/70 bg-muted/40">
        <Container className="flex flex-col items-center gap-5 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Still not answered?
          </h2>
          <p className="max-w-xl text-base/relaxed text-muted-foreground text-pretty">
            Ask a real question. The contact form validates what you type and
            opens an email addressed to our support inbox — nothing is stored on
            a server that does not exist.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <LinkButton href="/contact" size="lg">
              <MailIcon data-icon="inline-start" />
              Contact support
            </LinkButton>
            <LinkButton
              href={`mailto:${SUPPORT_EMAIL}`}
              size="lg"
              variant="outline"
            >
              {SUPPORT_EMAIL}
            </LinkButton>
          </div>
        </Container>
      </Section>
    </>
  );
}
