import type { Metadata } from "next";
import { Cta } from "@/components/home/cta";
import { Faq } from "@/components/home/faq";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { Workflow } from "@/components/home/how-it-works";
import {
  Container,
  Section,
  SectionHeading,
} from "@/components/home/page-hero";
import { PricingTeaser } from "@/components/home/pricing";
import { Roles } from "@/components/home/roles";
import { Stats } from "@/components/home/stats";
import { LinkButton } from "@/components/ui/link-button";
import { APP_TAGLINE } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Technical assessments without the scheduling overhead",
  description: APP_TAGLINE,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <Workflow />
      <Roles />

      <Section id="faq">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            description="The questions recruiters and candidates ask most, answered in terms the API actually enforces."
            eyebrow="FAQ"
            title="Before you sign in"
          />
          <Faq limit={4} />
          <div className="flex justify-center">
            <LinkButton href="/faq" size="lg" variant="outline">
              Browse all questions
            </LinkButton>
          </div>
        </Container>
      </Section>

      <PricingTeaser />
      <Cta />
    </>
  );
}
