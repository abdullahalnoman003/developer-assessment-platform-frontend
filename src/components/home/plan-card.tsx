import { CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { CREDIT_PLANS } from "@/lib/constants";
import { formatUsdCents } from "@/lib/format";
import { cn } from "@/lib/utils";

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
      className={cn(
        "group relative flex h-full flex-col overflow-hidden transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:shadow-lg",
        plan.featured
          ? "border-brand/50 shadow-lg ring-1 ring-brand/20"
          : "hover:border-brand/30",
      )}
    >
      {plan.featured ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-brand opacity-20 blur-3xl"
        />
      ) : null}

      <CardContent className="relative flex h-full flex-col gap-6">
        <div className="flex items-center justify-between gap-2">
          <Heading className="font-heading text-lg font-bold tracking-tight">
            {plan.name}
          </Heading>
          {plan.featured ? <Badge>Most picked</Badge> : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="font-heading text-4xl font-bold tracking-tight text-gradient-brand">
            {price}
          </p>
          <p className="text-sm/relaxed text-muted-foreground">
            {plan.credits} credits · {perCredit} per credit
          </p>
        </div>

        <ul className="flex flex-col gap-3 border-t border-border pt-6">
          {plan.highlight.map((item) => (
            <li
              className="flex items-start gap-2.5 text-sm/relaxed text-muted-foreground"
              key={item}
            >
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <CheckIcon className="size-2.5" />
              </span>
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
