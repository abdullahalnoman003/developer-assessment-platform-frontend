"use client";

import { CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import toast from "react-hot-toast";
import { initiatePaymentAction } from "@/app/(recruiterSection)/_actions/recruiter";
import { InlineNotice } from "@/components/shared/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { CREDIT_PLANS } from "@/lib/constants";
import { formatUsdCents } from "@/lib/format";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import type { ActionState } from "@/lib/types";
import { IDLE_ACTION_STATE } from "@/lib/types";

function BuyButton({ featured }: { featured: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      className="w-full"
      type="submit"
      variant={featured ? "default" : "outline"}
    >
      {pending ? <Spinner className="size-3.5" /> : null}
      {pending ? "Opening Stripe" : "Buy credits"}
    </Button>
  );
}

function PlanCheckoutCard({ plan }: { plan: (typeof CREDIT_PLANS)[number] }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    initiatePaymentAction,
    IDLE_ACTION_STATE,
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status === "error") {
      toast.error(state.message || VALIDATION_MESSAGES.unknown);
    }
  }, [state]);

  /**
   * Stripe is a full-page hand-off, so the browser is sent to the hosted
   * checkout with `location.assign` rather than a router navigation. A router
   * push would try to resolve an off-origin path as a Next.js route and fail.
   *
   * The pending payment row is created server-side before the redirect, so a
   * refresh is queued in case the user comes back without completing checkout.
   */
  useEffect(() => {
    if (state.status === "success" && state.externalUrl) {
      router.refresh();
      window.location.assign(state.externalUrl);
    }
  }, [state, router]);

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
          <h2 className="font-heading text-base font-semibold">{plan.name}</h2>
          {plan.featured ? <Badge>Most picked</Badge> : null}
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-heading text-3xl font-semibold text-gradient-brand">
            {formatUsdCents(plan.priceUsdCents)}
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

        {state.status === "error" ? (
          <InlineNotice
            body={state.message}
            title="Checkout failed"
            tone="danger"
          />
        ) : null}

        <form action={formAction} className="mt-auto">
          <input name="plan" type="hidden" value={plan.id} />
          <BuyButton featured={plan.featured} />
        </form>
      </CardContent>
    </Card>
  );
}

export function BillingPlanCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {CREDIT_PLANS.map((plan) => (
        <PlanCheckoutCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}
