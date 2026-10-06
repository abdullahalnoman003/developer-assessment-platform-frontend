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
    <div className="mx-auto flex w-full max-w-2xl animate-fade-up flex-col gap-5 px-4 py-14 sm:px-6 sm:py-20">
      <div className="flex flex-col gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 shadow-sm sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <XCircleIcon className="size-6" />
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
            Checkout cancelled
          </h1>
          <p className="text-sm/relaxed text-muted-foreground sm:text-base">
            Nothing was charged and no credits were added. Cancelling the Stripe
            checkout does not delete the payment record the API created when
            checkout started — it stays PENDING in your billing history until
            the provider marks it failed.
          </p>
          <p className="text-sm/relaxed text-muted-foreground sm:text-base">
            You can buy credits whenever you are ready; nothing about your
            assessments or invitations changes in the meantime.
          </p>
        </div>
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
