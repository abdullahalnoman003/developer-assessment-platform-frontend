import { ArrowRightIcon } from "lucide-react";
import {
  Container,
  Section,
  SectionHeading,
} from "@/components/home/page-hero";
import { PlanCard } from "@/components/home/plan-card";
import { LinkButton } from "@/components/ui/link-button";
import { CREDIT_PLANS } from "@/lib/constants";

export function PricingTeaser() {
  return (
    <Section id="pricing">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          description="Three credit packs, priced in US dollars, charged through Stripe test mode. Credits land on your company record and stay there until the backend says otherwise."
          eyebrow="Pricing"
          title="Pay for credits, not seats"
        />

        <div className="grid gap-6 md:grid-cols-3">
          {CREDIT_PLANS.map((plan) => (
            <PlanCard cta={false} key={plan.id} planId={plan.id} />
          ))}
        </div>

        <div className="flex justify-center">
          <LinkButton href="/pricing" size="lg" variant="outline">
            Read the billing details
            <ArrowRightIcon data-icon="inline-end" />
          </LinkButton>
        </div>
      </Container>
    </Section>
  );
}
