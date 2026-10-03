import {
  CheckCircle2Icon,
  ClockIcon,
  TriangleAlertIcon,
  XCircleIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  PaymentProviderBadge,
  PaymentStatusBadge,
} from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { VALIDATION_MESSAGES } from "@/lib/messages";
import { pageMetadata } from "@/lib/seo";
import type { PaymentDetail } from "@/lib/types";
import { paymentService } from "@/service/payments";

export const metadata: Metadata = pageMetadata({
  title: "Payment received",
  description: "Result of your CodeArena credit purchase.",
  path: "/payment/success",
  noIndex: true,
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-2 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-sm break-all">{value}</dd>
    </div>
  );
}

function Receipt({ payment }: { payment: PaymentDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <dl className="flex flex-col border border-border bg-card p-4">
        <DetailRow label="Payment id" value={payment.id} />
        <DetailRow
          label="Status"
          value={PAYMENT_STATUS_LABELS[payment.status]}
        />
        <DetailRow label="Amount" value={formatCurrency(payment.amount)} />
        <DetailRow
          label="Credits granted"
          value={formatNumber(payment.creditsGranted)}
        />
        <DetailRow label="Provider reference" value={payment.providerRef} />
        <DetailRow label="Company" value={payment.company.name} />
        <DetailRow label="Created" value={formatDateTime(payment.createdAt)} />
      </dl>

      <div className="flex flex-wrap items-center gap-2">
        <PaymentStatusBadge value={payment.status} />
        <PaymentProviderBadge value={payment.provider} />
      </div>
    </div>
  );
}

function Outcome({
  Icon,
  title,
  body,
  children,
}: {
  Icon: typeof CheckCircle2Icon;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 border border-border bg-card p-6">
        <Icon className="size-6 text-accent-cyan" />
        <h1 className="font-heading text-lg font-semibold">{title}</h1>
        <p className="text-sm/relaxed text-muted-foreground">{body}</p>
      </div>
      {children}
    </div>
  );
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = await searchParams;
  const sessionId = (first(raw.session_id) ?? "").trim();

  const billingAction = (
    <div className="flex flex-wrap gap-2">
      <Button render={<Link href="/dashboard/recruiter/billing" />}>
        Go to billing
      </Button>
      <Button
        render={<Link href="/dashboard/recruiter/assessments" />}
        variant="outline"
      >
        Back to assessments
      </Button>
    </div>
  );

  if (sessionId === "") {
    return (
      <Outcome
        Icon={TriangleAlertIcon}
        title="No checkout session to check"
        body="This page is only meaningful when Stripe sends you back from checkout with a session id. Open it directly and there is nothing to confirm."
      >
        {billingAction}
      </Outcome>
    );
  }

  const history = await paymentService.history(1, 100);

  if (history.statusCode === 401) {
    return (
      <Outcome
        Icon={TriangleAlertIcon}
        title="Sign in to see your receipt"
        body={`Checkout for session ${sessionId} may have completed, but this page needs your session to read the payment record. Sign in and reload.`}
      >
        {billingAction}
      </Outcome>
    );
  }

  if (!history.success || !history.data) {
    return (
      <Outcome
        Icon={TriangleAlertIcon}
        title="Could not load your payments"
        body={history.message || VALIDATION_MESSAGES.unknown}
      >
        {billingAction}
      </Outcome>
    );
  }

  const match = history.data.items.find(
    (payment) => payment.providerRef === sessionId,
  );

  if (!match) {
    return (
      <Outcome
        Icon={ClockIcon}
        title="Still confirming your payment"
        body={`No payment in your most recent ${history.data.items.length} of ${history.data.meta.total} records matches session ${sessionId} yet. Stripe calls the API by webhook after you leave the checkout page, so a short delay is normal — reload in a moment.`}
      >
        {billingAction}
        {history.data.meta.totalPages > 1 ? (
          <p className="text-xs/relaxed text-muted-foreground">
            Your history has {history.data.meta.totalPages} pages and only the
            first {history.data.items.length} were searched, so an older
            checkout may live on another page of the billing history.
          </p>
        ) : null}
      </Outcome>
    );
  }

  const detail = await paymentService.detail(match.id);

  if (!detail.success || !detail.data) {
    return (
      <Outcome
        Icon={TriangleAlertIcon}
        title="Found the payment, could not read it"
        body={detail.message || VALIDATION_MESSAGES.unknown}
      >
        {billingAction}
      </Outcome>
    );
  }

  const payment = detail.data;

  if (payment.status === "PAID") {
    return (
      <Outcome
        Icon={CheckCircle2Icon}
        title="Payment confirmed"
        body={`${formatNumber(payment.creditsGranted)} credits have been added to your balance. They are spent one per accepted candidate invitation.`}
      >
        <Receipt payment={payment} />
        {billingAction}
      </Outcome>
    );
  }

  if (payment.status === "PENDING") {
    return (
      <Outcome
        Icon={ClockIcon}
        title="Payment received, credits not granted yet"
        body={`The payment record exists and is still PENDING. Credits are granted by the provider webhook, which has not fired for this session — this is not a failure, and no action is needed from you.`}
      >
        <Receipt payment={payment} />
        {billingAction}
      </Outcome>
    );
  }

  return (
    <Outcome
      Icon={XCircleIcon}
      title={
        payment.status === "FAILED" ? "Payment failed" : "Payment was refunded"
      }
      body={
        payment.status === "FAILED"
          ? `The provider recorded this payment as ${PAYMENT_STATUS_LABELS[payment.status].toLowerCase()}, so no credits were granted. You can try checkout again from the billing page.`
          : `This payment has been refunded, so the ${formatNumber(payment.creditsGranted)} credits it granted may no longer be on your balance.`
      }
    >
      <Receipt payment={payment} />
      {billingAction}
    </Outcome>
  );
}
