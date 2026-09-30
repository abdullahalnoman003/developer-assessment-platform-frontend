import type { Metadata } from "next";
import { Container, Section, SectionHeading } from "@/components/home/page-hero";
import { Cta } from "@/components/home/cta";
import { Faq } from "@/components/home/faq";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { PricingTeaser } from "@/components/home/pricing";
import { Stats } from "@/components/home/stats";
import { Workflow } from "@/components/home/how-it-works";
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

      <Section id="faq">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            description="The questions recruiters and candidates ask most, answered in terms the API actually enforces."
            eyebrow="FAQ"
            title="Before you sign in"
          />
          <Faq limit={4} />
        </Container>
      </Section>

      <PricingTeaser />
      <Cta />
    </>
  );
}
