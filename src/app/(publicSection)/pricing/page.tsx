import { CreditCardIcon, ShieldCheckIcon } from "lucide-react";
import type { Metadata } from "next";
import {
  Container,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/home/page-hero";
import { PlanCard } from "@/components/home/plan-card";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { CREDIT_PLANS } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description:
    "Three CodeArena credit packs, priced in US dollars and charged through Stripe test mode.",
  path: "/pricing",
});

const BILLING_NOTES = [
  {
    Icon: CreditCardIcon,
    title: "Credits are the only unit",
    body: "There are no per-seat subscriptions. You buy a pack of credits against a company record, and the remaining balance is what the dashboard shows.",
  },
  {
    Icon: ShieldCheckIcon,
    title: "Checkout runs in test mode",
    body: "Payments are handled by Stripe in test mode for this deployment, so no real money moves and no card details reach our servers. Use Stripe's test card numbers.",
  },
] as const;

export default function PricingPage() {
  return (
    <>
      <PageHero
        description="Three packs, priced in US dollars. Credits are added to your company record when a payment completes, and the balance is read back from the API on every dashboard visit."
        eyebrow="Pricing"
        title="Buy credits, not seats"
      />

      <Section>
        <Container className="flex flex-col gap-10">
          <h2 className="sr-only">Credit packs</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CREDIT_PLANS.map((plan, index) => (
              <div
                className="h-full animate-fade-up"
                key={plan.id}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <PlanCard planId={plan.id} />
              </div>
            ))}
          </div>

          <p className="text-center text-sm/relaxed text-muted-foreground">
            The per-credit figure is the pack price divided by the number of
            credits, so the Enterprise pack is the cheapest credit and the
            Starter pack is the most expensive one.
          </p>
        </Container>
      </Section>

      <Section className="border-y border-border/70 bg-muted/40">
        <Container className="flex flex-col gap-12">
          <SectionHeading
            align="left"
            description="Two things worth knowing before you start a checkout."
            eyebrow="Billing"
            title="How the money path works"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            {BILLING_NOTES.map(({ Icon, title, body }) => (
              <Card
                className="h-full animate-fade-up transition-transform duration-300 hover:-translate-y-1"
                key={title}
              >
                <CardContent className="flex h-full flex-col gap-4">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand ring-1 ring-brand/15">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="font-heading text-base font-bold tracking-tight">
                    {title}
                  </h3>
                  <p className="text-sm/relaxed text-muted-foreground">
                    {body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-col items-center gap-5 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Where do I actually buy them?
          </h2>
          <p className="max-w-xl text-base/relaxed text-muted-foreground text-pretty">
            Billing lives behind sign-in, because a payment needs a company
            record to attach the credits to. Create an account, set up your
            company, then start a checkout from the company dashboard.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <LinkButton href="/register?role=RECRUITER" size="lg">
              Create a recruiter account
            </LinkButton>
            <LinkButton href="/login" size="lg" variant="outline">
              Sign in to an existing account
            </LinkButton>
          </div>
        </Container>
      </Section>
    </>
  );
}
