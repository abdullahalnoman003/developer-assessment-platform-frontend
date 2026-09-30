import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Container, Section, SectionHeading } from "@/components/home/page-hero";
import { PlanCard } from "@/components/home/plan-card";
import { CREDIT_PLANS } from "@/lib/constants";

export function PricingTeaser() {
  return (
    <Section className="border-t border-border" id="pricing">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          description="Three credit packs, priced in US dollars, charged through Stripe test mode. Credits land on your company record and stay there until the backend says otherwise."
          eyebrow="Pricing"
          title="Pay for credits, not seats"
        />

        <div className="grid gap-4 md:grid-cols-3">
          {CREDIT_PLANS.map((plan) => (
            <PlanCard cta={false} key={plan.id} planId={plan.id} />
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
            href="/pricing"
          >
            Read the billing details
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </p>
      </Container>
    </Section>
  );
}
