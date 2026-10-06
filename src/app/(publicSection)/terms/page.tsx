import { MailIcon } from "lucide-react";
import type { Metadata } from "next";
import { Cta } from "@/components/home/cta";
import { Container, PageHero, Section } from "@/components/home/page-hero";
import { LinkButton } from "@/components/ui/link-button";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of service",
  description:
    "The terms that apply when you use CodeArena, written in plain language.",
  path: "/terms",
});

const SECTIONS = [
  {
    heading: "Using the platform",
    body: [
      "You need an account to reach anything beyond the public pages. You are responsible for what happens under your account, including the questions you publish and the candidates you invite.",
      "You may not use CodeArena to store or distribute content you do not have the right to use. Resumes, logos and question images are supplied by you as links, so make sure you are allowed to share them.",
    ],
  },
  {
    heading: "Accounts and access",
    body: [
      "Sign-in sessions are held in an httpOnly cookie and are not readable by client-side scripts. Signing out clears the session on this device.",
      "An administrator may suspend an account. A suspended account cannot sign in, and its sessions stop working. If you think that is a mistake, contact us.",
      "Sample accounts are shared. Do not put anything you would mind another visitor seeing into them.",
    ],
  },
  {
    heading: "Assessments and candidates",
    body: [
      "You own the content of the assessments you create. Publishing makes an assessment available to the candidates you invite, and you decide when a result is released.",
      "Candidates keep control of their own answers. An attempt may only be started once per invitation, and a revoked or expired invitation cannot be started.",
    ],
  },
  {
    heading: "Credits and payments",
    body: [
      "Credit balances belong to a company record, not to an individual. The balance you see is the balance the server reports.",
      "Payments run through Stripe in test mode for this deployment, so no real money moves. A completed payment adds credits to the company record.",
      "Plan pricing is the pricing shown on the pricing page. We may change it, and the price at the moment of checkout is the price you pay.",
    ],
  },
  {
    heading: "No warranty",
    body: [
      "CodeArena is provided as is. We aim for it to be correct and available, but we do not promise uninterrupted service, and we do not promise that it will fit a hiring process perfectly.",
      "To the extent the law allows, we are not liable for decisions you make using assessment results.",
    ],
  },
  {
    heading: "Changes",
    body: [
      "These terms can change. When they do, the version on this page is the version that applies.",
    ],
  },
] as const;

export default function TermsPage() {
  return (
    <>
      <PageHero
        description="Short, plain-language terms. No surprise clauses, and nothing that depends on a policy page we have not written yet."
        eyebrow="Terms"
        title="Terms of service"
      />

      <Section>
        <Container className="flex max-w-3xl flex-col gap-12">
          {SECTIONS.map((section, index) => (
            <div
              className="flex animate-fade-up flex-col gap-3"
              key={section.heading}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold tracking-[0.2em] text-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="font-heading text-xl font-bold tracking-tight">
                  {section.heading}
                </h2>
              </div>
              {section.body.map((paragraph) => (
                <p
                  className="text-base/relaxed text-muted-foreground"
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ))}

          <div className="flex flex-col gap-3 border-t border-border/70 pt-6">
            <h2 className="font-heading text-xl font-bold tracking-tight">
              Contact
            </h2>
            <p className="text-base/relaxed text-muted-foreground">
              Questions about these terms go to{" "}
              <a
                className="rounded font-semibold text-brand underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                href={`mailto:${SUPPORT_EMAIL}`}
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
            <div>
              <LinkButton href="/contact" variant="outline">
                <MailIcon data-icon="inline-start" />
                Contact support
              </LinkButton>
            </div>
          </div>
        </Container>
      </Section>

      <Cta />
    </>
  );
}
