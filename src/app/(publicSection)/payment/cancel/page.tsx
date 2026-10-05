import { XCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/link-button";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Checkout cancelled",
  description: "Your CodeArena credit purchase was cancelled.",
  path: "/payment/cancel",
  noIndex: true,
});

export default function PaymentCancelPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
        <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand ring-1 ring-brand/15">
          <XCircleIcon className="size-5" />
        </span>
        <h1 className="font-heading text-xl font-bold tracking-tight">
          Checkout cancelled
        </h1>
        <p className="text-base/relaxed text-muted-foreground">
          Nothing was charged and no credits were added. Cancelling the Stripe
          checkout does not delete the payment record the API created when
          checkout started — it stays PENDING in your billing history until the
          provider marks it failed.
        </p>
        <p className="text-base/relaxed text-muted-foreground">
          You can buy credits whenever you are ready; nothing about your
          assessments or invitations changes in the meantime.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <LinkButton href="/dashboard/recruiter/billing">
          Back to billing
        </LinkButton>
        <LinkButton href="/dashboard/recruiter/assessments" variant="outline">
          Back to assessments
        </LinkButton>
      </div>
    </div>
  );
}
