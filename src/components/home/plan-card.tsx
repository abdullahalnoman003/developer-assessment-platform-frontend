import { CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { CREDIT_PLANS } from "@/lib/constants";
import { formatUsdCents } from "@/lib/format";

export function PlanCard({
  planId,
  headingLevel = 3,
  cta = true,
}: {
  planId: (typeof CREDIT_PLANS)[number]["id"];
  headingLevel?: 2 | 3;
  cta?: boolean;
}) {
  const plan = CREDIT_PLANS.find((candidate) => candidate.id === planId);

  if (!plan) {
    return null;
  }

  const Heading = headingLevel === 2 ? "h2" : "h3";
  const price = formatUsdCents(plan.priceUsdCents);
  const perCredit = (plan.priceUsdCents / 100 / plan.credits).toFixed(2);

  return (
    <Card
      className={[
        "flex h-full flex-col",
        plan.featured ? "border-primary/60 shadow-xs" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <CardContent className="flex h-full flex-col gap-5">
        <div className="flex items-center justify-between gap-2">
          <Heading className="font-heading text-base font-semibold">
            {plan.name}
          </Heading>
          {plan.featured ? <Badge>Most picked</Badge> : null}
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-heading text-3xl font-semibold text-gradient-brand">
            {price}
          </p>
          <p className="text-xs/relaxed text-muted-foreground">
            {plan.credits} credits · {perCredit} per credit
          </p>
        </div>

        <ul className="flex flex-col gap-2 border-t border-border pt-5">
          {plan.highlight.map((item) => (
            <li
              className="flex items-start gap-2 text-sm/relaxed text-muted-foreground"
              key={item}
            >
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-accent-cyan" />
              {item}
            </li>
          ))}
        </ul>

        {cta ? (
          <div className="mt-auto">
            <LinkButton
              className="w-full"
              href="/register?role=RECRUITER"
              variant={plan.featured ? "default" : "outline"}
            >
              Create account
            </LinkButton>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Sign in first to buy credits.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
