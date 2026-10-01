import { CreditCardIcon, ShieldCheckIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Container,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/home/page-hero";
import { PlanCard } from "@/components/home/plan-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
          <div className="grid gap-4 md:grid-cols-3">
            {CREDIT_PLANS.map((plan) => (
              <PlanCard key={plan.id} planId={plan.id} />
            ))}
          </div>

          <p className="text-center text-xs/relaxed text-muted-foreground">
            The per-credit figure is the pack price divided by the number of
            credits, so the Enterprise pack is the cheapest credit and the
            Starter pack is the most expensive one.
          </p>
        </Container>
      </Section>

      <Section className="border-y border-border bg-muted/30">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            align="left"
            description="Two things worth knowing before you start a checkout."
            eyebrow="Billing"
            title="How the money path works"
          />

          <div className="grid gap-4 md:grid-cols-2">
            {BILLING_NOTES.map(({ Icon, title, body }) => (
              <Card className="h-full" key={title}>
                <CardContent className="flex h-full flex-col gap-3">
                  <span className="flex size-8 items-center justify-center border border-primary/40 bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <h3 className="font-heading text-sm font-semibold">
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
        <Container className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-heading text-lg font-semibold">
            Where do I actually buy them?
          </h2>
          <p className="max-w-xl text-sm/relaxed text-muted-foreground text-pretty">
            Billing lives behind sign-in, because a payment needs a company
            record to attach the credits to. Create an account, set up your
            company, then start a checkout from the company dashboard.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button render={<Link href="/register?role=RECRUITER" />}>
              Create a recruiter account
            </Button>
            <Button render={<Link href="/login" />} variant="outline">
              Sign in to an existing account
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
